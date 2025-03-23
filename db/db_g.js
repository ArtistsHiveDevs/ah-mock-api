const mongoose = require("mongoose");
require("dotenv").config();
const { schema: userSchema } = require("../models/appbase/User");
const {
  schema: EntityDirectorySchema,
} = require("../models/appbase/EntityDirectory");
const { schema: artistSchema } = require("../models/domain/Artist.schema");

const connections = {}; // Cache de conexiones para evitar múltiples instancias

const crypto = require("crypto");

const SECRET_KEY = process.env.ENV_KEY || "d855f76d6fe2ac84f7c0e38a619c5810"; // Mismo de frontend
const SECRET_IV = process.env.ENV_KEY_IV || "358e8a3a5474d65a"; // Mismo de frontend

function decryptEnv(encryptedText) {
  try {
    const key = Buffer.from(SECRET_KEY, "utf8");
    const iv = Buffer.from(SECRET_IV, "utf8");
    const encryptedBuffer = Buffer.from(encryptedText, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const str = decrypted.toString();

    const [env, date] = str.split("@");
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

    return env === "uat" || env === "prod" // && date === today
      ? env
      : undefined;
  } catch (error) {
    console.error("❌ Error al descifrar:", encryptedText, error.message);
    return null;
  }
}

function countRelations(schema) {
  return Object.values(schema.paths).filter((path) => path.options.ref).length;
}

const connectToDatabase = async (req) => {
  let env = req.serverEnvironment;

  const mongoURIs = {
    prod: process.env.MONGO_URI_PROD || "mongodb://localhost:27017/prod",
    uat: process.env.MONGO_URI_UAT || "mongodb://localhost:27017/test",
  };

  if (!mongoURIs[env]) {
    console.warn(`Entorno desconocido: ${env}, conectando a "testing"`);
    env = "uat"; // Fallback a testing
    req.serverEnvironment = env;
  }

  if (!!env && !connections[env]) {
    try {
      console.log(`🔄 Conectando a MongoDB (${env})`);
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

      connection.model("EntityDirectory", EntityDirectorySchema);
      connection.model("User", userSchema);
      connection.model("Artist", artistSchema);

      const { loadRoutes } = require("../routes/routes");
      const schemas = loadRoutes()
        .filter((r) => !!r.route.schema)
        .map((r) => {
          return {
            schema: r.route.schema,
            modelName: r.route.modelName,
            schemaDependencies: countRelations(r.route.schema),
          };
        })
        .sort((a, b) => {
          if (a.schemaDependencies < b.schemaDependencies) {
            return -1;
          }
          if (a.schemaDependencies > b.schemaDependencies) {
            return 1;
          }
          return 0;
        });

      schemas.forEach((route) => {
        connection.model(route.modelName, route.schema);
      });

      console.log(
        "Modelos registrados:",
        Object.keys(connection.models).sort()
      );
    } catch (err) {
      console.error(`🚨 Error al conectar a MongoDB (${env}):`, err);
      throw err;
    }
  }
  return connections[env];
};

module.exports = {
  connectToDatabase,
  connections,
  decryptEnv,
};
