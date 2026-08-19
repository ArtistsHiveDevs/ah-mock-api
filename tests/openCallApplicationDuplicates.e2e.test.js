/**
 * Test e2e (API-level, sin browser) de las reglas de admisión de
 * `POST /open-call-applications`: un Artist aplica una sola vez por convocatoria,
 * y solo a convocatorias publicadas y vigentes.
 *
 * Mismo harness que allEvents.e2e.test.js: mongodb-memory-server + supertest,
 * con `MONGO_URI_DEV` sobreescrito ANTES de requerir `server.js`.
 */

const crypto = require("crypto");
const mongoose = require("mongoose");

jest.mock("../helpers/cognitoService", () => {
  const emailsBySub = new Map();

  class CognitoUserNotFoundError extends Error {}

  return {
    CognitoUserNotFoundError,
    getCognitoEmailBySub: jest.fn(
      async (sub) => emailsBySub.get(sub) || `${sub}@cognito.test`,
    ),
    __setMockCognitoEmail: (sub, email) => emailsBySub.set(sub, email),
  };
});

process.env.ENV_KEY = "a".repeat(32);
process.env.ENV_KEY_IV = "b".repeat(16);

const TEST_ENV = "dev";
const FAKE_COUNTRY_ID = new mongoose.Types.ObjectId().toString();
const DAY_IN_MS = 24 * 60 * 60 * 1000;

let request;
let mongoServer;
let app;
let dbConnections;

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

function preAuthHeaders(context) {
  return { ...envHeaders(), "x-req-ctx": encryptPayload(context) };
}

// El username del User valida contra /^[a-z0-9_.]{3,24}$/, de ahí el sufijo corto.
function shortSuffix(runId) {
  return String(runId).slice(-8);
}

async function registerAndLogin(prefix, runId) {
  const sub = `sub-${prefix}-${runId}`;
  const registerRes = await request(app)
    .post("/users")
    .set(preAuthHeaders("user_signup"))
    .send({
      sub,
      username: `${prefix}_${shortSuffix(runId)}`,
      given_names: "Test",
      surnames: prefix,
    });
  expect(registerRes.status).toBe(201);

  const loginRes = await request(app)
    .post("/api/generate-key")
    .set(envHeaders())
    .send({ sub });

  return { token: loginRes.body.apiKey, sub };
}

function daysFromNow(days) {
  return new Date(Date.now() + days * DAY_IN_MS);
}

function toDateOnly(date) {
  return date.toISOString().split("T")[0];
}

async function createPlace(token, username) {
  const res = await request(app)
    .post("/places")
    .set(authHeaders(token))
    .send({
      username,
      name: "Applications Test Place",
      place_type: "Bar",
      city: "Bogotá",
      country: FAKE_COUNTRY_ID,
      genres: {},
    });
  expect([200, 201]).toContain(res.status);
  return res.body?.data?._id;
}

async function createArtist(token, name) {
  const res = await request(app)
    .post("/artists")
    .set(authHeaders(token))
    .send({ name });
  expect([200, 201]).toContain(res.status);
  return res.body?.data?._id;
}

async function createOpenCall(
  token,
  placeId,
  { event_name, status = "OPEN", end_date = toDateOnly(daysFromNow(30)) },
) {
  const res = await request(app)
    .post("/open-calls")
    .set(authHeaders(token))
    .send({
      place_id: placeId,
      event_name,
      event_date: toDateOnly(daysFromNow(60)),
      start_date: toDateOnly(daysFromNow(-10)),
      end_date,
      status,
    });
  expect([200, 201]).toContain(res.status);
  return res.body?.data?._id;
}

async function apply(token, openCallId, artistId) {
  return request(app)
    .post("/open-call-applications")
    .set(authHeaders(token))
    .send({
      open_call_id: openCallId,
      artist_id: artistId,
      survey_responses: { availability: "weekends" },
    });
}

async function getApplicationsCount(token, openCallId) {
  const res = await request(app)
    .get(`/open-calls/${openCallId}`)
    .set(authHeaders(token));
  expect(res.status).toBe(200);
  return res.body?.data?.applications_count;
}

