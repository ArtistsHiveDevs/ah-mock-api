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

      const content = fs.readFileSync(
        `./assets/mocks/i18n/${req.lang}/app/faq/faq.md`,
        { encoding: "utf8", flag: "r" }
      );
      return res.status(200).json(
        apiHelperFunctions.createPaginatedDataResponse({
          content,
          lang: req.lang,
          version: 1,
          creationDate: 1,
        })
      );
    } catch (error) {
      console.log(error.code);
      if (error.code === "ENOENT") {
        return res.status(404).json({
          message: `The role "${entityRole}" to get its offer`,
        });
      } else {
        return res.status(500).json([]);
      }
    }
  }),
];
