const mongoose = require("mongoose");

const NO_RESULTS_FILTER = { _id: { $in: [] } };

const PROFILE_ENTITIES = ["Artist", "Place", "User"];

function buildProfileOwner(profileId, profileEntity) {
  if (!profileId || !mongoose.Types.ObjectId.isValid(profileId)) {
    return null;
  }

  return {
    owner_profile_id: new mongoose.Types.ObjectId(profileId),
    owner_profile_entity: profileEntity,
  };
}

// El perfil activo por defecto (mientras el User no conmute a otro) es el propio User.
function isOwnUserProfileActive(user) {
  const activeIdentifier = user?.currentProfileIdentifier;

  return (
    !!user &&
    (!activeIdentifier ||
      activeIdentifier === user.username ||
      activeIdentifier === (user.id || user._id)?.toString())
  );
}

/**
 * Una Activity pertenece al PERFIL activo del request (Artist/Place/User), no al
 * User autenticado: así los miembros de una banda ven la agenda de la banda.
 *
 * registerUserProfile() (helpers/api_key.js) no resuelve bien el perfil cuando el
 * User nunca conmutó: deja `currentProfileEntity` vacío y, si el User ya posee
 * alguna entidad cuyo snapshot en roles no tiene username (toda Activity, por
 * ejemplo), la devuelve a ella como perfil activo. Por eso acá solo se acepta lo
 * que sea un perfil real y, si no lo es, se cae al propio User; arreglado eso de
 * raíz, este fallback se puede quitar.
 */
function resolveActiveProfileOwner(req) {
  if (PROFILE_ENTITIES.includes(req?.currentProfileEntity)) {
    return buildProfileOwner(
      req.currentProfileInfo?.id,
      req.currentProfileEntity
    );
  }

  return isOwnUserProfileActive(req?.user)
    ? buildProfileOwner(req.user.id || req.user._id, "User")
    : null;
}

// Sin perfil activo resoluble no hay forma de acotar por identidad: se devuelve
// vacío, nunca la colección entera (fail-closed).
function buildActivityVisibilityFilter({ req }) {
  return resolveActiveProfileOwner(req) || NO_RESULTS_FILTER;
}

// El dueño lo pone el servidor: si el cliente manda owner_profile_id /
// owner_profile_entity en el body, se descartan.
function buildActivityCreatePayload({ body, req }) {
  const owner = resolveActiveProfileOwner(req);

  if (!owner) {
    throw new Error(
      "Cannot create an Activity without a resolvable active profile."
    );
  }

  const { owner_profile_id, owner_profile_entity, ...clientFields } = body;

  return { ...clientFields, ...owner };
}

function assertActivityBelongsToActiveProfile({ existingEntity, req }) {
  const owner = resolveActiveProfileOwner(req);

  const belongsToActiveProfile =
    !!owner &&
    !!existingEntity?.owner_profile_id &&
    existingEntity.owner_profile_id.equals(owner.owner_profile_id) &&
    existingEntity.owner_profile_entity === owner.owner_profile_entity;

  if (!belongsToActiveProfile) {
    throw new Error("Permission denied");
  }
}

module.exports = {
  resolveActiveProfileOwner,
  buildActivityVisibilityFilter,
  buildActivityCreatePayload,
  assertActivityBelongsToActiveProfile,
};
