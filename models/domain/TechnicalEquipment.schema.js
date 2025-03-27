const mongoose = require("mongoose");

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
  category: String,
  effect_type: String,
  brand: String,
  model: String,
  power_requirements: {
    battery: String,
    adapter: { voltage: String, current_mA: Number },
  },
});

module.exports = { schema };
