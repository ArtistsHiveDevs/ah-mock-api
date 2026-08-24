const { customAlphabet } = require("nanoid");

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SID_LENGTH = 10;

const nanoidGenerator = customAlphabet(ALPHABET, SID_LENGTH);

function generateSID() {
  return nanoidGenerator(SID_LENGTH);
}

module.exports = { generateSID };
