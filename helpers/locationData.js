const {
  findLocationByPath,
} = require("../operations/parametrics/general/locationEntities/countries-data");

const LEVEL_NAMES = ["country", "state", "city", "district", "neighborhood"];

/** Expande country/level1/level2 al array [{ level, label, value }] que consume el front. */
const enrichLocationData = (
  env,
  countryField,
  level1Field,
  level2Field,
  returnChildren = false,
) => {
  // countryField puede venir como sID, ObjectId o ISO code
  // findLocationByPath busca por value (ISO) o id (ObjectId) o sID
  const path = [countryField, level1Field, level2Field].filter(Boolean);

  if (path.length === 0) return [];

  const locationData = [];

  for (let i = 1; i <= path.length; i++) {
    const levelData = findLocationByPath(path.slice(0, i), returnChildren);
    if (levelData) {
      locationData.push({
        level: LEVEL_NAMES[i - 1],
        label: levelData.label,
        value: levelData.value,
        // El país usa sID, los demás niveles usan value
        ...(levelData.sID ? { id: levelData.sID } : {}),
      });
    }
  }
  return locationData;
};

const buildLocationFieldData = (env, entity = {}, fieldName) =>
  enrichLocationData(
    env,
    entity[`${fieldName}_country`],
    entity[`${fieldName}_level1`],
    entity[`${fieldName}_level2`],
  );

/** Atajo para el campo `home_city` de cualquier entidad que persista sus niveles. */
const buildHomeCityData = (env, entity = {}) =>
  buildLocationFieldData(env, entity, "home_city");

/** Los niveles crudos ya viajan dentro de `<campo>Data`: se omiten para no duplicar el mismo dato. */
const omitRawLocationFields = (entity = {}, fieldNames = []) => {
  const clean = { ...entity };
  fieldNames.forEach((fieldName) => {
    ["country", "level1", "level2", "level3"].forEach((suffix) => {
      delete clean[`${fieldName}_${suffix}`];
    });
  });
  return clean;
};

module.exports = {
  enrichLocationData,
  buildLocationFieldData,
  buildHomeCityData,
  omitRawLocationFields,
};
