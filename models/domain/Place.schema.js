const mongoose = require("mongoose");
const { schema: FollowerSchema } = require("./Follower.schema");
const { sIDPlugin } = require("../../helpers/sIDPlugin");
const { Schema } = mongoose;

const imageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
  },
  { _id: false },
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
  { _id: false },
);

const SocialNetworkStatsSchema = new Schema(
  {
    network: { type: String },
    followers: { type: Number },
    engagement: { type: Number },
    // Agregar más campos según lo definido en SocialNetworkStatsTemplate
  },
  { _id: false },
);

const schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-z0-9_.]{3,24}$/,
        "username debe tener 3-24 caracteres y solo minúsculas, números, '_' o '.'",
      ],
    },
    name: { type: String, required: true },
    description: { type: String },
    since: { type: Date, default: null },
    regulatory_closing_time: { type: Date },
    place_type: { type: String, required: true },
    music_genre: { type: String },
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    country_alpha2: { type: String },
    state: { type: String },
    city: { type: String, required: true },
    address: { type: String },
    location: { type: String },
    email: { type: String },
    phone: { type: String },
    mobile_phone: { type: String },
    whatsapp: { type: String },
    public_private: { type: String },
    spoken_languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
    stage_languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    spotify: { type: String },
    youtube: { type: String },
    wikipedia: { type: String },
    website: { type: String },
    promoter: { type: String },
    tiktok: { type: String },
    subtitle: { type: String },
    profile_pic: { type: String },
    verified_status: { type: Number, default: 0 },
    image_gallery: [imageSchema],

    venue_backline_instruments: { type: String },
    venue_backline_sound: { type: String },
    venue_backline_lights: { type: String },
    venue_backline_video: { type: String },
    venue_backline_additional_info: { type: String },

    activity: String,

    // Solo informativo por ahora: no filtra listados públicos ni bloquea acciones.
    // Ver operations/domain/admin/pendingProfiles/router.js para la cola de revisión.
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    has_open_mic: { type: Boolean },

    genres: {
      type: Map,
      of: [String],
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

    followed_profiles: { type: [FollowerSchema], default: [] },
    followed_by: { type: [FollowerSchema], default: [] },

    total_audience_capacity: { type: Number },
  },
  {
    timestamps: true,
  },
);

schema.virtual("events", {
  ref: "Event", // Nombre del modelo al que hace referencia
  localField: "_id", // Campo en Place
  foreignField: "place", // Campo en Event que referencia a Place
});

schema.virtual("followersCount").get(function () {
  return async function (connection) {
    if (!connection) throw new Error("Se requiere una conexión de Mongoose");

    const Model = connection.model("Place");

    // Contar los elementos en followed_by donde isFollowing es true
    const count = await Model.aggregate([
      { $match: { _id: this._id } },
      { $unwind: "$followed_by" },
      { $match: { "followed_by.isFollowing": true } },
      { $count: "total" },
    ]);

    return count.length > 0 ? count[0].total : 0;
  };
});

schema.virtual("followedProfilesCount").get(function () {
  return async function (connection) {
    if (!connection) throw new Error("Se requiere una conexión de Mongoose");

    const Model = connection.model("Place");

    // Contar los elementos en followed_by donde isFollowing es true
    const count = await Model.aggregate([
      { $match: { _id: this._id } },
      { $unwind: "$followed_profiles" },
      { $match: { "followed_profiles.isFollowing": true } },
      { $count: "total" },
    ]);

    return count.length > 0 ? count[0].total : 0;
  };
});
// Incluye los virtuals en los resultados de JSON
schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

schema.plugin(sIDPlugin);

module.exports = { schema };
