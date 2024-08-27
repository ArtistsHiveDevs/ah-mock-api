const mongoose = require("mongoose");
const { Schema } = mongoose;

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
  country: { type: String },
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
  //   imageGallery: [{ type: Schema.Types.ObjectId, ref: "Image" }],

  //   events: [EventSchema],
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

const Place = mongoose.model("Place", PlaceSchema);

module.exports = Place;
