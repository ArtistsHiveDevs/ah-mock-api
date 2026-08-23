const { customAlphabet } = require("nanoid");

// Alfabeto alfanumérico puro (sin símbolos) para que el sID sea seguro de
// usar en URLs sin encoding y fácil de compartir/leer en voz alta.
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SID_LENGTH = 10;

const nanoidGenerator = customAlphabet(ALPHABET, SID_LENGTH);

// customAlphabet() devuelve una función que acepta un override opcional de
// longitud como primer argumento. Mongoose invoca los defaults de schema
// pasándoles el documento en construcción, lo que pisaba ese parámetro y
// dejaba a nanoid esperando una longitud que nunca iba a cumplirse (loop
// infinito -> memoria agotada). Este wrapper ignora cualquier argumento.
function generateSID() {
  return nanoidGenerator(SID_LENGTH);
}

module.exports = { generateSID };