async function getOpenCallApplicationModel() {
  const { getModel } = require("../helpers/getModel");
  return getModel(TEST_ENV, "OpenCallApplication");
}

beforeAll(async () => {
  request = require("supertest");
  const { MongoMemoryServer } = require("mongodb-memory-server");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI_DEV = mongoServer.getUri("ah_mock_api_applications_e2e");

  const serverModule = require("../server");
  app = serverModule.app;

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

describe("POST /open-call-applications: una sola aplicación por Artist y convocatoria", () => {
  test("aplicar dos veces a la misma convocatoria falla y no vuelve a incrementar applications_count", async () => {
    const runId = Date.now();
    const { token: placeToken } = await registerAndLogin("dup_plc", runId);
    const { token: artistToken } = await registerAndLogin("dup_art", runId);

    const placeId = await createPlace(
      placeToken,
      `dup_place_${shortSuffix(runId)}`,
    );
    const openCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Convocatoria con duplicados",
    });
    const artistId = await createArtist(artistToken, "Artist Duplicado");

    const firstRes = await apply(artistToken, openCallId, artistId);
    expect([200, 201]).toContain(firstRes.status);
    expect(await getApplicationsCount(placeToken, openCallId)).toBe(1);

    const secondRes = await apply(artistToken, openCallId, artistId);
    expect(secondRes.status).toBe(409);
    expect(secondRes.body?.errorCode).toBe("VALIDATION_DUPLICATE_KEY");

    expect(await getApplicationsCount(placeToken, openCallId)).toBe(1);

    const OpenCallApplicationModel = await getOpenCallApplicationModel();
    const storedApplications = await OpenCallApplicationModel.countDocuments({
      open_call_id: openCallId,
      artist_id: artistId,
    });
    expect(storedApplications).toBe(1);
  });

  test("el índice único rechaza el duplicado aunque se escriba salteando la validación del endpoint", async () => {
    const runId = Date.now();
    const { token: placeToken } = await registerAndLogin("idx_plc", runId);
    const { token: artistToken } = await registerAndLogin("idx_art", runId);

    const placeId = await createPlace(
      placeToken,
      `idx_place_${shortSuffix(runId)}`,
    );
    const openCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Convocatoria con carrera",
    });
    const artistId = await createArtist(artistToken, "Artist Carrera");

    const firstRes = await apply(artistToken, openCallId, artistId);
    expect([200, 201]).toContain(firstRes.status);

    const OpenCallApplicationModel = await getOpenCallApplicationModel();
    await OpenCallApplicationModel.init();

    await expect(
      OpenCallApplicationModel.create({
        open_call_id: openCallId,
        artist_id: artistId,
      }),
    ).rejects.toMatchObject({ code: 11000 });

    // El índice es parcial: los documentos sin artist_id no colisionan entre sí.
    const firstWithoutArtist = await OpenCallApplicationModel.create({
      open_call_id: openCallId,
    });
    const secondWithoutArtist = await OpenCallApplicationModel.create({
      open_call_id: openCallId,
    });
    expect(firstWithoutArtist._id.toString()).not.toBe(
      secondWithoutArtist._id.toString(),
    );
  });

  test("el mismo Artist puede aplicar a convocatorias distintas", async () => {
    const runId = Date.now();
    const { token: placeToken } = await registerAndLogin("two_plc", runId);
    const { token: artistToken } = await registerAndLogin("two_art", runId);

    const placeId = await createPlace(
      placeToken,
      `two_place_${shortSuffix(runId)}`,
    );
    const firstOpenCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Primera convocatoria",
    });
    const secondOpenCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Segunda convocatoria",
    });
    const artistId = await createArtist(artistToken, "Artist Multi Convocatoria");

    const firstRes = await apply(artistToken, firstOpenCallId, artistId);
    const secondRes = await apply(artistToken, secondOpenCallId, artistId);

    expect([200, 201]).toContain(firstRes.status);
    expect([200, 201]).toContain(secondRes.status);
    expect(await getApplicationsCount(placeToken, firstOpenCallId)).toBe(1);
    expect(await getApplicationsCount(placeToken, secondOpenCallId)).toBe(1);
  });

  test("dos Artists distintos pueden aplicar a la misma convocatoria", async () => {
    const runId = Date.now();
    const { token: placeToken } = await registerAndLogin("mlt_plc", runId);
    const { token: firstArtistToken } = await registerAndLogin("mlt_ar1", runId);
    const { token: secondArtistToken } = await registerAndLogin(
      "mlt_ar2",
      runId,
    );

    const placeId = await createPlace(
      placeToken,
      `mlt_place_${shortSuffix(runId)}`,
    );
    const openCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Convocatoria compartida",
    });

    const firstArtistId = await createArtist(firstArtistToken, "Artist Uno");
    const secondArtistId = await createArtist(secondArtistToken, "Artist Dos");

    const firstRes = await apply(firstArtistToken, openCallId, firstArtistId);
    const secondRes = await apply(secondArtistToken, openCallId, secondArtistId);

    expect([200, 201]).toContain(firstRes.status);
    expect([200, 201]).toContain(secondRes.status);
    expect(await getApplicationsCount(placeToken, openCallId)).toBe(2);
  });
});

