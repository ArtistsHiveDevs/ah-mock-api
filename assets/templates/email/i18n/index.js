/**
 * Email Translations Index
 *
 * Exports functions to get translations for email templates.
 * Uses English (base.js) as fallback for missing translations.
 */

const base = require("./base");

// Import language files
const languages = {
  en: base,
  de: require("./de"),
  el: require("./el"),
  es: require("./es"),
  "es-co": require("./es-co"),
  fr: require("./fr"),
  it: require("./it"),
  pt: require("./pt"),
};

/**
 * Get the language object, with fallback to English if not found
 * @param {string} lang - Language code
 * @returns {object} - Language translations or base (en)
 */
function getLanguage(lang) {
  const normalizedLang = lang?.toLowerCase() || "en";
  return languages[normalizedLang] || languages.en;
}

/**
 * Deep merge two objects
 * @param {object} target - Base object
 * @param {object} source - Object to merge (overrides target)
 * @returns {object} - Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Flatten nested object to single-level with UPPER_SNAKE_CASE keys
 * Example: { footer: { copyright: "..." } } => { FOOTER_COPYRIGHT: "..." }
 *
 * @param {object} obj - Nested object
 * @param {string} prefix - Current key prefix
 * @returns {object} - Flattened object
 */
function flattenObject(obj, prefix = "") {
  const result = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${toUpperSnakeCase(key)}` : toUpperSnakeCase(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Convert camelCase to UPPER_SNAKE_CASE
 * @param {string} str
 * @returns {string}
 */
function toUpperSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
}

/**
 * Get merged translations for a language (with base as fallback)
 * @param {string} lang - Language code (en, es, de, etc.)
 * @returns {object} - Merged translations object (nested)
 */
function getTranslationsNested(lang = "en") {
  const langTranslations = getLanguage(lang);

  // Merge with base (en) as fallback
  return deepMerge(base, langTranslations);
}

/**
 * Get flattened translations for a language (for template variables)
 * Keys are UPPER_SNAKE_CASE: FOOTER_COPYRIGHT, EMAILS_WELCOME_TITLE, etc.
 *
 * @param {string} lang - Language code (en, es, de, etc.)
 * @returns {object} - Flattened translations object
 */
function getTranslations(lang = "en") {
  const nested = getTranslationsNested(lang);
  return flattenObject(nested);
}

/**
 * Get a specific translation by path
 * @param {string} path - Dot notation path (e.g., "emails.welcome.title")
 * @param {string} lang - Language code
 * @returns {string|object} - Translation value
 */
function t(path, lang = "en") {
  const translations = getTranslationsNested(lang);
  const keys = path.split(".");

  let result = translations;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      // Fallback to base
      result = base;
      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k];
        } else {
          return `[${path}]`; // Key not found
        }
      }
      break;
    }
  }

  return result;
}

/**
 * Artist Hive Social Networks
 */
const ARTIST_HIVE_SOCIAL = {
  instagram: "artist_hive_",
  facebook: "artistshive",
  twitter: "artistshivecom",
  tiktok: "artist.hive",
  youtube: "ArtistsHive",
  twitch: "artistshive",
};

/**
 * Available languages
 */
const AVAILABLE_LANGUAGES = Object.keys(languages);

module.exports = {
  // Functions
  getTranslations,
  getTranslationsNested,
  t,
  flattenObject,
  deepMerge,

  // Data
  ARTIST_HIVE_SOCIAL,
  AVAILABLE_LANGUAGES,

  // Raw translations (for advanced use)
  languages,
  base,
};
