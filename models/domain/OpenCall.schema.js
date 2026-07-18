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
    event_location: { type: String },
    country: { type: String },
    accepted_project_types: [{ type: String }],
    max_applications: { type: Number },
    requirements_description: { type: String },
    stage_type: { type: String },
    stage_dimensions: { type: String },
    set_duration_min: { type: Number },
    set_duration_max: { type: Number },
    available_slots: { type: Number },
    expected_audience: { type: Number },
    provided_sound: { type: String },
    provided_backline: { type: String },
    provided_lighting: { type: String },
    technical_notes: { type: String },
    fee_currency: { type: String },
    fee_amount: { type: Number },
    travel_support: { type: String },
    accommodation_provided: { type: String },
    meals_provided: { type: String },
    additional_notes: { type: String },
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
