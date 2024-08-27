const mongoose = require("mongoose");
const { Schema } = mongoose;

const LocationSchema = new Schema({
  country: String,
  state: String,
  city: String,
  address: String,
  latitude: String,
  longitude: String,
  locationPrecision: String,
});
// Definir el esquema para EventTemplate
const EntitySummarySchema = new Schema(
  {
    entityType: String,
    id: String,
    shortId: String,
    profile_pic: String,
    name: String,
    username: String,
    subtitle: String,
    verified_status: Number,
    location: [LocationSchema],
    isActive: { type: Boolean, default: true },
    // lastActivity
    // lastSession
    // lang
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

const EntityDirectory = mongoose.model("EntityDirectory", EntitySummarySchema);

module.exports = EntityDirectory;
