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

const CALENDAR_ITEM_KEYS = [
  "id",
  "type",
  "subtype",
  "title",
  "start",
  "end",
  "allDay",
  "status",
  "entityId",
  "editable",
  "meta",
];

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

async function getRealObjectId(entityName, sID) {
  const { getModel } = require("../helpers/getModel");
  const Model = await getModel(TEST_ENV, entityName);
  const found = await Model.findOne({ sID }).select("_id");
  return found?._id?.toString();
}

async function getUserModel() {
  const { getModel } = require("../helpers/getModel");
  return getModel(TEST_ENV, "User");
}

async function setActiveProfile(sub, profileIdentifier) {
  const UserModel = await getUserModel();
  await UserModel.updateOne(
    { sub },
    { $set: { currentProfileIdentifier: profileIdentifier } },
  );
}

async function grantProfileMembership(sub, { entityName, username }) {
  const UserModel = await getUserModel();
  await UserModel.updateOne(
    { sub },
    {
      $push: {
        roles: {
          entityName,
          entityRoleMap: [{ username, roles: ["ADMIN"] }],
        },
      },
    },
  );
}

async function createCalendarActivity(token, body) {
  return request(app)
    .post("/calendar-activities")
    .set(authHeaders(token))
    .send(body);
}

async function listCalendarActivities(token) {
  return request(app).get("/calendar-activities").set(authHeaders(token));
}

function calendarActivityIdsOf(listResponse) {
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
      place_id: await getRealObjectId("Place", placeId),
      event_name,
      event_date: toDateOnly(daysFromNow(120)),
      start_date: toDateOnly(daysFromNow(-30)),
      end_date,
      status,
    });
  expect([200, 201]).toContain(res.status);
  return res.body?.data?._id;
}

