const mongoose = require("mongoose");

const SpotifySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const AlbumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: [{ type: mongoose.Schema.Types.Mixed }], // Mixed permite que el objeto tenga propiedades variables
    release_date: { type: String },
    release_date_precision: { type: String },
    spotify: SpotifySchema,
    total_tracks: { type: Number },
  },
  { _id: false }
);

const ArtistSchema = new mongoose.Schema(
  {
    artistType: { type: String },
    name: { type: String, required: true },
    username: { type: String },
    subtitle: { type: String },
    verified_status: { type: Number, default: 0 },
    profile_pic: { type: String },
    photo: { type: String },
    description: { type: String },
    since: { type: Number },
    home_city: { type: String },
    genres: {
      music: [String],
    },
    spoken_languages: [String],
    stage_languages: [String],
    arts_languages: [String],
    website: { type: String },
    email: { type: String },
    mobile_phone: { type: String },
    whatsapp: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    spotify: { type: String },
    soundcloud: { type: String },
    youtube: { type: String },
    youtube_widget_id: { type: String },
    general_rate: { type: Number, default: 0 },
    followers: { type: String },
    event_followers: { type: String },
    stats: {
      rating: {
        overall: { type: Number },
        talent: { type: Number },
        performance: { type: Number },
        proffesionalism: { type: Number },
        stage_presence: { type: Number },
        charisma: { type: Number },
        timeliness: { type: Number },
        communication: { type: Number },
        respectfulness: { type: Number },
        total_rates: { type: Number },
      },
    },
    arts: {
      music: {
        albums: [AlbumSchema],
      },
    },

    entityRoleMap: [
      {
        ids: [mongoose.Types.ObjectId],
        role: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Artist = mongoose.model("Artist", ArtistSchema);

module.exports = Artist;
