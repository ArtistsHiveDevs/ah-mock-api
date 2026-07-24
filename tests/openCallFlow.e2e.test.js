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
const mongoose = require("mongoose");

// Mock de helpers/cognitoService: en test no hay cognito-local corriendo.
// Por default resuelve un email determinístico distinto por sub; los tests
// que necesitan simular un email específico (o un sub que Cognito desconoce)
// lo configuran con __setMockCognitoEmail/__setMockCognitoNotFound.
jest.mock("../helpers/cognitoService", () => {
  const emailsBySub = new Map();
  const notFoundSubs = new Set();

  class CognitoUserNotFoundError extends Error {}

  return {
    CognitoUserNotFoundError,
    getCognitoEmailBySub: jest.fn(async (sub) => {
      if (notFoundSubs.has(sub)) {
        throw new CognitoUserNotFoundError(`mock: sub ${sub} not found`);
      }
      return emailsBySub.get(sub) || `${sub}@cognito.test`;
    }),
    __setMockCognitoEmail: (sub, email) => emailsBySub.set(sub, email),
    __setMockCognitoNotFound: (sub) => notFoundSubs.add(sub),
  };
});

// Claves de cifrado del header `x-env`. Se fijan ANTES de requerir cualquier
// módulo de la app para que dotenv no las sobreescriba con las reales del .env,
// desacoplando el test de los secretos reales del repo.
process.env.ENV_KEY = "a".repeat(32);
process.env.ENV_KEY_IV = "b".repeat(16);

const TEST_ENV = "dev";

// Place.country solo valida que sea un ObjectId con forma válida (no hay
// constraint de FK en Mongoose), así que un id no persistido alcanza para
// satisfacer `required: true` sin necesitar seedear un Country real.
const FAKE_COUNTRY_ID = new mongoose.Types.ObjectId().toString();

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
      .send({
        username: `test_place_a_${runId}`,
        name: "Test Place A",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
        genres: {},
      });

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

    // --- i. Usuario D, con su propio Place y su propio Artist (sin relación con la
    // convocatoria de A/B), NO ve la aplicación de B en el listado de /open-call-applications ---
    const subD = `sub-outsider-${runId}`;
    const registerD = await registerUser({
      sub: subD,
      username: `outsider_${runId}`,
    });
    expect(registerD.status).toBe(201);

    const userDToken = await loginUser(subD);
    expect(typeof userDToken).toBe("string");
    expect(userDToken.length).toBeGreaterThan(0);

    const createPlaceDRes = await request(app)
      .post("/places")
      .set(authHeaders(userDToken))
      .send({
        username: `test_place_d_${runId}`,
        name: "Test Place D",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
        genres: {},
      });
    expect([200, 201]).toContain(createPlaceDRes.status);
    expect(createPlaceDRes.body?.data?._id).toBeTruthy();

    const createArtistDRes = await request(app)
      .post("/artists")
      .set(authHeaders(userDToken))
      .send({ name: "Test Artist D" });
    expect(createArtistDRes.status).toBe(201);
    expect(createArtistDRes.body?.data?._id).toBeTruthy();

    const listApplicationsAsDRes = await request(app)
      .get("/open-call-applications")
      .set(authHeaders(userDToken));

    expect(listApplicationsAsDRes.status).toBe(200);
    const applicationSeenByD = (
      listApplicationsAsDRes.body?.data || []
    ).find((application) => application._id === applicationId);
    expect(applicationSeenByD).toBeFalsy();

    // --- j. Usuario A (dueño del Place de la convocatoria) SÍ ve la aplicación de B ---
    const listApplicationsAsARes = await request(app)
      .get("/open-call-applications")
      .set(authHeaders(userAToken));

    expect(listApplicationsAsARes.status).toBe(200);
    const applicationSeenByA = (
      listApplicationsAsARes.body?.data || []
    ).find((application) => application._id === applicationId);
    expect(applicationSeenByA).toBeTruthy();

    // --- k. Usuario B (el artista que aplicó) SÍ ve su propia aplicación ---
    const listApplicationsAsBRes = await request(app)
      .get("/open-call-applications")
      .set(authHeaders(userBToken));

    expect(listApplicationsAsBRes.status).toBe(200);
    const applicationSeenByB = (
      listApplicationsAsBRes.body?.data || []
    ).find((application) => application._id === applicationId);
    expect(applicationSeenByB).toBeTruthy();
  });
});

