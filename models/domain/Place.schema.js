const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
  },
  { _id: false }
);

const PlaceRatingSchema = new Schema(
  {
    overall: { type: Number },
    stage: { type: Number },
    sound: { type: Number },
    backline: { type: Number },
    lights: { type: Number },
    dressing_room: { type: Number },
    hospitality_food: { type: Number },
    hospitality_drinks: { type: Number },
    timeliness: { type: Number },
    communication: { type: Number },
    transportation: { type: Number },
    logistic: { type: Number },
    location: { type: Number },
    seating_capacity: { type: Number },
    total_rates: { type: Number },
  },
  { _id: false }
);

const SocialNetworkStatsSchema = new Schema(
  {
    network: { type: String },
    followers: { type: Number },
    engagement: { type: Number },
    // Agregar más campos según lo definido en SocialNetworkStatsTemplate
  },
  { _id: false }
);

const PlaceSchema = new Schema({
  username: { type: String },
  name: { type: String },
  place_type: { type: String },
  music_genre: { type: String },
  country: { type: Schema.Types.ObjectId, ref: "Country" },
  country_alpha2: { type: String },
  state: { type: String },
  city: { type: String },
  address: { type: String },
  location: { type: String },
  email: { type: String },
  phone: { type: String },
  public_private: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  twitter: { type: String },
  website: { type: String },
  promoter: { type: String },
  tiktok: { type: String },
  subtitle: { type: String },
  profile_pic: { type: String },
  verified_status: { type: Number, default: 0 },
  image_gallery: [imageSchema],

  genres: {
    type: Map,
    of: [String],
    required: true,
  },

  stats: {
    rating: { type: PlaceRatingSchema },
    socialNetworks: [SocialNetworkStatsSchema],
  },

  entityRoleMap: [
    {
      ids: [mongoose.Types.ObjectId],
      role: String,
    },
  ],
});

PlaceSchema.virtual("events", {
  ref: "Event", // Nombre del modelo al que hace referencia
  localField: "_id", // Campo en Place
  foreignField: "place", // Campo en Event que referencia a Place
});

// Incluye los virtuals en los resultados de JSON
PlaceSchema.set("toObject", { virtuals: true });
PlaceSchema.set("toJSON", { virtuals: true });

const Place = mongoose.model("Place", PlaceSchema);

module.exports = Place;
