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
    Place: require("../models/domain/Place.schema").schema,
    ProfileClaim: require("../models/domain/ProfileClaim.schema").schema,
    Follower: require("../models/domain/Follower.schema").schema,
  };

  return modelSchemas[modelName] || null;
}

function getModelWithSchema(env, modelName, schema) {
  if (!connections[env])
    throw new Error(`No hay conexión establecida para ${env}, ${modelName}`);
  const conn = connections[env];
  return conn.models[modelName] || conn.model(modelName, schema);
}

async function getModel(conn, modelName) {
  const schema = getModelSchema(modelName);

  if (modelsWithCustomConnections.includes(modelName)) {
    const modelConnection = await connectToDatabaseByModel(modelName);
    return (
      modelConnection.models[modelName] ||
      modelConnection.model(modelName, schema)
    );
  } else {
    return getModelWithSchema(conn, modelName, schema);
  }
}
module.exports = { getModelSchema, getModel, getModelWithSchema };
