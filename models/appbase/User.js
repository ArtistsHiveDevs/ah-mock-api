const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema({
  given_names: String,
  surnames: String,
  email: String,
  phone_number: String,
});

const roleSchema = new mongoose.Schema({
  entityName: String,
  entityRoleMap: [
    {
      id: String,
      profile_pic: String,
      name: String,
      subtitle: String,
      verified_status: Number,
      roles: [String],
    },
  ],
});

const userSchema = new mongoose.Schema({
  given_names: String,
  surnames: String,
  username: String,
  email: String,
  password: String,
  phone_number: String,
  access_token: String,
  emergency_contact: [emergencyContactSchema],
  gender: Number,
  blood_group: String,
  birthdate: String,
  nationality: String,
  birthplace: String,
  home_city: String,
  home_address: String,
  latlng: String,
  profile_pic: String,
  verified_status: Number,
  user_language: String,
  roles: [roleSchema],
  created_at: String,
  updated_at: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
