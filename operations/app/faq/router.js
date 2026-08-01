var express = require("express");
const {
  validateIfUserExists,
  validateEnvironment,
} = require("../../../helpers");
const apiHelperFunctions = require("../../../helpers/apiHelperFunctions");

var userRouter = express.Router({ mergeParams: true });

module.exports = [
  userRouter.get("/", validateEnvironment, validateIfUserExists, (req, res) => {
    try {
      const fs = require("fs");
      const lang = req.lang || req.query.lang || 'en'; // Fallback a 'en' si no hay idioma

      const content = fs.readFileSync(
        `./assets/mocks/i18n/${lang}/app/faq/faq.md`,
        { encoding: "utf8", flag: "r" },
      );
      return res.status(200).json(
        apiHelperFunctions.createPaginatedDataResponse({
          content,
          lang: lang,
          version: 1,
          creationDate: 1,
        }),
      );
    } catch (error) {
      console.log(error.code);
      if (error.code === "ENOENT") {
        const lang = req.lang || req.query.lang || 'en';
        return res.status(404).json({
          message: `FAQ file not found for language "${lang}"`,
        });
      } else {
        return res.status(500).json([]);
      }
    }
  }),
];
