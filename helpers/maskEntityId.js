/**
 * Enmascara el _id real de Mongo con el sID de la entidad en cualquier
 * documento/estructura que se vaya a devolver en una respuesta de la API,
 * para que el ObjectId real nunca se exponga fuera del backend.
 *
 * Detección genérica (sin hardcodear entidades ni nombres de campo más allá
 * de _id/id/sID, que son universales en el repo): cualquier sub-objeto que
 * tenga `sID` junto con `_id` y/o `id` se enmascara -- se sobreescribe cada
 * una de esas claves de identificador que esté presente con el valor de
 * `sID`, y se quita la clave `sID` (ya cumplió su función, el front la sigue
 * viendo como `_id`/`id` de siempre). Se acepta `id` solo (sin `_id`) porque
 * algunos handlers arman la respuesta reduciendo el documento a una lista
 * explícita de campos que incluye `id` pero no `_id` (ver reducedArtistData
 * en operations/domain/artists/router.js). Un sub-objeto con `_id`/`id` pero
 * sin `sID` (documento previo a este feature, o de una colección que aún no
 * lo genera) se deja intacto -- no rompe ni lanza error.
 *
 * No muta el valor recibido: siempre devuelve una copia nueva.
 *
 * @param {*} data - Documento plano (.toObject()/.lean()/ya serializado),
 *   array de documentos, o valor primitivo (se devuelve tal cual).
 * @returns {*} Copia de `data` con los ids enmascarados.
 */
function maskIds(data) {
  if (Array.isArray(data)) {
    return data.map((item) => maskIds(item));
  }

  if (!isPlainMaskableObject(data)) {
    return data;
  }

  const hasSID = data.sID !== undefined && data.sID !== null;
  const has_Id = data._id !== undefined && data._id !== null;
  const hasIdVirtual = data.id !== undefined && data.id !== null;
  const hasMaskableId = hasSID && (has_Id || hasIdVirtual);

  const masked = {};
  Object.keys(data).forEach((key) => {
    if (hasMaskableId && key === "sID") {
      return;
    }
    masked[key] = maskIds(data[key]);
  });

  if (hasMaskableId) {
    if (has_Id) {
      masked._id = data.sID;
    }
    if (hasIdVirtual) {
      masked.id = data.sID;
    }
  }

  return masked;
}

// Descarta valores que no deben recorrerse campo por campo: primitivos, Date,
// y objetos "opacos" tipo ObjectId/Buffer/Map cuyas propiedades internas no
// son datos de negocio (recorrerlos los rompería).
function isPlainMaskableObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (value instanceof Date || Buffer.isBuffer(value) || value instanceof Map) {
    return false;
  }
  // Instancias de ObjectId (mongoose/bson) exponen toHexString; no son un
  // documento con campos propios a recorrer.
  if (typeof value.toHexString === "function") {
    return false;
  }
  return true;
}

module.exports = { maskIds };
