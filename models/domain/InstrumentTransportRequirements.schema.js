const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  fits_in_car: Boolean,
  fits_in_van: Boolean,
  fits_in_tour_bus: Boolean,
  fits_in_airplane_cabin: Boolean,
  needs_special_handling: Boolean,
  handling_notes: String,
});

module.exports = { schema };