describe("Fix: POST /places exige username, name, place_type, city y country", () => {
  const validPlacePayload = {
    username: "test_place_required_fields",
    name: "Test Place Required Fields",
    place_type: "Bar",
    city: "Bogotá",
    country: FAKE_COUNTRY_ID,
  };

  test.each([
    ["username", { ...validPlacePayload, username: undefined }],
    ["name", { ...validPlacePayload, name: undefined }],
    ["place_type", { ...validPlacePayload, place_type: undefined }],
    ["city", { ...validPlacePayload, city: undefined }],
    ["country", { ...validPlacePayload, country: undefined }],
  ])(
    "rechaza la creación sin '%s' en vez de responder 200/201",
    async (_missingField, payload) => {
      const runId = Date.now();
      const sub = `sub-place-required-${_missingField}-${runId}`;
      const registerRes = await registerUser({
        sub,
        username: `place_required_${_missingField}_${runId}`,
      });
      expect(registerRes.status).toBe(201);

      const token = await loginUser(sub);

      const createPlaceRes = await request(app)
        .post("/places")
        .set(authHeaders(token))
        .send(payload);

      expect(createPlaceRes.status).toBe(400);
      expect(createPlaceRes.body?.errorCode).toBe("VALIDATION_ERROR");
    },
  );

  test("crea el Place cuando vienen los 5 campos requeridos", async () => {
    const runId = Date.now();
    const sub = `sub-place-required-ok-${runId}`;
    const registerRes = await registerUser({
      sub,
      username: `place_required_ok_${runId}`,
    });
    expect(registerRes.status).toBe(201);

    const token = await loginUser(sub);

    const createPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(token))
      .send(validPlacePayload);

    expect([200, 201]).toContain(createPlaceRes.status);
    expect(createPlaceRes.body?.data?._id).toBeTruthy();
  });
});

describe("Fix de seguridad: POST /places rechaza username duplicado", () => {
  test("el segundo Place con el mismo username que uno ya existente falla (no 200/201)", async () => {
    const runId = Date.now();
    const sharedUsername = `duplicate_place_username_${runId}`;

    const subOwner1 = `sub-place-dup-owner1-${runId}`;
    const registerOwner1 = await registerUser({
      sub: subOwner1,
      username: `place_dup_owner1_${runId}`,
    });
    expect(registerOwner1.status).toBe(201);
    const owner1Token = await loginUser(subOwner1);

    const firstPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(owner1Token))
      .send({
        username: sharedUsername,
        name: "Duplicate Username Place 1",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
      });
    expect([200, 201]).toContain(firstPlaceRes.status);
    expect(firstPlaceRes.body?.data?._id).toBeTruthy();

    const subOwner2 = `sub-place-dup-owner2-${runId}`;
    const registerOwner2 = await registerUser({
      sub: subOwner2,
      username: `place_dup_owner2_${runId}`,
    });
    expect(registerOwner2.status).toBe(201);
    const owner2Token = await loginUser(subOwner2);

    const secondPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(owner2Token))
      .send({
        username: sharedUsername,
        name: "Duplicate Username Place 2",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
      });

    expect(secondPlaceRes.status).toBe(409);
    expect(secondPlaceRes.body?.errorCode).toBe("VALIDATION_DUPLICATE_KEY");
    expect(secondPlaceRes.body?.message).toMatch(/username/i);
  });
});

