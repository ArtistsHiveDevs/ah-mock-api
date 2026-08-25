const mongoose = require("mongoose");
const { connections } = require("../../../db/db_g");
const { sIDPlugin } = require("../../../helpers/sIDPlugin");

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
      { _id: false },
    ),
  },
});

schema.plugin(sIDPlugin);

module.exports = { schema };
