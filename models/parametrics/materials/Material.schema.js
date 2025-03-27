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
});

module.exports = { schema };
