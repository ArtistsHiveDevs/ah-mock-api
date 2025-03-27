const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
});

module.exports = { schema };
