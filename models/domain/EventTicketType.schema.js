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
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "COP" },
    order: { type: Number },
    active: { type: Boolean, default: true },
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

schema.index({ event_id: 1, name: 1 }, { unique: true });

schema.plugin(sIDPlugin);

module.exports = { schema };
