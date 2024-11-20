const { default: mongoose } = require("mongoose");
const User = require("../models/appbase/User");
const connectToDatabase = require("./db");
async function main() {
  try {
    await connectToDatabase();
    console.log("Conectado... ");
    // Ejecuta el script
    await User.updateMany({}, { $set: { roles: [] } });
    console.log("ΦΙΝ ");
  } catch (error) {
    console.error("Error en la conexión o en la ejecución:", error);
  } finally {
    // Asegúrate de cerrar la conexión si es necesario
    await mongoose.connection.close();
  }
}

main();