describe("Fix: GET /places/:id devuelve los campos reales de Place (no los de Artist)", () => {
  test("el detalle de un Place recién creado incluye place_type, country, city y entityRoleMap", async () => {
    const { getModel } = require("../helpers/getModel");
    const CountryModel = await getModel(TEST_ENV, "Country");

    // País real (a diferencia de FAKE_COUNTRY_ID) para poder verificar que
    // findEntityById también popula la referencia, no solo que exista la key.
    const country = await CountryModel.create({
      name: "Testlandia",
      native: "Testlandia",
      phone: [999],
      official_name: "República de Testlandia",
    });

    const runId = Date.now();
    const sub = `sub-place-detail-${runId}`;
    const registerRes = await registerUser({
      sub,
      username: `place_detail_${runId}`,
    });
    expect(registerRes.status).toBe(201);

    const token = await loginUser(sub);

    const createPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(token))
      .send({
        username: `test_place_detail_${runId}`,
        name: "Test Place Detail",
        place_type: "Bar",
        city: "Bogotá",
        country: country._id.toString(),
        genres: { rock: ["indie"] },
      });

    expect([200, 201]).toContain(createPlaceRes.status);
    const placeId = createPlaceRes.body?.data?._id;
    expect(placeId).toBeTruthy();

    const getPlaceRes = await request(app)
      .get(`/places/${placeId}`)
      .set(authHeaders(token));

    expect(getPlaceRes.status).toBe(200);
    const place = getPlaceRes.body?.data;
    expect(place).toBeTruthy();
    expect(place.place_type).toBe("Bar");
    expect(place.country).toBeTruthy();
    expect(place.country.name).toBe("Testlandia");
    expect(place.city).toBe("Bogotá");
    expect(place.entityRoleMap).toBeTruthy();
    expect(place.entityRoleMap.length).toBeGreaterThan(0);
  });
});

describe("Fix: GET /open-calls (listado) devuelve los campos reales de OpenCall (no los de Artist)", () => {
  test("una OpenCall completa recién creada aparece en el listado con event_name, status y place_id", async () => {
    const runId = Date.now();
    const sub = `sub-opencall-list-${runId}`;
    const registerRes = await registerUser({
      sub,
      username: `opencall_list_${runId}`,
    });
    expect(registerRes.status).toBe(201);

    const token = await loginUser(sub);

    const createPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(token))
      .send({
        username: `test_place_opencall_list_${runId}`,
        name: "Test Place Open Call List",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
        genres: {},
      });
    expect([200, 201]).toContain(createPlaceRes.status);
    const placeId = createPlaceRes.body?.data?._id;
    expect(placeId).toBeTruthy();

    const createOpenCallRes = await request(app)
      .post("/open-calls")
      .set(authHeaders(token))
      .send({
        place_id: placeId,
        event_name: "Convocatoria completa de prueba",
        event_date: "2026-09-01",
        start_date: "2026-09-01",
        end_date: "2026-09-02",
        city: "Bogotá",
        status: "OPEN",
        description: "Descripción de prueba",
        genres: ["rock"],
        max_applications: 10,
        fee_currency: "USD",
        fee_amount: 100,
      });
    expect([200, 201]).toContain(createOpenCallRes.status);
    const openCallId = createOpenCallRes.body?.data?._id;
    expect(openCallId).toBeTruthy();
    expect(createOpenCallRes.body?.data?.event_name).toBe(
      "Convocatoria completa de prueba",
    );

    const listOpenCallsRes = await request(app)
      .get("/open-calls")
      .set(authHeaders(token));

    expect(listOpenCallsRes.status).toBe(200);
    const listedOpenCall = (listOpenCallsRes.body?.data || []).find(
      (openCall) => openCall._id === openCallId,
    );
    expect(listedOpenCall).toBeTruthy();
    expect(listedOpenCall.event_name).toBe("Convocatoria completa de prueba");
    expect(listedOpenCall.status).toBe("OPEN");
    expect(listedOpenCall.place_id).toBeTruthy();
    expect(listedOpenCall.fee_amount).toBe(100);
  });
});

describe("Fix de seguridad: PUT /users/:id no persiste el password en texto plano", () => {
  test("actualizar el perfil con un password nuevo lo guarda hasheado, no en texto plano", async () => {
    const bcrypt = require("bcryptjs");
    const { getModel } = require("../helpers/getModel");

    const runId = Date.now();
    const sub = `sub-password-update-${runId}`;
    const username = `password_update_${runId}`;

    const registerRes = await registerUser({ sub, username });
    expect(registerRes.status).toBe(201);
    const userId = registerRes.body?.data?._id;
    expect(userId).toBeTruthy();

    const token = await loginUser(sub);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);

    const plainTextPassword = "SuperSecret123!";
    const updateRes = await request(app)
      .put(`/users/${userId}`)
      .set(authHeaders(token))
      .send({ password: plainTextPassword });

    expect(updateRes.status).toBe(200);

    const UserModel = await getModel(TEST_ENV, "User");
    const storedUser = await UserModel.findById(userId).select("password");

    expect(storedUser.password).toBeTruthy();
    expect(storedUser.password).not.toBe(plainTextPassword);
    await expect(
      bcrypt.compare(plainTextPassword, storedUser.password),
    ).resolves.toBe(true);
  });
});

