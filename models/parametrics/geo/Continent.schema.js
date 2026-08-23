const mongoose = require("mongoose");
const { connections } = require("../../../db/db_g");
const { generateSID } = require("../../../helpers/sID");

const schema = new mongoose.Schema({
  // Identificador corto alternativo al _id, generado al crear.
  sID: { type: String, default: generateSID, unique: true, sparse: true },
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
