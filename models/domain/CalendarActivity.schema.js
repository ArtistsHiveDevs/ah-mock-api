const mongoose = require("mongoose");
const { sIDPlugin } = require("../../helpers/sIDPlugin");
const { Schema } = mongoose;

const CALENDAR_ACTIVITY_TYPES = ["activity", "opencall", "event"];

const CALENDAR_ACTIVITY_SUBTYPES = {
  activity: [
    "rehearsal",
    "soundcheck",
    "presentation",
    "concert",
    "tour",
    "other",
  ],
};

function isSubtypeAllowedForType(subtype, type) {
  const allowedSubtypes = CALENDAR_ACTIVITY_SUBTYPES[type];

  return !subtype || !allowedSubtypes || allowedSubtypes.includes(subtype);
}

const schema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: CALENDAR_ACTIVITY_TYPES,
      default: "activity",
    },
    subtype: {
      type: String,
      validate: {
        validator: function (subtype) {
          return isSubtypeAllowedForType(subtype, this.type);
        },
        message: ({ value }) =>
          `subtype "${value}" no está permitido para el type de esta CalendarActivity`,
      },
    },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, default: false },
    notes: { type: String },
    image: { type: String },
    owner_profile_id: {
      type: Schema.Types.ObjectId,
      index: true,
      immutable: true,
    },
    owner_profile_entity: { type: String, immutable: true },
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

schema.plugin(sIDPlugin);

module.exports = {
  schema,
  CALENDAR_ACTIVITY_TYPES,
  CALENDAR_ACTIVITY_SUBTYPES,
  isSubtypeAllowedForType,
};
