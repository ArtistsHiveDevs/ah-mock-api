var express = require("express");

var userRouter = express.Router({ mergeParams: true });

module.exports = [
  userRouter.get("/", (req, res) => {
    const { role: entityRole } = req.query;
    try {
      if (entityRole) {
        const fs = require("fs");
        const offer = fs.readFileSync(
          `./assets/mocks/app/industryOffer/${entityRole}.offer.md`,
          { encoding: "utf8", flag: "r" }
        );
        return res.status(200).json({ offer });
      } else {
        return res.status(404).json({
          message: `You must specify a role to get its offer`,
        });
      }
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
