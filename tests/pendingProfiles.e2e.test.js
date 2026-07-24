/**
 * Test e2e (API-level, sin browser) de la cola de revisión manual de perfiles
 * (Artist / Place): approval_status por default "pending" al crear, y solo un
 * usuario con is_platform_admin === true (NO el OWNER de la entidad) puede
 * listar la cola y aprobar/rechazar.
 *
 * Mismo setup que tests/openCallFlow.e2e.test.js: MongoDB en memoria
 * (mongodb-memory-server), login vía Cognito mockeado (por `sub`).
 */

const crypto = require("crypto");
const mongoose = require("mongoose");

jest.mock("../helpers/cognitoService", () => {
  const emailsBySub = new Map();

  return {
    CognitoUserNotFoundError: class extends Error {},
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

// Lee el snapshot denormalizado de la entidad en User.roles[].entityRoleMap
// (mismo lugar de donde el frontend ya lee verified_status en MembershipsList).
async function getEntityRoleMapSnapshot(userId, entityName, entityId) {
  const { getModel } = require("../helpers/getModel");
  const UserModel = await getModel(TEST_ENV, "User");
  const user = await UserModel.findById(userId).lean();
  const roleGroup = (user?.roles || []).find(
    (group) => group.entityName === entityName,
  );
  return (roleGroup?.entityRoleMap || []).find(
    (entry) => entry.id.toString() === entityId.toString(),
  );
}

beforeAll(async () => {
  request = require("supertest");
  const { MongoMemoryServer } = require("mongodb-memory-server");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI_DEV = mongoServer.getUri("ah_mock_api_e2e_pending");

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

describe("Cola de revisión manual de perfiles (Artist / Place)", () => {
  test("flujo completo: pending por default, listado y aprobación/rechazo restringidos a is_platform_admin", async () => {
    const runId = Date.now();

    // --- Usuario A: dueño de un Artist ---
    const subA = `sub-pending-artist-owner-${runId}`;
    const registerA = await registerUser({
      sub: subA,
      username: `pending_artist_owner_${runId}`,
    });
    expect(registerA.status).toBe(201);
    const userAId = registerA.body?.data?._id;
    const tokenA = await loginUser(subA);

    const createArtistRes = await request(app)
      .post("/artists")
      .set(authHeaders(tokenA))
      .send({ name: "Pending Artist Test" });
    expect(createArtistRes.status).toBe(201);
    const artistId = createArtistRes.body?.data?._id;
    expect(artistId).toBeTruthy();
    // Default al crear: "pending".
    expect(createArtistRes.body?.data?.approval_status).toBe("pending");

    // El snapshot en User.roles[].entityRoleMap (lo que lee MembershipsList en
    // el frontend) refleja "pending" desde la creación, no solo la respuesta del POST.
    const artistSnapshotAfterCreate = await getEntityRoleMapSnapshot(
      userAId,
      "Artist",
      artistId,
    );
    expect(artistSnapshotAfterCreate?.approval_status).toBe("pending");

    // --- Usuario B: dueño de un Place ---
    const subB = `sub-pending-place-owner-${runId}`;
    const registerB = await registerUser({
      sub: subB,
      username: `pending_place_owner_${runId}`,
    });
    expect(registerB.status).toBe(201);
    const userBId = registerB.body?.data?._id;
    const tokenB = await loginUser(subB);

    const createPlaceRes = await request(app)
      .post("/places")
      .set(authHeaders(tokenB))
      .send({
        username: `pending_place_${runId}`,
        name: "Pending Place Test",
        place_type: "Bar",
        city: "Bogotá",
        country: FAKE_COUNTRY_ID,
        genres: {},
      });
    expect([200, 201]).toContain(createPlaceRes.status);
    const placeId = createPlaceRes.body?.data?._id;
    expect(placeId).toBeTruthy();
    expect(createPlaceRes.body?.data?.approval_status).toBe("pending");

    // --- Usuario A (sin is_platform_admin) NO puede listar la cola ---
    const forbiddenListRes = await request(app)
      .get("/admin/pending-profiles")
      .set(authHeaders(tokenA));
    expect(forbiddenListRes.status).toBe(401);
    expect(forbiddenListRes.body?.errorCode).toBe("AUTH_PERMISSION_DENIED");

    // --- Usuario A (OWNER del Artist, sin is_platform_admin) NO puede autoaprobarse ---
    const forbiddenReviewRes = await request(app)
      .post("/admin/pending-profiles/review")
      .set(authHeaders(tokenA))
      .send({ entityType: "Artist", id: artistId, status: "approved" });
    expect(forbiddenReviewRes.status).toBe(401);
    expect(forbiddenReviewRes.body?.errorCode).toBe("AUTH_PERMISSION_DENIED");

    // --- Usuario D: admin de plataforma (seteado directamente en DB, sin endpoint) ---
    const subD = `sub-platform-admin-${runId}`;
    const registerD = await registerUser({
      sub: subD,
      username: `platform_admin_${runId}`,
    });
    expect(registerD.status).toBe(201);
    const userDId = registerD.body?.data?._id;

    const { getModel } = require("../helpers/getModel");
    const UserModel = await getModel(TEST_ENV, "User");
    await UserModel.findByIdAndUpdate(userDId, {
      $set: { is_platform_admin: true },
    });

    const tokenD = await loginUser(subD);

    // --- El admin SÍ puede listar la cola y ve el Artist y el Place creados ---
    const listRes = await request(app)
      .get("/admin/pending-profiles")
      .set(authHeaders(tokenD));
    expect(listRes.status).toBe(200);

    const listedArtist = (listRes.body?.data?.artists || []).find(
      (artist) => artist._id === artistId,
    );
    expect(listedArtist).toBeTruthy();
    expect(listedArtist.approval_status).toBe("pending");
    expect(listedArtist.entityType).toBe("Artist");

    const listedPlace = (listRes.body?.data?.places || []).find(
      (place) => place._id === placeId,
    );
    expect(listedPlace).toBeTruthy();
    expect(listedPlace.approval_status).toBe("pending");
    expect(listedPlace.entityType).toBe("Place");

    // --- El admin aprueba el Artist ---
    const approveRes = await request(app)
      .post("/admin/pending-profiles/review")
      .set(authHeaders(tokenD))
      .send({ entityType: "Artist", id: artistId, status: "approved" });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body?.data?.approval_status).toBe("approved");

    // El review también resincroniza el snapshot en User.roles[].entityRoleMap
    // del dueño del Artist (no solo el documento Artist en sí).
    const artistSnapshotAfterApprove = await getEntityRoleMapSnapshot(
      userAId,
      "Artist",
      artistId,
    );
    expect(artistSnapshotAfterApprove?.approval_status).toBe("approved");

    // --- El admin rechaza el Place ---
    const rejectRes = await request(app)
      .post("/admin/pending-profiles/review")
      .set(authHeaders(tokenD))
      .send({ entityType: "Place", id: placeId, status: "rejected" });
    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body?.data?.approval_status).toBe("rejected");

    const placeSnapshotAfterReject = await getEntityRoleMapSnapshot(
      userBId,
      "Place",
      placeId,
    );
    expect(placeSnapshotAfterReject?.approval_status).toBe("rejected");

    // --- Ya revisados, no vuelven a aparecer en la cola de pendientes ---
    const listAfterReviewRes = await request(app)
      .get("/admin/pending-profiles")
      .set(authHeaders(tokenD));
    expect(listAfterReviewRes.status).toBe(200);
    expect(
      (listAfterReviewRes.body?.data?.artists || []).find(
        (artist) => artist._id === artistId,
      ),
    ).toBeFalsy();
    expect(
      (listAfterReviewRes.body?.data?.places || []).find(
        (place) => place._id === placeId,
      ),
    ).toBeFalsy();
  });
});
