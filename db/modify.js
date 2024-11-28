const { default: mongoose } = require("mongoose");
const User = require("../models/appbase/User");
var fs = require('fs');

const connectToDatabase = require("./db");
async function main() {
  try {
    await connectToDatabase();
    console.log("Conectado... ");
    // Ejecuta el script
    // await User.updateMany({}, { $set: { roles: [] } });

    const fs = require('fs');

    fs.readFile('./assets/mocks/domain/events/eventosReales.json', function (err, data) {

      if (err) throw err;

      const books = JSON.parse(data);
      console.log(books);
    });
    console.log("ΦΙΝ ");
  } catch (error) {
    console.error("Error en la conexión o en la ejecución:", error);
  } finally {
    // Asegúrate de cerrar la conexión si es necesario
    await mongoose.connection.close();
  }
}

main();
