const mongoose = require("mongoose");
const { normalizeProfileId } = require("../models/appbase/EntityDirectory");
const { getModel } = require("./getModel");

const ENTITY_DIRECTORY_MODELS = ["User", "Artist", "Place"];

async function resolveId(value, modelName, connection) {
  if (value === undefined || value === null) {
    return value;
  }

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