describe("Fix: PUT /places/:id resincroniza el snapshot en User.roles[].entityRoleMap", () => {
  test("cambiar el username de un Place actualiza el snapshot en el User owner, no solo el Place", async () => {
    const { getModel } = require("../helpers/getModel");

    const runId = Date.now();
    const sub = `sub-place-username-sync-${runId}`;
    const oldUsername = `test_place_sync_old_${runId}`;
    const newUsername = `test_place_sync_new_${runId}`;

    const registerRes = await registerUser({
      sub,
      username: `place_sync_owner_${runId}`,
    });
    expect(registerRes.status).toBe(201);
    const userId = registerRes.body?.data?._id;
    expect(userId).toBeTruthy();

    const token = await loginUser(sub);

    const createPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(token))
      .send({
        username: oldUsername,
        name: "Test Place Sync",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
        genres: {},
      });
    expect([200, 201]).toContain(createPlaceRes.status);
    const placeId = createPlaceRes.body?.data?._id;
    expect(placeId).toBeTruthy();

    const updatePlaceRes = await request(app)
      .put(`/places/${placeId}`)
      .set(authHeaders(token))
      .send({ username: newUsername });

    expect(updatePlaceRes.status).toBe(200);
    expect(updatePlaceRes.body?.data?.username).toBe(newUsername);

    const UserModel = await getModel(TEST_ENV, "User");
    const storedUser = await UserModel.findById(userId);

    const placeRole = storedUser.roles.find(
      (role) => role.entityName === "Place",
    );
    expect(placeRole).toBeTruthy();

    const roleMapEntry = placeRole.entityRoleMap.find(
      (entry) => entry.id === placeId,
    );
    expect(roleMapEntry).toBeTruthy();
    expect(roleMapEntry.username).toBe(newUsername);
    expect(roleMapEntry.username).not.toBe(oldUsername);
  });
});

