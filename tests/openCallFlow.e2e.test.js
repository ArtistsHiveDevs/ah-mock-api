/**
 * Test e2e (API-level, sin browser) del flujo de negocio "Open Call":
 * un Place publica una convocatoria y un Artist aplica.
 *
 * Corre contra una instancia real de MongoDB en memoria (mongodb-memory-server),
 * nunca contra la base de dev/uat/prod real: `MONGO_URI_DEV` se sobreescribe
 * ANTES de requerir `server.js` (que dispara `dotenv.config()`, el cual por
 * default no pisa variables de entorno ya seteadas).
 *
 * Nota sobre el login usado acá: este flujo cubre exclusivamente el registro
 * y login vía AWS Cognito (`sub`), que no valida password, por lo que loguea
 * usando `sub` en vez de username/password. El login tradicional por password
 * (`POST /users` hashea con bcrypt, `bcrypt.compare` en `/api/generate-key`)
 * no está cubierto por este test.
 */

const crypto = require("crypto");

// Claves de cifrado del header `x-env`. Se fijan ANTES de requerir cualquier
// módulo de la app para que dotenv no las sobreescriba con las reales del .env,
// desacoplando el test de los secretos reales del repo.
process.env.ENV_KEY = "a".repeat(32);
process.env.ENV_KEY_IV = "b".repeat(16);

const TEST_ENV = "dev";

let request;
let mongoServer;
let app;
let dbConnections;

