const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  i18n: {
    en: String,
    es: String,
    pt: String,
    fr: String,
    it: String,
    de: String,
  },
  classification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstrumentCategory",
  },
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
  registers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Register" }],
  origin: String,
  common_variants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Instrument" },
  ],
  frequent_brands: [
    { type: mongoose.Schema.Types.ObjectId, ref: "FrequentBrand" },
  ],
  amplification: {
    needs_amplification: Boolean,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "AmplificationType" }],
    recommended_mics: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Microphone" },
    ],
  },
  recommended_accessories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Accessory" },
  ],
  dimensions: {
    instrument: { height_m: Number, width_m: Number, depth_m: Number },
    instrument_with_case: {
      height_m: Number,
      width_m: Number,
      depth_m: Number,
    },
    stage: { width_m: Number, depth_m: Number },
    weight_g: { average: Number, min: Number, max: Number },
  },
  common_issues: [{ type: mongoose.Schema.Types.ObjectId, ref: "CommonIssue" }],
  transport_requirements: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TransportRequirement",
  },
  picture_pic: { type: String, default: null },
});

module.exports = { schema };
