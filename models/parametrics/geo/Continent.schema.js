const mongoose = require("mongoose");

const continentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  i18n: {
    type: Map,
    of: new mongoose.Schema(
      {
        name: String,
      },
      { _id: false }
    ),
  },
});

const Continent = mongoose.model("Continent", continentSchema);

module.exports = Continent;
