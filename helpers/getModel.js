module.exports = (conn, modelName, schema) => {
  return conn.models[modelName] || conn.model(modelName, schema);
};
