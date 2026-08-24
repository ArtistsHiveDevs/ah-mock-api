const mongoose = require("mongoose");
const { Schema } = mongoose;

const { connections } = require("../../db/db_g");
const { schema: FollowerSchema } = require("./Follower.schema");
const { generateSID } = require("../../helpers/sID");

const schema = new mongoose.Schema(
  {
    sID: {
      type: String,
      default: generateSID,
      unique: true,
      sparse: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    entityType: String,
    entityId: {
      type: Schema.Types.ObjectId, // Definir id como ObjectId para referenciar otros documentos
      required: true,
      refPath: "entityType", // Referencia dinámica a la colección correspondiente
    },
    identifier: { type: Schema.Types.String },
    issuedDate: { type: Schema.Types.Date },
  },
  {
    timestamps: true,
  },
);

module.exports = { schema };
