const { getModel } = require("./getModel");

// Valores conocidos de `resourceType`. No es una validación estricta (el schema no la impone),
// es sólo para evitar que cada router invente su propio string suelto.
const ANALYTICS_RESOURCE_TYPES = {
  SEARCH: "search",
  PROFILE: "profile",
  DOCUMENT: "document",
  OPEN_CALL: "open_call",
  EVENT: "event",
};

const EXCLUDED_USER_IDENTIFIERS = new Set(
  (process.env.ANALYTICS_EXCLUDED_USERS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

function isExcludedUser(req) {
  if (!req?.user || EXCLUDED_USER_IDENTIFIERS.size === 0) {
    return false;
  }

  const candidates = [
    req.user.username,
    req.user.sID,
    req.user._id?.toString(),
  ];
  return candidates.some(
    (candidate) => candidate && EXCLUDED_USER_IDENTIFIERS.has(candidate),
  );
}

// req.user es el documento completo de User (lo pone registerUserProfile en api_key.js);
// req.currentProfileInfo/req.currentProfileEntity los arma la misma función a partir de
// user.currentProfileIdentifier, así que ya vienen resueltos para cualquier request autenticado.
function buildUserSnapshot(req) {
  if (!req?.user) {
    return undefined;
  }

  return {
    id: req.user._id?.toString() || req.user.id,
    sID: req.user.sID,
    identifier: req.user.username || req.user.identifier,
    currentProfileId:
      req.currentProfileInfo?.id?.toString?.() || req.currentProfileInfo?.id,
    currentProfileEntityType: req.currentProfileEntity,
  };
}

/**
 * Registra un evento de analítica (búsqueda, vista de perfil, documento, etc.) en paralelo a la
 * respuesta del endpoint. Es "fire and forget" a propósito: nunca lanza (todo el cuerpo va en
 * try/catch acá adentro) y el caller no debe hacer `await` sobre ella, así que un solo llamado
 * sin try/catch en el sitio de la llamada es suficiente y no puede romper ni demorar la respuesta.
 *
 * @param {import('express').Request} req
 * @param {{
 *   resourceType: string,
 *   resource?: { entityType?: string, entityId?: string, query?: string, filters?: any },
 *   resultCount?: number,
 *   durationMs?: number,
 * }} eventData
 */
async function trackEvent(
  req,
  { resourceType, resource, resultCount, durationMs } = {},
) {
  try {
    if (!resourceType || isExcludedUser(req)) {
      return;
    }

    const AnalyticsEvent = await getModel(
      req.serverEnvironment,
      "AnalyticsEvent",
    );

    await AnalyticsEvent.create({
      timestamp: new Date(),
      user: buildUserSnapshot(req),
      resourceType,
      resource,
      resultCount,
      durationMs,
      environment: req.serverEnvironment,
      lang: req.lang,
      ip: req.ip,
      userAgent: req.headers?.["user-agent"],
      referrer: req.headers?.referer || req.headers?.referrer,
    });
  } catch (error) {
    console.error(
      `⚠️ [analytics] Error registrando evento "${resourceType}":`,
      error.message,
    );
  }
}

module.exports = { trackEvent, ANALYTICS_RESOURCE_TYPES };
