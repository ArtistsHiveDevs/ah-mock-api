var express = require("express");
const {
  validateIfUserExists,
  validateEnvironment,
} = require("../../../../helpers");
const apiHelperFunctions = require("../../../../helpers/apiHelperFunctions");

var userRouter = express.Router({ mergeParams: true });

module.exports = [
  userRouter.get("/", validateEnvironment, validateIfUserExists, (req, res) => {
    const { role: entityRole } = req.query;

    const lang = req.lang || "es";
    try {
      if (entityRole) {
        const fs = require("fs");
        const content = fs.readFileSync(
          `./assets/mocks/i18n/${lang}/app/industryOffer/${entityRole}.offer.md`,
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
      } else {
        return res.status(404).json({
          message: `You must specify a role to get its offer`,
        });
      }
    } catch (error) {
      console.log(error);
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
