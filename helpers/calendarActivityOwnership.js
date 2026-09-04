const mongoose = require("mongoose");
const { normalizeProfileId } = require("../models/appbase/EntityDirectory");

const NO_RESULTS_FILTER = { _id: { $in: [] } };

function resolveActiveProfileIdentifier(user) {
  return (
    user?.currentProfileIdentifier ||
    user?.username ||
    (user?.id || user?._id)?.toString()
  );
}

async function resolveProfileFromDirectory(identifier, connection) {
  if (!identifier || !connection) {
    return null;
  }

  try {
    const profile = await normalizeProfileId(identifier, connection);
    return profile?.entity_id ? profile : null;
  } catch (err) {
    console.warn(
      `[calendarActivityOwnership] No se pudo resolver el perfil activo "${identifier}": ${err.message}`,
    );
    return null;
  }
}

function userBelongsToProfile(user, profile) {
  const profileEntityId = profile.entity_id.toString();

  if (profile.entityType === "User") {
    return (user?.id || user?._id)?.toString() === profileEntityId;
  }

  return (user?.roles || []).some(
    (role) =>
      role.entityName === profile.entityType &&
      (role.entityRoleMap || []).some(
        (roleMap) =>
          roleMap.id?.toString() === profileEntityId ||
          (!!profile.username && roleMap.username === profile.username),
      ),
  );
}

async function resolveActiveProfile(req) {
  const user = req?.user;

  if (!user) {
    return null;
  }

  const profile = await resolveProfileFromDirectory(
    resolveActiveProfileIdentifier(user),
    req.dbConnection,
  );

  if (!profile || !userBelongsToProfile(user, profile)) {
    return null;
  }

  return {
    id: new mongoose.Types.ObjectId(profile.entity_id),
    entity: profile.entityType,
    sID: profile.sID || null,
    username: profile.username || null,
  };
}

function buildOwnerFields(profile) {
  return {
    owner_profile_id: profile.id,
    owner_profile_entity: profile.entity,
  };
}

async function buildCalendarActivityVisibilityFilter({ req }) {
  const profile = await resolveActiveProfile(req);

  return profile ? buildOwnerFields(profile) : NO_RESULTS_FILTER;
}

async function buildCalendarActivityCreatePayload({ body, req }) {
  const profile = await resolveActiveProfile(req);

  if (!profile) {
    throw new Error(
      "Cannot create a CalendarActivity without a resolvable active profile.",
    );
  }

  const { owner_profile_id, owner_profile_entity, ...clientFields } = body;

  return { ...clientFields, ...buildOwnerFields(profile) };
}

async function assertCalendarActivityBelongsToActiveProfile({
  existingEntity,
  req,
}) {
  const profile = await resolveActiveProfile(req);

  const belongsToActiveProfile =
    !!profile &&
    !!existingEntity?.owner_profile_id &&
    existingEntity.owner_profile_id.equals(profile.id) &&
    existingEntity.owner_profile_entity === profile.entity;

  if (!belongsToActiveProfile) {
    throw new Error("Permission denied");
  }
}

module.exports = {
  resolveActiveProfile,
  buildOwnerFields,
  buildCalendarActivityVisibilityFilter,
  buildCalendarActivityCreatePayload,
  assertCalendarActivityBelongsToActiveProfile,
};
