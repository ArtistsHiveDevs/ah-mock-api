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

/**
 * Virtual para populate de recipients
 */
schema.virtual("identifier").get(function () {
  return this.username || this.shortId || this.id || this._id;
});

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
    };
  }

  // Si no se encuentra, lanzar error
  throw new Error(`EntityDirectory not found for identifier: ${id}`);
}

module.exports = { schema, normalizeProfileId };
