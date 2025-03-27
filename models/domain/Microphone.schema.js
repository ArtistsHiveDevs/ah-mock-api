const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  brand: { type: String, required: true },
  reference: { type: String, required: true },
  requires_phantom_power: { type: Boolean, default: false },
  can_be_inalambric: Boolean,
  contector_type: {type:String, enum:}
});

module.exports = { schema };
