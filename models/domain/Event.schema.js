const mongoose = require("mongoose");
const { Schema } = mongoose;

// Definir el esquema para EventTemplate
const EventSchema = new Schema(
  {
    verified_status: {
      type: Number,
    },
    confirmation_status: {
      type: Number,
    },
    name: { type: String },
    subtitle: { type: String },
    profile_pic: { type: String },
    main_artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    main_artist: { type: Schema.Types.ObjectId, ref: "Artist" },
    guest_artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    timetable__initial_date: { type: String },
    timetable__end_date: { type: String },
    timetable__openning_doors: { type: String },
    timetable__guest_time: { type: String },
    timetable__main_artist_time: { type: String },
    promoter: { type: String },
    national_code: { type: String },
    description: { type: String },
    tickets_website: { type: String },
    genres: {
      type: Map,
      of: [String],
    },
    entityRoleMap: [
      {
        ids: [mongoose.Types.ObjectId],
        role: String,
      },
    ],
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
