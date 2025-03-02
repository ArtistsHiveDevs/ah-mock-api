const mongoURI_prod =
  "mongodb+srv://artisthive_dev:Vi1xiHun7nTtg8bQ@clusterah.olpqg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAH";
const mongoURI_uat =
  "mongodb+srv://quarendevsbog:fNNL3qIhvUUjGo07@clusterah.mip7d.mongodb.net/artist_hive?retryWrites=true&w=majority&appName=ClusterAH";
// "mongodb://admin2:admin123@localhost:27017/artist_hive?authSource=admin";
const mongoose = require("mongoose");
const crypto = require("crypto");

const SECRET_KEY = "super_secret_key_32_bytes_long!!"; // Debe ser de 32 caracteres
const ALGORITHM = "aes-256-cbc";

// Genera un IV aleatorio de 16 bytes
const generateIV = () => crypto.randomBytes(16).toString("hex").slice(0, 16);

const connections = {}; // Cache de conexiones para evitar múltiples instancias

// Función para cifrar
const encryptEnv = (text) => {
  const iv = generateIV(); // IV único para cada cifrado
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv + encrypted; // Se concatena el IV al inicio
};

// Función para descifrar
const decryptEnv = (encryptedText) => {
  try {
    const iv = encryptedText.slice(0, 16); // Extrae el IV del inicio
    const encrypted = encryptedText.slice(16); // El resto es el mensaje cifrado
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const [env, date] = decrypted.split("@");
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

    return (env === "testing" || env === "production") && date === today
      ? env
      : undefined;
  } catch (err) {
    console.error("Error al descifrar el entorno:", err);
    return undefined;
  }
};

const connectToDatabase = async (req) => {
  let encryptedEnv = req?.headers["x-env"];

  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const encryptedTesting = encryptEnv(`testing@${today}`);
  const encryptedProduction = encryptEnv(`production@${today}`);

  // console.log("Testing Encrypted:", encryptedTesting);
  // console.log("Production Encrypted:", encryptedProduction);

  // // Prueba de desencriptación
  // console.log("Testing Decrypted:", decryptEnv(encryptedTesting));
  // console.log("Production Decrypted:", decryptEnv(encryptedProduction));

  let env = (!!encryptedEnv && decryptEnv(encryptedEnv)) || "testingasd"; // Descifra el entorno
  console.log(
    "=====\n=========\n===========",
    decryptEnv(encryptedEnv),
    "\n",
    `##${env}##`
  );

  const mongoURIs = {
    production:
      mongoURI_prod ||
      process.env.MONGO_URI_PROD ||
      "mongodb://localhost:27017/prod",
    testing:
      mongoURI_uat ||
      process.env.MONGO_URI_UAT ||
      "mongodb://localhost:27017/test",
  };

  console.log("ENV: ", env, Object.keys(connections));
  if (!mongoURIs[env]) {
    console.warn(`Entorno desconocido: ${env}, conectando a "testing"`);
    // env = "testing"; // Fallback a testing
  }

  if (!!env && !connections[env]) {
    try {
      console.log(
        `🔄 Conectando a MongoDB (${env})...`,
        " existe envryted ",
        !!encryptedEnv
      );
      const connection = await mongoose.createConnection(mongoURIs[env], {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
      });

      connection.on("connected", () =>
        console.log(`✅ MongoDB (${env}) conectado`)
      );
      connection.on("error", (err) =>
        console.error(`❌ Error en MongoDB (${env}):`, err)
      );

      connection.environment = env;
      connections[env] = connection;

      //   console.log(connections);
    } catch (err) {
      console.error(`🚨 Error al conectar a MongoDB (${env}):`, err);
      throw err;
    }
  }
  return connections[env];
};

module.exports = { connectToDatabase, connections };
