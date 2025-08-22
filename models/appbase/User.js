const mongoose = require("mongoose");
const { schema: FollowerSchema } = require("../domain/Follower.schema");
const { Schema } = mongoose;

const emergencyContactSchema = new mongoose.Schema({
  given_names: String,
  surnames: String,
  email: String,
  phone_number: String,
});

const roleSchema = new mongoose.Schema(
  {
    entityName: String,
    entityRoleMap: [
      {
        id: String,
        profile_pic: String,
        name: String,
        username: String,
        subtitle: String,
        verified_status: Number,
        roles: [String],
      },
    ],
  },
  { _id: false }
);

const schema = new mongoose.Schema({
  sub: String,
  given_names: String,
  surnames: String,
  stage_name: String,
  username: String,
  currentProfileIdentifier: String,
  email: String,
  password: String,
  phone_number: String,
  access_token: String,
  emergency_contact: [emergencyContactSchema],
  gender: Number,
  blood_group: String,
  birthdate: String,
  country: { type: Schema.Types.ObjectId, ref: "Country" },
  nationality: String,
  birthplace: String,
  home_city: String,
  home_address: String,
  // spoken_languages: [{ type: Schema.Types.ObjectId, ref: "Language" }],
  spoken_languages: [String],
  dietary_restrictions: String,
  latlng: String,
  profile_pic: String,
  verified_status: Number,
  user_language: String,
  roles: [roleSchema],
  created_at: String,
  updated_at: String,
  show_industry_member_banner: Boolean,
  followed_profiles: { type: [FollowerSchema], default: [] },
  followed_by: { type: [FollowerSchema], default: [] },
});

schema.virtual("followersCount").get(function () {
  return async function (connection) {
    if (!connection) throw new Error("Se requiere una conexión de Mongoose");

    const Model = connection.model("User");

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

    const Model = connection.model("User");

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

const User = mongoose.model("User", schema);

module.exports = { User, schema };
