module.exports = {
  getAvailableTranslation: function (langRQ) {
    let newLang = langRQ;
    const availableTranslations = ["de", "el", "en", "es", "fr", "it", "pt"];
    // Try country especific messages
    let messages = availableTranslations.find((aL) => aL === newLang);

    if (!messages) {
      // Try standard language
      newLang = langRQ.split("-")[0];
      if (newLang) {
        messages = availableTranslations.find((aL) => aL === newLang);
      }
    }

    if (!messages) {
      // Default messages
      newLang = "en";
    }

    return newLang.toLowerCase();
  },
};