// Mismo esquema (AES-256-CBC, texto "valor@fecha") que usan tanto el header
// `x-env` (db_g.js#decryptEnv) como el header `x-req-ctx` de pre-autenticación
// (helpers/helperFunctions.js#validateIfUserExists -> db_g.js#decryptText).
function encryptPayload(value) {
  const key = Buffer.from(process.env.ENV_KEY, "utf8");
  const iv = Buffer.from(process.env.ENV_KEY_IV, "utf8");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  let encrypted = cipher.update(`${value}@${today}`, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("base64");
}

function envHeaders() {
  return { "x-env": encryptPayload(TEST_ENV) };
}

function authHeaders(apiKey) {
  return { ...envHeaders(), "x-api-key": apiKey };
}

// POST /users no tiene JWT todavía (es el propio registro): sin `x-api-key`,
// `validateIfUserExists` exige un `x-req-ctx` que descifre a un contexto
// pre-auth permitido ("user_signup"), o responde 403 "No API key provided.".
function preAuthHeaders(context) {
  return { ...envHeaders(), "x-req-ctx": encryptPayload(context) };
}

async function registerUser({ sub, username }) {
  return request(app)
    .post("/users")
    .set(preAuthHeaders("user_signup"))
    .send({ sub, username, given_names: "Test", surnames: username });
}

async function loginUser(sub) {
  const res = await request(app)
    .post("/api/generate-key")
    .set(envHeaders())
    .send({ sub });
  return res.body.apiKey;
}

beforeAll(async () => {
  request = require("supertest");
  const { MongoMemoryServer } = require("mongodb-memory-server");

  mongoServer = await MongoMemoryServer.create();
  // Se fija ANTES de requerir "../server" (y por lo tanto antes de que
  // db/db_g.js corra dotenv.config()) para que el mock de dev nunca apunte
  // a la base real de dev/uat/prod.
  process.env.MONGO_URI_DEV = mongoServer.getUri("ah_mock_api_e2e");

  const serverModule = require("../server");
  app = serverModule.app;

  // Las rutas dinámicas (loadRoutes) se registran de forma asíncrona en server.js.
  await serverModule.routesReady;

  ({ connections: dbConnections } = require("../db/db_g"));
}, 60000);

afterAll(async () => {
  if (dbConnections?.[TEST_ENV]) {
    await dbConnections[TEST_ENV].close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Flujo de negocio: Open Call (Place publica, Artist aplica)", () => {
  test("un Place publica una convocatoria y un Artist aplica; terceros sin ownership son rechazados", async () => {
    const runId = Date.now();

    // --- a. Usuario A se registra, se loguea, y crea su Place (queda OWNER) ---
    const subA = `sub-place-owner-${runId}`;
    const registerA = await registerUser({
      sub: subA,
      username: `place_owner_${runId}`,
    });
    expect(registerA.status).toBe(201);

    const userAToken = await loginUser(subA);
    expect(typeof userAToken).toBe("string");
    expect(userAToken.length).toBeGreaterThan(0);

    const createPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(userAToken))
      .send({ name: "Test Place A", genres: {} });

    expect([200, 201]).toContain(createPlaceRes.status);
    const placeAId = createPlaceRes.body?.data?._id;
    expect(placeAId).toBeTruthy();

    // --- b. Usuario B se registra, se loguea, y crea su Artist (queda OWNER) ---
    const subB = `sub-artist-owner-${runId}`;
    const registerB = await registerUser({
      sub: subB,
      username: `artist_owner_${runId}`,
    });
    expect(registerB.status).toBe(201);

    const userBToken = await loginUser(subB);
    expect(typeof userBToken).toBe("string");
    expect(userBToken.length).toBeGreaterThan(0);

    const createArtistRes = await request(app)
      .post("/artists")
      .set(authHeaders(userBToken))
      .send({ name: "Test Artist B" });

    expect(createArtistRes.status).toBe(201);
    const artistBId = createArtistRes.body?.data?._id;
    expect(artistBId).toBeTruthy();

    // --- c. Usuario A crea una Open Call para su propio Place ---
    const createOpenCallRes = await request(app)
      .post("/open-calls")
      .set(authHeaders(userAToken))
      .send({
        place_id: placeAId,
        event_name: "Convocatoria de prueba",
        event_date: "2026-08-01",
        start_date: "2026-08-01",
        end_date: "2026-08-02",
      });

    expect([200, 201]).toContain(createOpenCallRes.status);
    const openCallId = createOpenCallRes.body?.data?._id;
    expect(openCallId).toBeTruthy();
    expect(createOpenCallRes.body?.data?.place_id).toBeTruthy();

    // --- d. Usuario B aplica a la Open Call con su propio Artist ---
    const createApplicationRes = await request(app)
      .post("/open-call-applications")
      .set(authHeaders(userBToken))
      .send({
        open_call_id: openCallId,
        artist_id: artistBId,
        survey_responses: { availability: "weekends" },
      });

    expect([200, 201]).toContain(createApplicationRes.status);
    const applicationId = createApplicationRes.body?.data?._id;
    expect(applicationId).toBeTruthy();
    expect(createApplicationRes.body?.data?.open_call_id).toBeTruthy();
    expect(createApplicationRes.body?.data?.artist_id).toBeTruthy();

    // --- d.1 El listado de /open-call-applications incluye los campos propios de la aplicación ---
    const listApplicationsRes = await request(app)
      .get("/open-call-applications")
      .set(authHeaders(userBToken));

    expect(listApplicationsRes.status).toBe(200);
    const listedApplication = (listApplicationsRes.body?.data || []).find(
      (application) => application._id === applicationId,
    );
    expect(listedApplication).toBeTruthy();
    expect(listedApplication).toHaveProperty("status");
    expect(listedApplication).toHaveProperty("survey_responses");
    expect(listedApplication.open_call_id).toBeTruthy();
    expect(listedApplication.artist_id).toBeTruthy();

    // --- e. Usuario C (sin Place propio) NO puede crear una Open Call sobre el Place de A ---
    const subC = `sub-intruder-${runId}`;
    const registerC = await registerUser({
      sub: subC,
      username: `intruder_${runId}`,
    });
    expect(registerC.status).toBe(201);

    const userCToken = await loginUser(subC);
    expect(typeof userCToken).toBe("string");
    expect(userCToken.length).toBeGreaterThan(0);

    const forbiddenOpenCallRes = await request(app)
      .post("/open-calls")
      .set(authHeaders(userCToken))
      .send({
        place_id: placeAId,
        event_name: "Convocatoria intrusa",
        event_date: "2026-08-01",
        start_date: "2026-08-01",
        end_date: "2026-08-02",
      });

    expect(forbiddenOpenCallRes.status).not.toBe(200);
    expect(forbiddenOpenCallRes.status).not.toBe(201);

    // --- f. Usuario A (dueño del Place, no del Artist) NO puede aplicar en nombre del Artist de B ---
    const forbiddenApplicationRes = await request(app)
      .post("/open-call-applications")
      .set(authHeaders(userAToken))
      .send({
        open_call_id: openCallId,
        artist_id: artistBId,
      });

    expect(forbiddenApplicationRes.status).not.toBe(200);
    expect(forbiddenApplicationRes.status).not.toBe(201);

    // --- g. Usuario C (intruso, sin ownership del Place) NO puede aceptar/rechazar la aplicación ---
    const forbiddenSetStatusRes = await request(app)
      .post("/open-call-applications/action")
      .set(authHeaders(userCToken))
      .send({
        id: applicationId,
        action: "setStatus",
        status: "accepted",
      });

    expect(forbiddenSetStatusRes.status).not.toBe(200);

    // --- h. Usuario A (OWNER/ADMIN del Place dueño de la Open Call) acepta la aplicación de B ---
    const acceptApplicationRes = await request(app)
      .post("/open-call-applications/action")
      .set(authHeaders(userAToken))
      .send({
        id: applicationId,
        action: "setStatus",
        status: "accepted",
      });

    expect(acceptApplicationRes.status).toBe(200);
    expect(acceptApplicationRes.body?.data?.status).toBe("accepted");
  });
});
