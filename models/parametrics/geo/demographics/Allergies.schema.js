const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define el esquema para la alergia
const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Asegura que los nombres sean únicos
    trim: true,
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
  percentage: {
    type: String,
    default: "0.00", // Porcentaje con dos decimales
    validate: {
      validator: function (v) {
        return /^\d+(\.\d{1,2})?$/.test(v); // Valida que el formato sea un número con hasta dos decimales
      },
      message: (props) => `${props.value} no es un porcentaje válido`,
    },
  },
  type: {
    type: String,
    enum: ["alimento", "medicamento", "animal", "ambiental", "otro"], // Enum para los tipos
    required: true,
  },
  code: {
    type: String,
    default: "", // Código estándar de clasificación, si aplica
  },
});

module.exports = { schema };
