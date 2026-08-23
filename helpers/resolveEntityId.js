const mongoose = require("mongoose");
const { normalizeProfileId } = require("../models/appbase/EntityDirectory");
const { getModel } = require("./getModel");

// User/Artist/Place comparten el namespace único global de sID vía
// EntityDirectory (ver models/appbase/EntityDirectory.js), así que se
// resuelven ahí. Cualquier otro modelo con su propio campo `sID` local
// (Event, Country, Language, ...) se resuelve contra su propia colección.
const ENTITY_DIRECTORY_MODELS = ["User", "Artist", "Place"];

/**
 * Resuelve un identificador recibido del cliente (ObjectId real, o sID
 * enmascarado que el cliente reenvía creyendo que es el _id) al ObjectId
 * real que Mongo necesita para hacer la query.
 *
 * @param {string} value - Valor recibido (param de URL o campo del body).
 * @param {string} modelName - Nombre del modelo al que pertenece `value`.
 * @param {import("mongoose").Connection} connection - Conexión del entorno actual.
 * @returns {Promise<string|import("mongoose").Types.ObjectId>} El ObjectId real.
 * @throws {Error} Si `value` no es un ObjectId válido y no se encuentra ninguna
 *   entidad con ese sID -- el caller debe traducir esto a un 404, no un 500.
 */
async function resolveId(value, modelName, connection) {
  if (value === undefined || value === null) {
    return value;
  }

  // Mismo chequeo usado en el resto del repo (ej. operations/domain/artists/router.js)
  // para distinguir un ObjectId real de un identificador alternativo.
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value;
  }

  if (ENTITY_DIRECTORY_MODELS.includes(modelName)) {
    const normalized = await normalizeProfileId(value, connection);
    return normalized.entity_id;
  }

  const env = connection.environment || connection.name;
  const Model = await getModel(env, modelName);
  const found = await Model.findOne({ sID: value }).select("_id");

  if (!found) {
    throw new Error(
      `Entidad no encontrada para el identificador proporcionado: ${value} (${modelName})`,
    );
  }

  return found._id;
}

module.exports = { resolveId };