describe("Fix de seguridad: registro Cognito toma el email real de Cognito y rechaza duplicados", () => {
  test("el email guardado es el que devuelve Cognito por sub, no el que manda el body", async () => {
    const { __setMockCognitoEmail } = require("../helpers/cognitoService");
    const { getModel } = require("../helpers/getModel");

    const runId = Date.now();
    const sub = `sub-cognito-real-email-${runId}`;
    const realCognitoEmail = `real_${runId}@cognito.test`;
    __setMockCognitoEmail(sub, realCognitoEmail);

    const registerRes = await request(app)
      .post("/users")
      .set(preAuthHeaders("user_signup"))
      .send({
        sub,
        username: `cognito_real_email_${runId}`,
        given_names: "Test",
        surnames: "User",
        // Email divergente armado por el cliente: no debe persistirse.
        email: `wrong_${runId}@fake-client-payload.test`,
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body?.data?.email).toBe(realCognitoEmail);

    const UserModel = await getModel(TEST_ENV, "User");
    const storedUser = await UserModel.findOne({ sub });
    expect(storedUser.email).toBe(realCognitoEmail);
  });

  test("un sub nuevo cuyo email de Cognito coincide con el de una cuenta existente (sub distinto) es rechazado, sin crear un segundo User", async () => {
    const { __setMockCognitoEmail } = require("../helpers/cognitoService");
    const { getModel } = require("../helpers/getModel");

    const runId = Date.now();
    const sharedEmail = `shared_${runId}@example.com`;

    const subOriginal = `sub-cognito-dup-original-${runId}`;
    __setMockCognitoEmail(subOriginal, sharedEmail);
    const registerOriginal = await registerUser({
      sub: subOriginal,
      username: `cognito_dup_original_${runId}`,
    });
    expect(registerOriginal.status).toBe(201);

    // Caso real de hoy: un sub distinto cuyo email (según Cognito) coincide
    // con uno ya registrado -- se rechaza en vez de crear un segundo User
    // con el mismo email apuntando a otra identidad de Cognito.
    const subDivergent = `sub-cognito-dup-divergent-${runId}`;
    __setMockCognitoEmail(subDivergent, sharedEmail);
    const registerDivergent = await registerUser({
      sub: subDivergent,
      username: `cognito_dup_divergent_${runId}`,
    });

    expect(registerDivergent.status).toBe(409);
    expect(registerDivergent.body?.errorCode).toBe(
      "AUTH_EMAIL_ALREADY_REGISTERED",
    );

    const UserModel = await getModel(TEST_ENV, "User");
    const usersWithEmail = await UserModel.find({ email: sharedEmail });
    expect(usersWithEmail).toHaveLength(1);
    expect(usersWithEmail[0].sub).toBe(subOriginal);
  });

  test("registrar dos veces el mismo email por la vía tradicional (sin sub) es rechazado en el segundo intento", async () => {
    const runId = Date.now();
    const email = `traditional_dup_${runId}@example.com`;

    const firstRegister = await request(app)
      .post("/users")
      .set(preAuthHeaders("user_signup"))
      .send({
        email,
        password: "SuperSecret123!",
        username: `traditional_dup_1_${runId}`,
        given_names: "Test",
        surnames: "User",
      });
    expect(firstRegister.status).toBe(201);

    const secondRegister = await request(app)
      .post("/users")
      .set(preAuthHeaders("user_signup"))
      .send({
        email,
        password: "OtherSecret123!",
        username: `traditional_dup_2_${runId}`,
        given_names: "Test",
        surnames: "User",
      });

    expect(secondRegister.status).toBe(409);
    expect(secondRegister.body?.errorCode).toBe(
      "AUTH_EMAIL_ALREADY_REGISTERED",
    );
  });

  test("un sub que no existe en Cognito es rechazado sin crear el User", async () => {
    const { __setMockCognitoNotFound } = require("../helpers/cognitoService");
    const { getModel } = require("../helpers/getModel");

    const runId = Date.now();
    const sub = `sub-cognito-unknown-${runId}`;
    __setMockCognitoNotFound(sub);

    const registerRes = await request(app)
      .post("/users")
      .set(preAuthHeaders("user_signup"))
      .send({ sub, username: `cognito_unknown_${runId}` });

    expect(registerRes.status).toBe(400);
    expect(registerRes.body?.errorCode).toBe("AUTH_COGNITO_USER_NOT_FOUND");

    const UserModel = await getModel(TEST_ENV, "User");
    expect(await UserModel.findOne({ sub })).toBeNull();
  });
});

describe("Fix de seguridad: login Cognito busca exclusivamente por sub, sin fallback a email", () => {
  test("el mismo bug de hoy: un sub sin registrar no loguea encontrando por email una cuenta de otro sub", async () => {
    const { __setMockCognitoEmail } = require("../helpers/cognitoService");

    const runId = Date.now();
    const sharedEmail = `login_shared_${runId}@example.com`;

    const subA = `sub-login-owner-${runId}`;
    __setMockCognitoEmail(subA, sharedEmail);
    const registerA = await registerUser({
      sub: subA,
      username: `login_owner_${runId}`,
    });
    expect(registerA.status).toBe(201);

    const tokenA = await loginUser(subA);
    expect(typeof tokenA).toBe("string");
    expect(tokenA.length).toBeGreaterThan(0);

    // subB nunca se registró. Antes del fix, un $or que mezclaba sub y email
    // podía encontrar al User de A por el email compartido y fallar recién
    // en el chequeo posterior de sub -- acá debe ser 404 directo, sin
    // encontrar ninguna cuenta.
    const subB = `sub-login-intruder-${runId}`;
    const loginBRes = await request(app)
      .post("/api/generate-key")
      .set(envHeaders())
      .send({ sub: subB, email: sharedEmail });

    expect(loginBRes.status).toBe(404);
    expect(loginBRes.body?.errorCode).toBe("AUTH_USER_NOT_FOUND");
  });

  test("login Cognito con el sub correcto sigue funcionando (caso feliz no roto por el fix)", async () => {
    const runId = Date.now();
    const sub = `sub-login-happy-${runId}`;
    const registerRes = await registerUser({
      sub,
      username: `login_happy_${runId}`,
    });
    expect(registerRes.status).toBe(201);

    const token = await loginUser(sub);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });
});
