const mongoose = require("mongoose");
const { connections } = require("../../../db/db_g");

const schema = new mongoose.Schema({
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

module.exports = { schema };
