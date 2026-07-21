const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Usar Google DNS para resolver SRV records de MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { schema: userSchema } = require("../models/appbase/User");
const {
  schema: EntityDirectorySchema,
} = require("../models/appbase/EntityDirectory");
const { schema: artistSchema } = require("../models/domain/Artist.schema");

const connections = {}; // Cache de conexiones para evitar múltiples instancias
const connectionsByModel = {}; // Cache de conexiones para evitar múltiples instancias

const crypto = require("crypto");
const { schema: ArtistAlbum } = require("../models/domain/ArtistAlbum.schema");

const SECRET_KEY = process.env.ENV_KEY || "d855f76d6fe2ac84f7c0e38a619c5810"; // Mismo de frontend
const SECRET_IV = process.env.ENV_KEY_IV || "358e8a3a5474d65a"; // Mismo de frontend

const modelsWithCustomConnections = ["Album", "Artist"];

/**
 * Desencripta texto genérico (sin validación de formato)
 */
function decryptText(encryptedText) {
  try {
    const key = Buffer.from(SECRET_KEY, "utf8");
    const iv = Buffer.from(SECRET_IV, "utf8");
    const encryptedBuffer = Buffer.from(encryptedText, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("❌ Error al descifrar texto:", error.message);
    return null;
  }
}

/**
 * Desencripta y valida el header x-env (formato: environment@date)
 */
function decryptEnv(encryptedText) {
  try {
    const str = decryptText(encryptedText);
    if (!str) return null;

    const [env, date] = str.split("@");
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

    return env === "uat" || env === "prod" || env === "dev" // && date === today
      ? env
      : undefined;
  } catch (error) {
    console.error("❌ Error al descifrar env:", encryptedText, error.message);
    return null;
  }
}

function decryptSharedLinkEnv(encryptedText) {
  if (encryptedText) {
    return decryptEnv(encryptedText);
  } else {
    return "prod";
  }
}

function countRelations(schema) {
  return Object.values(schema.paths).filter((path) => path.options.ref).length;
}

// Espera a que una conexión esté lista (readyState === 1)
const waitForConnection = (connection, env) => {
  return new Promise((resolve, reject) => {
    if (connection.readyState === 1) {
      resolve(connection);
      return;
    }
    connection.once("connected", () => resolve(connection));
    connection.once("error", (err) => reject(err));
  });
};

const connectToDatabase = async (req) => {
  let env = req.serverEnvironment;

  const mongoURIs = {
    prod: process.env.MONGO_URI_PROD || "mongodb://localhost:27017/prod",
    uat: process.env.MONGO_URI_UAT || "mongodb://localhost:27017/test",
    dev:
      process.env.MONGO_URI_DEV || "mongodb://localhost:27017/artist_hive_dev",
  };

  if (!mongoURIs[env]) {
    console.warn(`Entorno desconocido: ${env}, conectando a "testing"`);
    env = "uat"; // Fallback a testing
    req.serverEnvironment = env;
  }

  // Si ya existe una conexión, esperar a que esté lista
  if (connections[env]) {
    await waitForConnection(connections[env], env);
    return connections[env];
  }

  if (!!env && !connections[env]) {
    try {
      console.log(`🔄 Conectando a MongoDB (${env})`);
      const connection = mongoose.createConnection(mongoURIs[env], {
        serverSelectionTimeoutMS: 30000,
      });

      connection.environment = env;
      connections[env] = connection;

      connection.on("error", (err) =>
        console.error(`❌ Error en MongoDB (${env}):`, err),
      );

      // Esperar a que la conexión esté lista
      await waitForConnection(connection, env);
      console.log(`✅ MongoDB (${env}) conectado`);

      connection.model("EntityDirectory", EntityDirectorySchema);
      connection.model("User", userSchema);
      // connection.model("Artist", artistSchema);

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
        Object.keys(connection.models).sort(),
      );
    } catch (err) {
      console.error(`🚨 Error al conectar a MongoDB (${env}):`, err);
      throw err;
    }
  }
  return connections[env];
};

const connectToDatabaseByModel = async (model) => {
  const modelURIs = {
    Album: process.env.MONGO_ALBUMS_URI,
    Artist: process.env.MONGO_ARTIST_URI,
  };

  if (!modelURIs[model]) {
    console.warn(`No se encuentra la URI del modelo solicitado: ${model}`);
  }

  // Si ya existe una conexión, esperar a que esté lista
  if (connectionsByModel[model]) {
    await waitForConnection(connectionsByModel[model], model);
    return connectionsByModel[model];
  }

  if (!!model && !connectionsByModel[model] && modelURIs[model]?.length > 0) {
    try {
      console.log(`🔄 Conectando a MongoDB (${model}) - ${modelURIs[model]}`);
      const connection = mongoose.createConnection(modelURIs[model], {
        serverSelectionTimeoutMS: 30000,
      });

      connectionsByModel[model] = connection;

      connection.on("error", (err) =>
        console.error(`❌ Error en MongoDB (${model}):`, err),
      );

      // Esperar a que la conexión esté lista
      await waitForConnection(connection, model);
      console.log(`✅ MongoDB (${model}) conectado`);

      // Contar elementos en el modelo
      try {
        const Model = connection.model(model, require(`../models/domain/${model}.schema`).schema);
        const count = await Model.countDocuments();
        console.log(`📊 Total de documentos en ${model}: ${count}`);
      } catch (countErr) {
        console.warn(`⚠️ No se pudo contar documentos en ${model}:`, countErr.message);
      }
    } catch (err) {
      console.error(`🚨 Error al conectar a MongoDB (${model}):`, err);
      throw err;
    }
  }
  return connectionsByModel[model];
};

module.exports = {
  connectToDatabase,
  connectToDatabaseByModel,
  modelsWithCustomConnections,
  connections,
  connectionsByModel,
  decryptEnv,
  decryptText,
  decryptSharedLinkEnv,
};