describe("POST /open-call-applications: la convocatoria debe admitir aplicaciones", () => {
  test("no se puede aplicar a una convocatoria CLOSED ni a una DRAFT", async () => {
    const runId = Date.now();
    const { token: placeToken } = await registerAndLogin("cls_plc", runId);
    const { token: artistToken } = await registerAndLogin("cls_art", runId);

    const placeId = await createPlace(
      placeToken,
      `cls_place_${shortSuffix(runId)}`,
    );
    const closedOpenCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Convocatoria cerrada",
      status: "CLOSED",
    });
    const draftOpenCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Convocatoria borrador",
      status: "DRAFT",
    });
    const artistId = await createArtist(artistToken, "Artist Rechazado");

    const closedRes = await apply(artistToken, closedOpenCallId, artistId);
    expect(closedRes.status).toBe(400);
    expect(closedRes.body?.errorCode).toBe("VALIDATION_ERROR");

    const draftRes = await apply(artistToken, draftOpenCallId, artistId);
    expect(draftRes.status).toBe(400);
    expect(draftRes.body?.errorCode).toBe("VALIDATION_ERROR");

    expect(await getApplicationsCount(placeToken, closedOpenCallId)).toBe(0);
    expect(await getApplicationsCount(placeToken, draftOpenCallId)).toBe(0);
  });

  test("no se puede aplicar a una convocatoria vencida", async () => {
    const runId = Date.now();
    const { token: placeToken } = await registerAndLogin("exp_plc", runId);
    const { token: artistToken } = await registerAndLogin("exp_art", runId);

    const placeId = await createPlace(
      placeToken,
      `exp_place_${shortSuffix(runId)}`,
    );
    const expiredOpenCallId = await createOpenCall(placeToken, placeId, {
      event_name: "Convocatoria vencida",
      end_date: toDateOnly(daysFromNow(-1)),
    });
    const artistId = await createArtist(artistToken, "Artist Tardío");

    const res = await apply(artistToken, expiredOpenCallId, artistId);
    expect(res.status).toBe(400);
    expect(res.body?.errorCode).toBe("VALIDATION_ERROR");
    expect(await getApplicationsCount(placeToken, expiredOpenCallId)).toBe(0);
  });

  test("no se puede aplicar a una convocatoria inexistente", async () => {
    const runId = Date.now();
    const { token: artistToken } = await registerAndLogin("nof_art", runId);
    const artistId = await createArtist(artistToken, "Artist Sin Convocatoria");

    const res = await apply(
      artistToken,
      new mongoose.Types.ObjectId().toString(),
      artistId,
    );

    expect(res.status).toBe(404);
    expect(res.body?.errorCode).toBe("CONTENT_NOT_FOUND");
  });
});
