const mongoose = require("mongoose");
const { generateSID } = require("../../helpers/sID");
const { Schema } = mongoose;

const schema = new Schema(
  {
    sID: {
      type: String,
      default: generateSID,
      unique: true,
      sparse: true,
    },
    open_call_id: {
      type: Schema.Types.ObjectId,
      ref: "OpenCall",
      required: true,
    },
    artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    artist_name: { type: String },
    artist_profile_pic: { type: String },
    artist_city: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    // Survey responses — stored as a flexible map to match the frontend config
    survey_responses: { type: Schema.Types.Mixed, default: {} },
    entityRoleMap: [
      {
        ids: [mongoose.Types.ObjectId],
        role: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = { schema };
