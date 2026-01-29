const mongoose = require("mongoose");
const { Schema } = mongoose;

const { connections } = require("../../db/db_g");
const { schema: FollowerSchema } = require("./Follower.schema");

const ArtistInTrackSchema = new mongoose.Schema({
  // external_urls: {
  //     spotify: { type: String, required: true }
  // },
  // href: { type: String, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  // type: { type: String, default: 'artist' },
  // uri: { type: String, required: true }
});

const TrackSchema = new mongoose.Schema({
  artists: [ArtistInTrackSchema],
  disc_number: { type: Number, required: true },
  duration_ms: { type: Number, required: true },
  explicit: { type: Boolean, default: false },
  // external_urls: {
  //     spotify: { type: String, required: true }
  // },
  // href: { type: String, required: true },
  id: { type: String, required: true },
  // is_local: { type: Boolean, default: false },
  // is_playable: { type: Boolean, default: true },
  name: { type: String, required: true },
  // preview_url: { type: String },
  track_number: { type: Number, required: true },
  // type: { type: String, default: 'track' },
  // uri: { type: String, required: true }
});

const SpotifySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const AlbumSchema = new mongoose.Schema(
  {
    album_type: { type: String },
    name: { type: String, required: true },
    images: [{ type: mongoose.Schema.Types.Mixed }], // Mixed permite que el objeto tenga propiedades variables
    release_date: { type: String },
    release_date_precision: { type: String },
    spotify: SpotifySchema,
    total_tracks: { type: Number },
    tracks: [TrackSchema],
    type: { type: String },
  },
  { _id: false }
);

const TopTrackSchema = new mongoose.Schema({
  album: { type: AlbumSchema, required: true },
  artists: [ArtistInTrackSchema],
  disc_number: { type: Number, required: true },
  duration_ms: { type: Number, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  popularity: { type: Number, required: true },
  track_number: { type: Number, required: true },
  type: { type: String, required: true },
});

const schema = new mongoose.Schema(
  {
    artistType: { type: String },
    name: { type: String, required: true },
    username: { type: String },
    subtitle: { type: String },
    verified_status: { type: Number, default: 0 },
    profile_pic: { type: String },
    photo: { type: String },
    description: { type: String },
    since: { type: Date, default: null },
    home_city: { type: String },
    country_alpha2: { type: String },
    country: { type: Schema.Types.ObjectId, ref: "Country" },
    city: { type: String },
    genres: {
      music: [String],
    },
    spoken_languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
    stage_languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
    arts_languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
    website: { type: String },
    email: { type: String },
    mobile_phone: { type: String },
    whatsapp: { type: String },
    facebook: { type: String },
    tiktok: { type: String },
    twitch: { type: String },
    instagram: { type: String },
    spotify: { type: String },
    soundcloud: { type: String },
    youtube: { type: String },
    youtube_widget_id: { type: String },
    chartmetric: { type: Number, default: -1 },
    spotify_data: {
      followers: { type: Number, default: -1 },
      name: { type: String },
      popularity: { type: Number, default: -1 },
    },
    chartmetric_data: {
      sp_where_people_listen: [
        {
          code2: { type: String },
          listeners: { type: Number },
          name: { type: String },
        },
      ],
      stats: {
        facebook_followers: { type: Number, default: -1 },
        ins_followers: { type: Number, default: -1 },
        shazam_count: { type: Number, default: -1 },
        sp_followers: { type: Number, default: -1 },
        sp_followers_to_listeners_ratio: { type: Number, default: -1 },
        sp_listeners_to_followers_ratio: { type: Number, default: -1 },
        sp_monthly_listeners: { type: Number, default: -1 },
        sp_popularity: { type: Number, default: -1 },
        tiktok_top_video_comments: { type: Number, default: -1 },
        tiktok_top_video_views: { type: Number, default: -1 },
        tiktok_track_posts: { type: Number, default: -1 },
        ycs_subscribers: { type: Number, default: -1 },
        ycs_subscribers_rank: { type: Number, default: -1 },
        ycs_views: { type: Number, default: -1 },
      },
    },
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
        top_tracks: [TopTrackSchema],
        related_artists: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
      },
    },

    pricing: {
      startingPrice: { type: Number },
      finalPrice: { type: Number },
      currency: { type: String, required: false },
      since: { type: Date, required: false },
    },

    activity: String,

    entityRoleMap: [
      {
        ids: [mongoose.Types.ObjectId],
        role: String,
      },
    ],
    followed_profiles: { type: [FollowerSchema], default: [] },
    followed_by: { type: [FollowerSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Configura el virtual para la relación inversa
schema.virtual("events", {
  ref: "Event", // Nombre del modelo relacionado
  localField: "_id", // Campo en Artist
  foreignField: "artists", // Campo en Event que referencia a Artist
});

schema.virtual("followersCount").get(function () {
  return async function (connection) {
    if (!connection) throw new Error("Se requiere una conexión de Mongoose");

    const Artist = connection.model("Artist");

    // Contar los elementos en followed_by donde isFollowing es true
    const count = await Artist.aggregate([
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

    const Artist = connection.model("Artist");

    // Contar los elementos en followed_by donde isFollowing es true
    const count = await Artist.aggregate([
      { $match: { _id: this._id } },
      { $unwind: "$followed_profiles" },
      { $match: { "followed_profiles.isFollowing": true } },
      { $count: "total" },
    ]);

    return count.length > 0 ? count[0].total : 0;
  };
});

// Incluye los virtuals en los resultados JSON
schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

// const Artist = mongoose.model("Artist", ArtistSchema);

// module.exports = Artist;

module.exports = { schema };
