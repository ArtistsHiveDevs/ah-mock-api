const { promisify } = require("util");
const zlib = require("zlib");

const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Opciones de compresión Brotli
const brotliOptions = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Máxima compresión (0-11)
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT, // Optimizado para texto
  },
};

// Opciones de compresión GZIP (más rápido que Brotli)
const gzipOptions = {
  level: zlib.constants.Z_BEST_COMPRESSION, // Nivel 9 (máxima compresión)
};

/**
 * Comprime un objeto JSON usando Brotli y lo convierte a Base64
 * Máxima compresión pero más lento
 * @param {Object} obj - Objeto a comprimir
 * @returns {Promise<string>} String Base64 comprimido
 */
async function compressJSON(obj) {
  try {
    const jsonString = JSON.stringify(obj);
    const compressed = await brotliCompress(
      Buffer.from(jsonString, "utf8"),
      brotliOptions
    );
    return compressed.toString("base64");
  } catch (error) {
    console.error("[compression] Error compressing JSON:", error);
    throw new Error(`Failed to compress JSON: ${error.message}`);
  }
}

/**
 * Descomprime un string Base64 usando Brotli y retorna el objeto JSON
 * @param {string} compressedString - String Base64 comprimido
 * @returns {Promise<Object>} Objeto JSON descomprimido
 */
async function decompressJSON(compressedString) {
  try {
    const buffer = Buffer.from(compressedString, "base64");
    const decompressed = await brotliDecompress(buffer);
    return JSON.parse(decompressed.toString("utf8"));
  } catch (error) {
    console.error("[compression] Error decompressing JSON:", error);
    throw new Error(`Failed to decompress JSON: ${error.message}`);
  }
}

/**
 * Comprime un objeto JSON usando GZIP (más rápido que Brotli)
 * Buena compresión y velocidad balanceada
 * @param {Object} obj - Objeto a comprimir
 * @returns {Promise<string>} String Base64 comprimido
 */
async function compressJSONFast(obj) {
  try {
    const jsonString = JSON.stringify(obj);
    const compressed = await gzip(Buffer.from(jsonString, "utf8"), gzipOptions);
    return compressed.toString("base64");
  } catch (error) {
    console.error("[compression] Error compressing JSON (fast):", error);
    throw new Error(`Failed to compress JSON: ${error.message}`);
  }
}

/**
 * Descomprime un string Base64 usando GZIP
 * @param {string} compressedString - String Base64 comprimido
 * @returns {Promise<Object>} Objeto JSON descomprimido
 */
async function decompressJSONFast(compressedString) {
  try {
    const buffer = Buffer.from(compressedString, "base64");
    const decompressed = await gunzip(buffer);
    return JSON.parse(decompressed.toString("utf8"));
  } catch (error) {
    console.error("[compression] Error decompressing JSON (fast):", error);
    throw new Error(`Failed to decompress JSON: ${error.message}`);
  }
}

/**
 * Comprime un objeto JSON a Buffer (sin Base64)
 * Útil para almacenar directamente en MongoDB
 * @param {Object} obj - Objeto a comprimir
 * @returns {Promise<Buffer>} Buffer comprimido
 */
async function compressJSONToBuffer(obj) {
  try {
    const jsonString = JSON.stringify(obj);
    return await brotliCompress(Buffer.from(jsonString, "utf8"), brotliOptions);
  } catch (error) {
    console.error("[compression] Error compressing JSON to buffer:", error);
    throw new Error(`Failed to compress JSON to buffer: ${error.message}`);
  }
}

/**
 * Descomprime un Buffer y retorna el objeto JSON
 * @param {Buffer} buffer - Buffer comprimido
 * @returns {Promise<Object>} Objeto JSON descomprimido
 */
async function decompressJSONFromBuffer(buffer) {
  try {
    const decompressed = await brotliDecompress(buffer);
    return JSON.parse(decompressed.toString("utf8"));
  } catch (error) {
    console.error("[compression] Error decompressing JSON from buffer:", error);
    throw new Error(`Failed to decompress JSON from buffer: ${error.message}`);
  }
}

/**
 * Calcula el ratio de compresión
 * @param {Object} obj - Objeto original
 * @param {string|Buffer} compressed - Objeto comprimido
 * @returns {Object} Estadísticas de compresión
 */
function getCompressionStats(obj, compressed) {
  const originalSize = Buffer.byteLength(JSON.stringify(obj), "utf8");
  const compressedSize = Buffer.isBuffer(compressed)
    ? compressed.length
    : Buffer.byteLength(compressed, "base64");

  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

  return {
    originalSize,
    compressedSize,
    savedBytes: originalSize - compressedSize,
    compressionRatio: `${ratio}%`,
  };
}

module.exports = {
  // Brotli (máxima compresión)
  compressJSON,
  decompressJSON,
  compressJSONToBuffer,
  decompressJSONFromBuffer,

  // GZIP (más rápido)
  compressJSONFast,
  decompressJSONFast,

  // Utilidades
  getCompressionStats,
};
