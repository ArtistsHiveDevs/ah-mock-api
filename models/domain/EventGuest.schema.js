const mongoose = require("mongoose");
const { sIDPlugin } = require("../../helpers/sIDPlugin");
const { Schema } = mongoose;

const schema = new Schema(
  {
    event_id: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    cc: { type: String, required: true },
    email: { type: String },
    ticket_type_id: {
      type: Schema.Types.ObjectId,
      ref: "EventTicketType",
      required: true,
    },
    ticket_type_name: { type: String },
    ticket_price: { type: Number },
    checked_in: { type: Boolean, default: false },
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

schema.index({ event_id: 1, cc: 1 }, { unique: true });

schema.plugin(sIDPlugin);

module.exports = { schema };
