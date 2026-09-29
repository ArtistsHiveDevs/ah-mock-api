const { getModel } = require("./getModel");

// Forma mínima que el frontend realmente necesita (ver TemporaryAccessGrant/TrustedInstanceGrant
// en models/base/template.ts) -- _id, targetEntityType y targetEntityId son de uso exclusivo del
// backend para resolver la consulta y nunca deben viajar en la respuesta.
function toClientGrant(grant) {
  const clientGrant = {
    identifier: grant.identifier,
    expiresAt: grant.expiresAt,
    fieldPaths: grant.fieldPaths || [],
  };
  if (grant.reason) {
    clientGrant.reason = grant.reason;
  }
  if (grant.grantType === "trusted") {
    clientGrant.roles = grant.roles || [];
  }
  return clientGrant;
}

/**
 * Grants vigentes de `viewerProfile` sobre un entity puntual (Artist/Place/...), ya en la forma
 * mínima de toClientGrant y separados en temporary/trusted. Usar esto en cualquier lugar donde
 * ese entity se muestre al usuario -- endpoint dedicado o populado dentro de otra entidad (ej.
 * OpenCallApplication.artist_id) -- para no dejar inconsistente qué ve el frontend según por
 * dónde llegó el dato.
 */
async function getViewerAccessGrants(env, entityType, entityId, viewerProfile) {
  const viewerIdentifiers = [
    viewerProfile?.identifier,
    viewerProfile?.username,
    viewerProfile?.id,
  ]
    .filter(Boolean)
    .map(String);

  if (!viewerIdentifiers.length) {
    return { temporaryAccessInstances: [], trustedInstances: [] };
  }

  const AccessGrantModel = await getModel(env, "AccessGrant");
  const grants = await AccessGrantModel.find({
    targetEntityType: entityType,
    targetEntityId: entityId,
    identifier: { $in: viewerIdentifiers },
    expiresAt: { $gt: new Date() },
  }).lean();

  return {
    temporaryAccessInstances: grants
      .filter((grant) => grant.grantType !== "trusted")
      .map(toClientGrant),
    trustedInstances: grants
      .filter((grant) => grant.grantType === "trusted")
      .map(toClientGrant),
  };
}

function grantCoversSubpage(grant, subpage) {
  return (
    !grant.fieldPaths?.length ||
    grant.fieldPaths.some(
      (path) => path === subpage || path.startsWith(`${subpage}.`),
    )
  );
}

// Resuelve el entity real al que apunta un grant (Artist/Place/...). AccessGrant vive en la
// conexión general; usar esto en vez de `.populate('targetEntityId')`, que falla para
// targetEntityType === "Artist" (ver comentario en models/domain/AccessGrant.schema.js).
async function resolveGrantTargetEntity(grant, env) {
  const TargetModel = await getModel(env, grant.targetEntityType);
  return TargetModel.findById(grant.targetEntityId);
}

module.exports = {
  toClientGrant,
  getViewerAccessGrants,
  grantCoversSubpage,
  resolveGrantTargetEntity,
};
