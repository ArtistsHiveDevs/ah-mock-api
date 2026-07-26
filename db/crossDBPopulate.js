const { connections } = require("./db_g");

/**
 * Hace populate de referencias que están en otra base de datos
 * @param {Object|Array} docs - Documento(s) de Mongoose
 * @param {Object} options - Opciones de populate
 * @param {Connection} options.sourceConnection - Conexión de donde vienen los docs
 * @param {Connection} options.targetConnection - Conexión donde están los datos referenciados
 * @param {Array} options.fields - Campos a popular: [{path: 'country', model: 'Country'}, ...]
 */
async function crossDBPopulate(docs, options) {
  if (!docs) return docs;

  const { targetConnection, fields } = options;
  const isArray = Array.isArray(docs);
  const documents = isArray ? docs : [docs];

  if (!documents.length) return docs;

  // Para cada campo a popular
  for (const field of fields) {
    const { path, model, select } = field;

    try {
      const Model = targetConnection.model(model);

      // Recolectar todos los IDs a buscar
      const idsToPopulate = new Set();

      documents.forEach(doc => {
        const value = doc[path];
        if (!value) return;

        if (Array.isArray(value)) {
          value.forEach(id => id && idsToPopulate.add(id.toString()));
        } else {
          idsToPopulate.add(value.toString());
        }
      });

      if (idsToPopulate.size === 0) continue;

      // Buscar todos los documentos de una vez
      const query = Model.find({ _id: { $in: Array.from(idsToPopulate) } });
      if (select) query.select(select);

      const populatedDocs = await query.lean();

      // Crear un mapa para acceso rápido
      const docsMap = new Map();
      populatedDocs.forEach(doc => {
        docsMap.set(doc._id.toString(), doc);
      });

      // Asignar los documentos populados
      documents.forEach(doc => {
        const value = doc[path];
        if (!value) return;

        if (Array.isArray(value)) {
          doc[path] = value
            .map(id => docsMap.get(id.toString()))
            .filter(Boolean);
        } else {
          doc[path] = docsMap.get(value.toString()) || value;
        }
      });

    } catch (error) {
      console.warn(`⚠️ Error al popular ${path}:`, error.message);
    }
  }

  return isArray ? documents : documents[0];
}

/**
 * Crea un post hook para populate automático entre DBs
 * @param {Schema} schema - Schema de Mongoose
 * @param {String|Function} targetEnv - Ambiente de la conexión objetivo ('prod', 'dev', 'uat') o función que retorna el ambiente
 * @param {Array} fields - Campos a popular
 */
function addCrossDBPopulateHook(schema, targetEnv, fields) {
  // Hooks para queries que retornan uno o varios documentos
  const hooks = ['find', 'findOne', 'findOneAndUpdate', 'findOneAndReplace'];

  hooks.forEach(method => {
    schema.post(method, async function(docs) {
      if (!docs) return docs;

      // Determinar el ambiente objetivo
      const env = typeof targetEnv === 'function' ? targetEnv(this) : targetEnv;

      // Obtener la conexión objetivo
      const targetConnection = connections[env];
      if (!targetConnection) {
        console.warn(`⚠️ No se encontró conexión para ${env}`);
        return docs;
      }

      // Solo hacer populate si el query pidió populate para estos campos
      const populatePaths = this.getOptions().populate || {};
      const requestedPopulate = Object.keys(populatePaths);

      // Filtrar solo los campos que se pidieron popular
      const fieldsToPopulate = fields.filter(field =>
        requestedPopulate.includes(field.path) || requestedPopulate.length === 0
      );

      if (fieldsToPopulate.length === 0) return docs;

      return await crossDBPopulate(docs, {
        targetConnection,
        fields: fieldsToPopulate
      });
    });
  });
}

module.exports = {
  crossDBPopulate,
  addCrossDBPopulateHook
};
