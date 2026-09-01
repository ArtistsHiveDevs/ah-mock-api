const { getModelWithSchema } = require("./getModel");
const { schema: countrySchema } = require("../models/parametrics/geo/Country.schema");

const mapsByEnv = new Map();
const loadsByEnv = new Map();

async function buildCountrySIDMaps(env) {
  const CountryModel = getModelWithSchema(env, "Country", countrySchema);
  const countries = await CountryModel.find({}, "_id sID").lean();

  const byObjectId = new Map();
  const bySID = new Map();

  countries.forEach(({ _id, sID }) => {
    if (!sID) return;
    byObjectId.set(String(_id), sID);
    bySID.set(sID, String(_id));
  });

  const maps = { byObjectId, bySID };
  mapsByEnv.set(env, maps);
  return maps;
}

function warmCountrySIDMaps(env) {
  if (!env) return Promise.resolve(null);
  if (mapsByEnv.has(env)) return Promise.resolve(mapsByEnv.get(env));

  if (!loadsByEnv.has(env)) {
    loadsByEnv.set(
      env,
      buildCountrySIDMaps(env).finally(() => loadsByEnv.delete(env)),
    );
  }

  return loadsByEnv.get(env);
}

function toCountrySID(env, objectId) {
  if (!objectId) return objectId;
  const maps = mapsByEnv.get(env);
  return maps?.byObjectId.get(String(objectId)) || objectId;
}

function toCountryObjectId(env, value) {
  if (!value) return value;
  const maps = mapsByEnv.get(env);
  return maps?.bySID.get(String(value)) || value;
}

module.exports = { warmCountrySIDMaps, toCountrySID, toCountryObjectId };
