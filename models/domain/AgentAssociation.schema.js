const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    document_type: {
      type: String,
      required: true,
    },
    document_number: {
      type: String,
      required: true,
    },
    type_of_ownership: {
      type: String,
      required: true,
      // enum: ["State-owned enterprise", "Privately held company", "Public-private partnership"], // Tipos permitidos
      // enum: ["SOE", "PHC", "PPP"], // Tipos permitidos
    },
    geographical_reach: {
      type: String,
      // required: true,
      // Local	Local
      // Provincial / Estatal / Departamental	State-level / Provincial / Departmental (según el país)
      // Nacional	National
      // Regional	Regional (dentro de un país o entre varios países, según contexto)
      // Continental	Continental
      // Mundial / Global	Global o Worldwide
    },
    since: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.virtual("members", {
  ref: "Place", // Nombre del modelo al que hace referencia
  localField: "_id", // Campo en Place
  foreignField: "associations", // Campo en Event que referencia a Place
});

module.exports = { schema };
