const mongoose = require("mongoose");
const { Schema } = mongoose;

const LocationSchema = new Schema(
  {
    country_name: String,
    country_alpha2: String,
    country_alpha3: String,
    state: String,
    city: String,
    address: String,
    latitude: Number,
    longitude: Number,
    locationPrecision: String,
  },
  { _id: false }
);
// Definir el esquema para EventTemplate
const schema = new Schema(
  {
    entityType: String,
    id: {
      type: Schema.Types.ObjectId, // Definir id como ObjectId para referenciar otros documentos
      required: true,
      refPath: "entityType", // Referencia dinámica a la colección correspondiente
    },
    shortId: String,
    profile_pic: String,
    name: String,
    username: String,
    subtitle: String,
    verified_status: Number,
    search_cache: String,
    location: [LocationSchema],
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: new Date() },
    lastSession: { type: Date, default: new Date() },
    main_date: { type: Date, default: null },
    // lang
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// El namespace de username es global y compartido entre User/Artist/Place
// (ver normalizeProfileId). sparse evita bloquear documentos legacy sin
// username mientras protege contra duplicados cuando sí está presente.
schema.index({ username: 1 }, { unique: true, sparse: true });

/**
 * Virtual para populate de recipients
 */
schema.virtual("identifier").get(function () {
  return this.username || this.shortId || this.id || this._id;
});

/**
 * Virtual para populate del modelo real (User/Artist/Place)
 * Permite acceder a campos adicionales del modelo subyacente
 */
schema.virtual("entity", {
  ref: function() {
    return this.entityType; // Retorna dinámicamente 'User', 'Artist', 'Place', etc.
  },
  localField: "id",
  foreignField: "_id",
  justOne: true,
});

/**
 * Virtual para obtener el email desde el modelo relacionado
 * Requiere que 'entity' esté populado
 */
schema.virtual("email").get(function () {
  return this.entity?.email || null;
});

// Incluye los virtuals en los resultados JSON
schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

/**
 * Normaliza un profile_id (username, shortId o ObjectId) a ObjectId de EntityDirectory
 * @param {string|ObjectId} id - Identificador a normalizar (username, shortId o ObjectId)
 * @param {Connection} connection - Conexión de Mongoose a usar
 * @returns {Promise<ObjectId>} ObjectId normalizado de EntityDirectory
 * @throws {Error} Si no se encuentra la entidad
 */
async function normalizeProfileId(id, connection) {
  // Obtener la conexión correcta para EntityDirectory
  const { connections } = require("../../db/db_g");

  // Usar la conexión del entorno actual del documento
  const env = connection.environment || connection.name;
  const entityDirectoryConnection = connections[env] || connection;

  const EntityDirectory = entityDirectoryConnection.model("EntityDirectory");

  const idFields = ["username", "shortId"];

  const idFieldsRegexFilter = idFields.map((field) => {
    return { [field]: { $regex: new RegExp(`^${id}$`, "i") } };
  });

  let query = {};

  // Validar si `id` es un ObjectId válido
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.id = id;
  } else {
    // Búsqueda por `username` o `shortId` si `id` no es un ObjectId
    query = {
      $or: idFieldsRegexFilter,
    };
  }

  const entity = await EntityDirectory.findOne(query);

  if (entity) {
    // console.log("******     \n", entity);
    return {
      _id: entity._id,
      identifier: entity.identifier,
      entity_id: entity.id,
      username: entity.username,
      name: entity.name,
      profile_pic: entity.profile_pic,
      entityType: entity.entityType,
    };
  }

  // Si no se encuentra, lanzar error
  throw new Error(`EntityDirectory not found for identifier: ${id}`);
}

/**
 * Crea el registro EntityDirectory para una entidad recién creada (Artist/Place/User).
 * Comparte la lógica de location/search_cache usada tanto por el createEntity genérico
 * (helpers/crud-actions.js) como por rutas de creación manuales (ej. POST /artists) y
 * por scripts de backfill.
 * @param {Object} params
 * @param {Object} params.entityInfo - { id, shortId, profile_pic, name, username, subtitle, verified_status, approval_status }
 * @param {string} params.modelName - "Artist" | "Place" | "User"
 * @param {Object} params.newEntity - Documento recién guardado del modelo (Artist/Place/User)
 * @param {string} [params.countryName] - Nombre del país (no viene en el propio documento)
 * @param {import("mongoose").Model} params.EntityDirectoryModel
 * @returns {Promise<Object>} El documento EntityDirectory creado
 */
async function createEntityDirectoryRecord({
  entityInfo,
  modelName,
  newEntity,
  countryName,
  EntityDirectoryModel,
}) {
  const { removeStringAccents } = require("../../helpers/helperFunctions");

  const entityLocation = newEntity.location?.split(",");
  const latitude =
    entityLocation && entityLocation.length && !isNaN(Number(entityLocation[0]))
      ? Number(entityLocation[0])
      : null;

  const longitude =
    entityLocation && entityLocation.length && !isNaN(Number(entityLocation[1]))
      ? Number(entityLocation[1])
      : null;

  let locationPrecision = undefined;
  if (entityLocation && entityLocation.length) {
    locationPrecision = "POINT";
  } else if (newEntity.city) {
    locationPrecision = "CITY";
  } else if (newEntity.state) {
    locationPrecision = "STATE";
  } else if (newEntity.country_alpha2) {
    locationPrecision = "COUNTRY";
  }

  const location = {
    country_name: countryName,
    country_alpha2: newEntity.country_alpha2,
    country_alpha3: undefined,
    state: newEntity.state,
    city: newEntity.city,
    address: newEntity.address,
    latitude,
    longitude,
    locationPrecision,
  };

  const search_cache =
    [
      ...new Set(
        [
          entityInfo.name,
          entityInfo.username,
          entityInfo.subtitle,
          location.country_name,
          location.state,
          location.city,
        ].filter((v) => v !== undefined)
      ),
    ].join(" ") || "";

  const entityDirectory = new EntityDirectoryModel({
    ...entityInfo,
    entityType: modelName,
    search_cache: removeStringAccents(search_cache),
    location: [location],
  });
  await entityDirectory.save();
  return entityDirectory;
}

module.exports = { schema, normalizeProfileId, createEntityDirectoryRecord };
