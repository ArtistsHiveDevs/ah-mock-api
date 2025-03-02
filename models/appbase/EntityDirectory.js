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

module.exports = { schema };
