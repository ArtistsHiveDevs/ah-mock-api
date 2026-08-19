const {
  connections,
  modelsWithCustomConnections,
  connectionsByModel,
  connectToDatabaseByModel,
} = require("../db/db_g");

function getModelSchema(modelName) {
  const modelSchemas = {
    EntityDirectory: require("../models/appbase/EntityDirectory").schema,
    User: require("../models/appbase/User").schema,
    Artist: require("../models/domain/Artist.schema").schema,
    Album: require("../models/domain/ArtistAlbum.schema").schema,
    Activity: require("../models/domain/Activity.schema").schema,
    Place: require("../models/domain/Place.schema").schema,
    ProfileClaim: require("../models/domain/ProfileClaim.schema").schema,
    ReportClaim: require("../models/domain/ReportClaim.schema").schema,
    Follower: require("../models/domain/Follower.schema").schema,
    OpenCall: require("../models/domain/OpenCall.schema").schema,
    OpenCallApplication: require("../models/domain/OpenCallApplication.schema")
      .schema,
  };

  return modelSchemas[modelName] || null;
}

function getModelWithSchema(env, modelName, schema) {
  if (!env) {
    console.error(
      `⚠️ Environment (env) is undefined or null para el modelo ${modelName}`,
    );
    throw new Error(
      `Environment no definido para el modelo ${modelName}. Verifica que req.serverEnvironment esté configurado.`,
    );
  }

  if (!connections[env]) {
    console.error(
      `⚠️ No hay conexión establecida para env: "${env}", modelo: "${modelName}"`,
    );
    throw new Error(`No hay conexión establecida para ${env}, ${modelName}`);
  }

  const conn = connections[env];
  return conn.models[modelName] || conn.model(modelName, schema);
}

async function getModel(connOrEnv, modelName) {
  const schema = getModelSchema(modelName);

  // Determinar si el primer parámetro es una conexión o un string de ambiente
  let env, conn;
  if (typeof connOrEnv === 'string') {
    // Si es un string, es el ambiente
    env = connOrEnv;
    conn = connections[env];
  } else {
    // Si es un objeto, es la conexión
    conn = connOrEnv;
    env = conn?.environment;
  }

  if (modelsWithCustomConnections.includes(modelName)) {
    console.log(`Buscando conexión personalizada de ${modelName}...`);
    const modelConnection = await connectToDatabaseByModel(modelName, env);
    return (
      modelConnection.models[modelName] ||
      modelConnection.model(modelName, schema)
    );
  } else {
    return getModelWithSchema(env, modelName, schema);
  }
}
module.exports = { getModelSchema, getModel, getModelWithSchema };