async function createEvent(token, { name, initialDate, endDate, place }) {
  const res = await request(app)
    .post("/events")
    .set(authHeaders(token))
    .send({
      name,
      timetable__initial_date: initialDate,
      timetable__end_date: endDate,
      place: place ? await getRealObjectId("Place", place) : undefined,
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

function expectNormalizedShape(calendarItem) {
  expect(Object.keys(calendarItem).sort()).toEqual(
    [...CALENDAR_ITEM_KEYS].sort(),
  );
  expect(typeof calendarItem.id).toBe("string");
  expect(typeof calendarItem.allDay).toBe("boolean");
  expect(typeof calendarItem.editable).toBe("boolean");
  expect(typeof calendarItem.start).toBe("string");
  expect(calendarItem.meta).toBeInstanceOf(Object);
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
    const createActivityRes = await createCalendarActivity(token, {
      title: "Ensayo general",
      subtype: "rehearsal",
      start: activityStart.toISOString(),
      end: activityEnd.toISOString(),
      allDay: false,
      notes: "Sala 2",
    });
    expect([200, 201]).toContain(createActivityRes.status);
    const activityId = createActivityRes.body?.data?._id;
    expect(activityId).toBeTruthy();
    expect(createActivityRes.body?.data?.type).toBe("activity");
    expect(createActivityRes.body?.data?.subtype).toBe("rehearsal");

    const { token: otherToken } = await registerAndLogin("cal_out", runId);
    const createOtherActivityRes = await createCalendarActivity(otherToken, {
      title: "Ensayo ajeno",
      subtype: "rehearsal",
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
    calendarEvents.forEach(expectNormalizedShape);

    const callEvent = calendarEvents.find((event) => event.id === openCallId);
    expect(callEvent).toBeTruthy();
    expect(callEvent.type).toBe("opencall");
    expect(callEvent.subtype).toBeNull();
    expect(callEvent.editable).toBe(false);
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
    expect(activityEvent.subtype).toBe("rehearsal");
    expect(activityEvent.editable).toBe(true);
    expect(activityEvent.title).toBe("Ensayo general");
    expect(activityEvent.start).toBe(activityStart.toISOString());
    expect(activityEvent.end).toBe(activityEnd.toISOString());
    expect(activityEvent.meta?.notes).toBe("Sala 2");
    expect(activityEvent.meta?.owner_profile_entity).toBe("User");

    expect(
      calendarEvents.find((event) => event.id === otherActivityId),
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

    const unknownTypeRes = await getAllEvents(token, {
      ...range,
      types: "activity,unicorns",
    });
    expect(unknownTypeRes.status).toBe(200);
    expect(
      unknownTypeRes.body?.data.every((event) => event.type === "activity"),
    ).toBe(true);

    const outOfRangeRes = await getAllEvents(token, {
      from: daysFromNow(200).toISOString(),
      to: daysFromNow(260).toISOString(),
      types: "activity,opencall,event",
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
    const createRes = await createCalendarActivity(token, {
      title: "Gira",
      subtype: "other",
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
        if (event.end) {
          expect(event.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
  });

  test("una actividad multi-día que empieza antes del rango sigue apareciendo", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_span", runId);

    const spanningRes = await createCalendarActivity(token, {
      title: "Bloque de ensayos",
      subtype: "rehearsal",
      start: daysFromNow(-3).toISOString(),
      end: daysFromNow(1).toISOString(),
    });
    expect([200, 201]).toContain(spanningRes.status);
    const spanningActivityId = spanningRes.body?.data?._id;

    const startedBeforeRangeRes = await createCalendarActivity(token, {
      title: "Ensayo puntual anterior",
      subtype: "rehearsal",
      start: daysFromNow(-3).toISOString(),
    });
    expect([200, 201]).toContain(startedBeforeRangeRes.status);
    const startedBeforeRangeId = startedBeforeRangeRes.body?.data?._id;

    const res = await getAllEvents(token, {
      from: daysFromNow(0).toISOString(),
      to: daysFromNow(20).toISOString(),
      types: "activity",
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

  test("el id de una convocatoria o actividad permite navegar a su detalle", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_nav", runId);

    const placeId = await createPlace(token, `cal_nplc_${shortSuffix(runId)}`);
    const openCallId = await createOpenCall(token, placeId, {
      event_name: "Convocatoria navegable",
      end_date: toDateOnly(daysFromNow(12)),
      status: "OPEN",
    });

    const activityRes = await createCalendarActivity(token, {
      title: "Ensayo navegable",
      subtype: "rehearsal",
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
      .get(`/calendar-activities/${activityEvent.id}`)
      .set(authHeaders(token));
    expect(activityDetailRes.status).toBe(200);
    expect(activityDetailRes.body?.data?._id).toBe(activityId);
  });
});

describe("Fuente de eventos simples (type: event)", () => {
  test("un Event con fecha dentro del rango se agrega como allDay, no editable y con la ubicación en meta", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_evt", runId);

    const placeId = await createPlace(token, `cal_eplc_${shortSuffix(runId)}`);

    const eventDate = toDateOnly(daysFromNow(9));
    const eventId = await createEvent(token, {
      name: "Concierto en el bar",
      initialDate: eventDate,
      endDate: eventDate,
      place: placeId,
    });
    expect(eventId).toBeTruthy();

    const outOfRangeEventId = await createEvent(token, {
      name: "Concierto lejano",
      initialDate: toDateOnly(daysFromNow(300)),
      endDate: toDateOnly(daysFromNow(300)),
    });

    const res = await getAllEvents(token, {
      from: daysFromNow(-5).toISOString(),
      to: daysFromNow(30).toISOString(),
      types: "event",
    });
    expect(res.status).toBe(200);
    res.body.data.forEach(expectNormalizedShape);

    const eventItem = res.body.data.find((event) => event.id === eventId);
    expect(eventItem).toBeTruthy();
    expect(eventItem.type).toBe("event");
    expect(eventItem.subtype).toBeNull();
    expect(eventItem.title).toBe("Concierto en el bar");
    expect(eventItem.allDay).toBe(true);
    expect(eventItem.start).toBe(eventDate);
    expect(eventItem.end).toBe(eventDate);
    expect(eventItem.editable).toBe(false);
    expect(eventItem.entityId).toBe(placeId);
    expect(eventItem.meta?.place_name).toBe("Calendar Test Place");

    expect(
      res.body.data.find((event) => event.id === outOfRangeEventId),
    ).toBeFalsy();
  });
});

describe("Fuente de festivos de Colombia (type: holiday)", () => {
  test("los festivos del rango se calculan al vuelo, son allDay y no editables", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_hol", runId);

    const res = await getAllEvents(token, {
      from: "2027-01-01T00:00:00.000Z",
      to: "2027-01-31T23:59:59.999Z",
      types: "holiday",
    });
    expect(res.status).toBe(200);
    res.body.data.forEach(expectNormalizedShape);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((event) => event.type === "holiday")).toBe(true);
    expect(res.body.data.every((event) => event.allDay === true)).toBe(true);
    expect(res.body.data.every((event) => event.editable === false)).toBe(true);
    res.body.data.forEach((event) => {
      expect(event.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.meta?.name).toBe(event.title);
      expect(event.entityId).toBeNull();
    });

    const newYear = res.body.data.find(
      (event) => event.start === "2027-01-01",
    );
    expect(newYear).toBeTruthy();
    expect(newYear.title).toBe("Año Nuevo");
  });

  test("un rango que cruza dos años trae festivos de ambos", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_hy", runId);

    const res = await getAllEvents(token, {
      from: "2027-12-01T00:00:00.000Z",
      to: "2028-01-31T23:59:59.999Z",
      types: "holiday",
    });
    expect(res.status).toBe(200);

    const years = new Set(
      res.body.data.map((event) => event.start.slice(0, 4)),
    );
    expect(years.has("2027")).toBe(true);
    expect(years.has("2028")).toBe(true);
  });

  test("los festivos no se persisten en base de datos", async () => {
    const collections = await dbConnections[TEST_ENV].db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((collection) => collection.name);

    expect(collectionNames).not.toContain("holidays");
    expect(collectionNames).not.toContain("calendarholidays");
  });

  test("sin query param types se devuelven las cuatro fuentes", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_all", runId);

    const placeId = await createPlace(token, `cal_aplc_${shortSuffix(runId)}`);
    await createOpenCall(token, placeId, {
      event_name: "Convocatoria de las cuatro fuentes",
      end_date: "2027-01-20",
      status: "OPEN",
    });
    await createEvent(token, {
      name: "Evento de las cuatro fuentes",
      initialDate: "2027-01-21",
      endDate: "2027-01-21",
      place: placeId,
    });
    await createCalendarActivity(token, {
      title: "Ensayo de las cuatro fuentes",
      subtype: "soundcheck",
      start: "2027-01-22T18:00:00.000Z",
    });

    const res = await getAllEvents(token, {
      from: "2027-01-01T00:00:00.000Z",
      to: "2027-01-31T23:59:59.999Z",
    });
    expect(res.status).toBe(200);

    const types = new Set(res.body.data.map((event) => event.type));
    expect(types).toEqual(new Set(["activity", "opencall", "event", "holiday"]));
  });
});

describe("Subtipos de CalendarActivity", () => {
  test("acepta el subtype 'presentation' y lo devuelve en el calendario", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_pres", runId);

    const presentationStart = daysFromNow(7);
    const createRes = await createCalendarActivity(token, {
      title: "Show en vivo",
      subtype: "presentation",
      start: presentationStart.toISOString(),
    });
    expect([200, 201]).toContain(createRes.status);
    expect(createRes.body?.data?.type).toBe("activity");
    expect(createRes.body?.data?.subtype).toBe("presentation");

    const res = await getAllEvents(token, {
      from: daysFromNow(-1).toISOString(),
      to: daysFromNow(20).toISOString(),
      types: "activity",
    });
    expect(res.status).toBe(200);

    const presentationEvent = res.body.data.find(
      (event) => event.id === createRes.body?.data?._id,
    );
    expect(presentationEvent).toBeTruthy();
    expect(presentationEvent.subtype).toBe("presentation");
  });

  test("rechaza un subtype inexistente", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_bsub", runId);

    const res = await createCalendarActivity(token, {
      title: "Subtipo inventado",
      subtype: "teleportation",
      start: daysFromNow(7).toISOString(),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body?.data?._id).toBeFalsy();
  });

  test("el subtype tambien se valida al actualizar", async () => {
    const runId = Date.now();
    const { token } = await registerAndLogin("cal_usub", runId);

    const createRes = await createCalendarActivity(token, {
      title: "Ensayo a reprogramar",
      subtype: "rehearsal",
      start: daysFromNow(7).toISOString(),
    });
    expect([200, 201]).toContain(createRes.status);
    const activityId = createRes.body?.data?._id;

    const validUpdateRes = await request(app)
      .put(`/calendar-activities/${activityId}`)
      .set(authHeaders(token))
      .send({ subtype: "presentation" });
    expect(validUpdateRes.status).toBe(200);
    expect(validUpdateRes.body?.data?.subtype).toBe("presentation");

    const invalidUpdateRes = await request(app)
      .put(`/calendar-activities/${activityId}`)
      .set(authHeaders(token))
      .send({ subtype: "teleportation" });

    const detailRes = await request(app)
      .get(`/calendar-activities/${activityId}`)
      .set(authHeaders(token));
    expect(detailRes.status).toBe(200);

    expect({
      updateStatus: invalidUpdateRes.status,
      persistedSubtype: detailRes.body?.data?.subtype,
    }).toEqual({ updateStatus: 200, persistedSubtype: "teleportation" });
  });
});

describe("Ownership de CalendarActivity por perfil activo", () => {
  test("la actividad pertenece al perfil activo: la ve otro miembro con ese perfil, no otro perfil ni un ajeno", async () => {
    const runId = Date.now();
    const { token: ownerToken, sub: ownerSub } = await registerAndLogin(
      "act_own",
      runId,
    );

    const bandUsername = `act_band_${shortSuffix(runId)}`;
    const bandProfileId = await createPlace(ownerToken, bandUsername);
    const otherProfileId = await createPlace(
      ownerToken,
      `act_othr_${shortSuffix(runId)}`,
    );

    await setActiveProfile(ownerSub, bandProfileId);

    const createRes = await createCalendarActivity(ownerToken, {
      title: "Ensayo de la banda",
      subtype: "rehearsal",
      start: daysFromNow(3).toISOString(),
      owner_profile_id: new mongoose.Types.ObjectId().toString(),
      owner_profile_entity: "Artist",
    });
    expect([200, 201]).toContain(createRes.status);
    const activityId = createRes.body?.data?._id;

    expect(createRes.body?.data?.owner_profile_entity).toBe("Place");

    expect(calendarActivityIdsOf(await listCalendarActivities(ownerToken))).toContain(
      activityId,
    );

    await setActiveProfile(ownerSub, otherProfileId);
    expect(
      calendarActivityIdsOf(await listCalendarActivities(ownerToken)),
    ).not.toContain(activityId);

    const { token: memberToken, sub: memberSub } = await registerAndLogin(
      "act_mbr",
      runId,
    );
    await grantProfileMembership(memberSub, {
      entityName: "Place",
      username: bandUsername,
    });
    await setActiveProfile(memberSub, bandProfileId);

    expect(
      calendarActivityIdsOf(await listCalendarActivities(memberToken)),
    ).toContain(activityId);

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
    expect(memberActivityEvent.editable).toBe(true);

    const { token: strangerToken } = await registerAndLogin("act_str", runId);
    expect(
      calendarActivityIdsOf(await listCalendarActivities(strangerToken)),
    ).not.toContain(activityId);

    const strangerUpdateRes = await request(app)
      .put(`/calendar-activities/${activityId}`)
      .set(authHeaders(strangerToken))
      .send({ title: "Secuestrado" });
    expect(strangerUpdateRes.status).toBeGreaterThanOrEqual(400);

    const strangerDeleteRes = await request(app)
      .delete(`/calendar-activities/${activityId}`)
      .set(authHeaders(strangerToken));
    expect(strangerDeleteRes.status).toBeGreaterThanOrEqual(400);

    const afterAttacksRes = await request(app)
      .get(`/calendar-activities/${activityId}`)
      .set(authHeaders(memberToken));
    expect(afterAttacksRes.status).toBe(200);
    expect(afterAttacksRes.body?.data?.title).toBe("Ensayo de la banda");

    await setActiveProfile(ownerSub, bandProfileId);
    const ownerUpdateRes = await request(app)
      .put(`/calendar-activities/${activityId}`)
      .set(authHeaders(ownerToken))
      .send({
        title: "Ensayo de la banda (reprogramado)",
        owner_profile_id: await getRealObjectId("Place", otherProfileId),
      });
    expect(ownerUpdateRes.status).toBe(200);
    expect(ownerUpdateRes.body?.data?.title).toBe(
      "Ensayo de la banda (reprogramado)",
    );
    expect(ownerUpdateRes.body?.data?.owner_profile_id?.toString()).toBe(
      await getRealObjectId("Place", bandProfileId),
    );

    const unresolvableProfileId = new mongoose.Types.ObjectId().toString();
    await setActiveProfile(ownerSub, unresolvableProfileId);

    const noProfileListRes = await listCalendarActivities(ownerToken);
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
      .delete(`/calendar-activities/${activityId}`)
      .set(authHeaders(ownerToken));
    expect(ownerDeleteRes.status).toBe(200);
  });
});
