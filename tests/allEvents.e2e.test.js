/**
 * Test e2e (API-level, sin browser) del agregador de calendario
 * `GET /events/all_events`: convocatorias vigentes (fuente `call`) y
 * actividades propias del usuario (fuente `activity`).
 *
 * Mismo harness que openCallFlow.e2e.test.js: mongodb-memory-server + supertest,
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

// El username del User valida contra /^[a-z0-9_.]{3,24}$/, de ahí el sufijo corto.
function shortSuffix(runId) {
  return String(runId).slice(-8);
}

async function registerAndLogin(prefix, runId) {
  const sub = `sub-${prefix}-${runId}`;
  const registerRes = await registerUser({
    sub,
    username: `${prefix}_${shortSuffix(runId)}`,
  });
  expect(registerRes.status).toBe(201);
  const token = await loginUser(sub);
  return { token, sub };
}

async function getUserModel() {
  const { getModel } = require("../helpers/getModel");
  return getModel(TEST_ENV, "User");
}

// El perfil activo se conmuta desde el front vía User.currentProfileIdentifier;
// acá se escribe directo porque el flujo de switcheo no es lo que se está probando.
async function setActiveProfile(sub, profileIdentifier) {
  const UserModel = await getUserModel();
  await UserModel.updateOne(
    { sub },
    { $set: { currentProfileIdentifier: profileIdentifier } },
  );
}

// No hay endpoint para sumar un miembro a una entidad ya creada: se inyecta el
// rol en el User para poder probar el caso "dos usuarios, mismo perfil activo".
async function grantProfileMembership(sub, { entityName, id }) {
  const UserModel = await getUserModel();
  await UserModel.updateOne(
    { sub },
    {
      $push: {
        roles: { entityName, entityRoleMap: [{ id, roles: ["ADMIN"] }] },
      },
    },
  );
}

async function createActivity(token, body) {
  return request(app).post("/activities").set(authHeaders(token)).send(body);
}

async function listActivities(token) {
  return request(app).get("/activities").set(authHeaders(token));
}

function activityIdsOf(listResponse) {
  return (listResponse.body?.data || []).map((activity) =>
    activity._id.toString(),
  );
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
      name: "Calendar Test Place",
      place_type: "Bar",
      city: "Bogotá",
      country: FAKE_COUNTRY_ID,
      genres: {},
    });
  expect([200, 201]).toContain(res.status);
  return res.body?.data?._id;
}

async function createOpenCall(token, placeId, { end_date, status, event_name }) {
  const res = await request(app)
    .post("/open-calls")
    .set(authHeaders(token))
    .send({
      place_id: placeId,
      event_name,
      event_date: toDateOnly(daysFromNow(120)),
      start_date: toDateOnly(daysFromNow(-30)),
      end_date,
      status,
    });
  expect([200, 201]).toContain(res.status);
  return res.body?.data?._id;
}

async function getAllEvents(token, query = {}) {
  return request(app)
    .get("/events/all_events")
    .query(query)
    .set(authHeaders(token));
}

beforeAll(async () => {
  request = require("supertest");
  const { MongoMemoryServer } = require("mongodb-memory-server");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI_DEV = mongoServer.getUri("ah_mock_api_calendar_e2e");

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

describe("GET /events/all_events", () => {
  test("sin API key responde 403", async () => {
    const res = await request(app).get("/events/all_events").set(envHeaders());

    expect(res.status).toBe(403);
  });

  test("agrega convocatorias (vigentes y vencidas) y actividades propias, y descarta las no publicadas y las de otros perfiles", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_own", runId);

    const placeId = await createPlace(token, `cal_place_${shortSuffix(runId)}`);

    const openCallDeadline = daysFromNow(20);
    const openCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria vigente",
      end_date: toDateOnly(openCallDeadline),
      status: "OPEN",
    });

    const expiredOpenCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria vencida",
      end_date: toDateOnly(daysFromNow(-5)),
      status: "OPEN",
    });

    const draftOpenCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria sin publicar",
      end_date: toDateOnly(daysFromNow(25)),
      status: "DRAFT",
    });

    const activityStart = daysFromNow(10);
    const activityEnd = new Date(activityStart.getTime() + 2 * 60 * 60 * 1000);
    const createActivityRes = await request(app)
      .post("/activities")
      .set(authHeaders(token))
      .send({
        title: "Ensayo general",
        type: "rehearsal",
        start: activityStart.toISOString(),
        end: activityEnd.toISOString(),
        allDay: false,
        notes: "Sala 2",
      });
    expect([200, 201]).toContain(createActivityRes.status);
    const activityId = createActivityRes.body?.data?._id;
    expect(activityId).toBeTruthy();

    const { token: otherToken } = await registerAndLogin("cal_out", runId);
    const createOtherActivityRes = await createActivity(otherToken, {
      title: "Ensayo ajeno",
      type: "rehearsal",
      start: activityStart.toISOString(),
    });
    expect([200, 201]).toContain(createOtherActivityRes.status);
    const otherActivityId = createOtherActivityRes.body?.data?._id;

    const range = {
      from: daysFromNow(-60).toISOString(),
      to: daysFromNow(60).toISOString(),
    };

    const res = await getAllEvents(token, range);
    expect(res.status).toBe(200);

    const calendarEvents = res.body?.data;
    expect(Array.isArray(calendarEvents)).toBe(true);

    const callEvent = calendarEvents.find((event) => event.id === openCallId);
    expect(callEvent).toBeTruthy();
    expect(callEvent.type).toBe("call");
    expect(callEvent.title).toBe("Convocatoria vigente");
    expect(callEvent.allDay).toBe(true);
    expect(callEvent.start).toBe(callEvent.end);
    expect(callEvent.start).toBe(toDateOnly(openCallDeadline));
    expect(callEvent.status).toBe("OPEN");
    expect(callEvent.entityId).toBe(placeId);
    expect(callEvent.meta?.expired).toBe(false);

    const expiredCallEvent = calendarEvents.find(
      (event) => event.id === expiredOpenCallId,
    );
    expect(expiredCallEvent).toBeTruthy();
    expect(expiredCallEvent.meta?.expired).toBe(true);

    expect(
      calendarEvents.find((event) => event.id === draftOpenCallId),
    ).toBeFalsy();

    const activityEvent = calendarEvents.find(
      (event) => event.id === activityId,
    );
    expect(activityEvent).toBeTruthy();
    expect(activityEvent.type).toBe("activity");
    expect(activityEvent.title).toBe("Ensayo general");
    expect(activityEvent.start).toBe(activityStart.toISOString());
    expect(activityEvent.end).toBe(activityEnd.toISOString());
    expect(activityEvent.meta?.activity_type).toBe("rehearsal");

    expect(
      calendarEvents.find((event) => event.id === otherActivityId),
    ).toBeFalsy();

    // La fuente `concert` está suspendida: nunca aporta ítems.
    expect(
      calendarEvents.find((event) => event.type === "concert"),
    ).toBeFalsy();

    const activitiesOnlyRes = await getAllEvents(token, {
      ...range,
      types: "activity",
    });
    expect(activitiesOnlyRes.status).toBe(200);
    expect(
      activitiesOnlyRes.body?.data.every((event) => event.type === "activity"),
    ).toBe(true);
    expect(
      activitiesOnlyRes.body?.data.find((event) => event.id === activityId),
    ).toBeTruthy();

    const outOfRangeRes = await getAllEvents(token, {
      from: daysFromNow(200).toISOString(),
      to: daysFromNow(260).toISOString(),
    });
    expect(outOfRangeRes.status).toBe(200);
    expect(outOfRangeRes.body?.data).toHaveLength(0);
  });

  test("un rango con fechas inválidas responde 400", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_bad", runId);

    const res = await getAllEvents(token, { from: "no-es-una-fecha" });

    expect(res.status).toBe(400);
    expect(res.body?.errorCode).toBe("VALIDATION_ERROR");
  });

  test("un evento allDay viaja como fecha suelta YYYY-MM-DD, sin hora ni sufijo Z", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_day", runId);

    const placeId = await createPlace(token, `cal_dplc_${shortSuffix(runId)}`);
    const storedEndDate = toDateOnly(daysFromNow(15));
    const openCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria all-day",
      end_date: storedEndDate,
      status: "OPEN",
    });

    const allDayActivityStart = daysFromNow(16);
    const createRes = await createActivity(token, {
      title: "Gira",
      type: "other",
      start: allDayActivityStart.toISOString(),
      end: daysFromNow(18).toISOString(),
      allDay: true,
    });
    expect([200, 201]).toContain(createRes.status);
    const activityId = createRes.body?.data?._id;

    const res = await getAllEvents(token, {
      from: daysFromNow(-5).toISOString(),
      to: daysFromNow(40).toISOString(),
    });
    expect(res.status).toBe(200);

    const callEvent = res.body.data.find((event) => event.id === openCallId);
    expect(callEvent.start).toBe(storedEndDate);
    expect(callEvent.end).toBe(storedEndDate);

    const allDayActivity = res.body.data.find(
      (event) => event.id === activityId,
    );
    expect(allDayActivity.allDay).toBe(true);
    expect(allDayActivity.start).toBe(toDateOnly(allDayActivityStart));
    expect(allDayActivity.end).toBe(toDateOnly(daysFromNow(18)));

    res.body.data
      .filter((event) => event.allDay)
      .forEach((event) => {
        expect(event.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(event.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
  });

  test("una actividad multi-día que empieza antes del rango sigue apareciendo", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_span", runId);

    const spanningRes = await createActivity(token, {
      title: "Bloque de ensayos",
      type: "rehearsal",
      start: daysFromNow(-3).toISOString(),
      end: daysFromNow(1).toISOString(),
    });
    expect([200, 201]).toContain(spanningRes.status);
    const spanningActivityId = spanningRes.body?.data?._id;

    const startedBeforeRangeRes = await createActivity(token, {
      title: "Ensayo puntual anterior",
      type: "rehearsal",
      start: daysFromNow(-3).toISOString(),
    });
    expect([200, 201]).toContain(startedBeforeRangeRes.status);
    const startedBeforeRangeId = startedBeforeRangeRes.body?.data?._id;

    const res = await getAllEvents(token, {
      from: daysFromNow(0).toISOString(),
      to: daysFromNow(20).toISOString(),
    });
    expect(res.status).toBe(200);

    expect(
      res.body.data.find((event) => event.id === spanningActivityId),
    ).toBeTruthy();
    expect(
      res.body.data.find((event) => event.id === startedBeforeRangeId),
    ).toBeFalsy();
  });

  test("navegar a un mes pasado devuelve las convocatorias vencidas marcadas con meta.expired", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_past", runId);

    const placeId = await createPlace(token, `cal_pplc_${shortSuffix(runId)}`);
    const expiredOpenCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria del mes pasado",
      end_date: toDateOnly(daysFromNow(-40)),
      status: "OPEN",
    });

    const res = await getAllEvents(token, {
      from: daysFromNow(-50).toISOString(),
      to: daysFromNow(-30).toISOString(),
    });
    expect(res.status).toBe(200);

    const expiredCallEvent = res.body.data.find(
      (event) => event.id === expiredOpenCallId,
    );
    expect(expiredCallEvent).toBeTruthy();
    expect(expiredCallEvent.meta?.expired).toBe(true);
  });

  test("el id de una convocatoria permite navegar a su detalle", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_nav", runId);

    const placeId = await createPlace(token, `cal_nplc_${shortSuffix(runId)}`);
    const openCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria navegable",
      end_date: toDateOnly(daysFromNow(12)),
      status: "OPEN",
    });

    const activityRes = await createActivity(token, {
      title: "Ensayo navegable",
      type: "rehearsal",
      start: daysFromNow(12).toISOString(),
    });
    const activityId = activityRes.body?.data?._id;

    const res = await getAllEvents(token, {
      from: daysFromNow(5).toISOString(),
      to: daysFromNow(20).toISOString(),
    });

    const callEvent = res.body.data.find((event) => event.id === openCallId);
    const activityEvent = res.body.data.find(
      (event) => event.id === activityId,
    );

    const callDetailRes = await request(app)
      .get(`/open-calls/${callEvent.id}`)
      .set(authHeaders(token));
    expect(callDetailRes.status).toBe(200);
    expect(callDetailRes.body?.data?._id).toBe(openCallId);

    const activityDetailRes = await request(app)
      .get(`/activities/${activityEvent.id}`)
      .set(authHeaders(token));
    expect(activityDetailRes.status).toBe(200);
    expect(activityDetailRes.body?.data?._id).toBe(activityId);
  });
});

describe("Ownership de Activity por perfil activo", () => {
  test("la actividad pertenece al perfil activo: la ve otro miembro con ese perfil, no otro perfil ni un ajeno", async () => {
    const runId = Date.now();
    const { token: ownerToken, sub: ownerSub } = await registerAndLogin(
      "act_own",
      runId,
    );

    const bandProfileId = await createPlace(
      ownerToken,
      `act_band_${shortSuffix(runId)}`,
    );
    const otherProfileId = await createPlace(
      ownerToken,
      `act_othr_${shortSuffix(runId)}`,
    );

    await setActiveProfile(ownerSub, bandProfileId);

    const createRes = await createActivity(ownerToken, {
      title: "Ensayo de la banda",
      type: "rehearsal",
      start: daysFromNow(3).toISOString(),
      owner_profile_id: new mongoose.Types.ObjectId().toString(),
      owner_profile_entity: "Artist",
    });
    expect([200, 201]).toContain(createRes.status);
    const activityId = createRes.body?.data?._id;

    expect(createRes.body?.data?.owner_profile_id).toBe(bandProfileId);
    expect(createRes.body?.data?.owner_profile_entity).toBe("Place");

    expect(activityIdsOf(await listActivities(ownerToken))).toContain(
      activityId,
    );

    await setActiveProfile(ownerSub, otherProfileId);
    expect(activityIdsOf(await listActivities(ownerToken))).not.toContain(
      activityId,
    );

    const { token: memberToken, sub: memberSub } = await registerAndLogin(
      "act_mbr",
      runId,
    );
    await grantProfileMembership(memberSub, {
      entityName: "Place",
      id: bandProfileId,
    });
    await setActiveProfile(memberSub, bandProfileId);

    expect(activityIdsOf(await listActivities(memberToken))).toContain(
      activityId,
    );

    const memberCalendarRes = await getAllEvents(memberToken, {
      from: daysFromNow(-5).toISOString(),
      to: daysFromNow(20).toISOString(),
      types: "activity",
    });
    expect(memberCalendarRes.status).toBe(200);
    const memberActivityEvent = memberCalendarRes.body.data.find(
      (event) => event.id === activityId,
    );
    expect(memberActivityEvent).toBeTruthy();
    expect(memberActivityEvent.entityId).toBe(bandProfileId);

    const { token: strangerToken } = await registerAndLogin("act_str", runId);
    expect(activityIdsOf(await listActivities(strangerToken))).not.toContain(
      activityId,
    );

    const strangerUpdateRes = await request(app)
      .put(`/activities/${activityId}`)
      .set(authHeaders(strangerToken))
      .send({ title: "Secuestrado" });
    expect(strangerUpdateRes.status).toBeGreaterThanOrEqual(400);

    const strangerDeleteRes = await request(app)
      .delete(`/activities/${activityId}`)
      .set(authHeaders(strangerToken));
    expect(strangerDeleteRes.status).toBeGreaterThanOrEqual(400);

    const afterAttacksRes = await request(app)
      .get(`/activities/${activityId}`)
      .set(authHeaders(memberToken));
    expect(afterAttacksRes.status).toBe(200);
    expect(afterAttacksRes.body?.data?.title).toBe("Ensayo de la banda");

    await setActiveProfile(ownerSub, bandProfileId);
    const ownerUpdateRes = await request(app)
      .put(`/activities/${activityId}`)
      .set(authHeaders(ownerToken))
      .send({
        title: "Ensayo de la banda (reprogramado)",
        owner_profile_id: otherProfileId,
      });
    expect(ownerUpdateRes.status).toBe(200);
    expect(ownerUpdateRes.body?.data?.title).toBe(
      "Ensayo de la banda (reprogramado)",
    );
    expect(ownerUpdateRes.body?.data?.owner_profile_id.toString()).toBe(
      bandProfileId,
    );

    const unresolvableProfileId = new mongoose.Types.ObjectId().toString();
    await setActiveProfile(ownerSub, unresolvableProfileId);

    const noProfileListRes = await listActivities(ownerToken);
    expect(noProfileListRes.status).toBe(200);
    expect(noProfileListRes.body?.data).toHaveLength(0);

    const noProfileCalendarRes = await getAllEvents(ownerToken, {
      from: daysFromNow(-5).toISOString(),
      to: daysFromNow(20).toISOString(),
      types: "activity",
    });
    expect(noProfileCalendarRes.status).toBe(200);
    expect(noProfileCalendarRes.body?.data).toHaveLength(0);

    await setActiveProfile(ownerSub, bandProfileId);
    const ownerDeleteRes = await request(app)
      .delete(`/activities/${activityId}`)
      .set(authHeaders(ownerToken));
    expect(ownerDeleteRes.status).toBe(200);
  });
});
