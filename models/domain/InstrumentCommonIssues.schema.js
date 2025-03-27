const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  issue: { type: String, required: true },
  i18n: {
    en: String,
    es: String,
    pt: String,
    fr: String,
    it: String,
    de: String,
  },
  applies_to: [String],
});

module.exports = { schema };
