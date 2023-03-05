var express = require("express");

var router = express.Router({ mergeParams: true });

module.exports = [
  router.get("/", (req, res) => {
    try {
      const versions = [
        {
          version: "1.0",
          initial_date: new Date(),
          final_date: new Date(),
          current: false,
          draft: false,
        },
        {
          version: "2.0",
          initial_date: new Date(),
          final_date: undefined,
          current: true,
          draft: false,
        },
      ];

      const version = req.query.v;
      if (!version) {
        return res.json(versions);
      } else {
        const versionObj = versions.find(
          (versionObj) => versionObj.version === version
        );
        if (versionObj) {
          const fs = require("fs");
          const policy = fs.readFileSync(
            `./assets/mocks/app/policies/privacy/privacy.v${version}.md`,
            { encoding: "utf8", flag: "r" }
          );

          return res.status(200).json({ ...versionObj, policy });
        } else {
          return res.status(404).json({
            message: `Privacy Policy version ${version} was not found`,
          });
        }
      }
      // return res.json(filterResultsByQuery(req, helpers.getEntityData("User")));
    } catch (error) {
      console.log(error);
      return res.status(500).json([]);
    }
  }),
];
