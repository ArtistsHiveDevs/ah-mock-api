const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    event_name: { type: String, required: true },
    event_date: { type: String, required: true },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    place_id: { type: Schema.Types.ObjectId, ref: "Place" },
    place: { type: Schema.Types.ObjectId, ref: "Place" },
    city: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "CLOSED", "CANCELLED"],
      default: "DRAFT",
    },
    description: { type: String },
    genres: [{ type: String }],
    applications_count: { type: Number, default: 0 },
    created_by: { type: Schema.Types.ObjectId, ref: "EntityDirectory" },
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

module.exports = { schema };
