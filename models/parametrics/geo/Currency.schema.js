const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema({
  ISO_4217_key: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  demonym: {
    type: String,
  },
  //   majorSingle: {
  //     type: String,
  //     required: true,
  //   },
  //   majorPlural: {
  //     type: String,
  //     required: true,
  //   },
  ISOnum: {
    type: Number,
  },
  symbol: {
    type: String,
    required: true,
  },
  symbolNative: {
    type: String,
    required: true,
  },
  //   minorSingle: {
  //     type: String,
  //     required: true,
  //   },
  //   minorPlural: {
  //     type: String,
  //     required: true,
  //   },
  ISOdigits: {
    type: Number,
  },
  decimals: {
    type: Number,
  },
  numToBasic: {
    type: Number,
  },
  i18n: {
    type: Map,
    of: new mongoose.Schema(
      {
        name: String,
        majorSingle: String,
        majorPlural: String,
        minorSingle: String,
        minorPlural: String,
      },
      { _id: false }
    ),
  },
});

const Currency = mongoose.model("Currency", currencySchema);

module.exports = Currency;
