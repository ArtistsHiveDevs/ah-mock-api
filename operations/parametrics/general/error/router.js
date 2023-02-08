var express = require("express");

var router = express.Router({ mergeParams: true });

module.exports = [
  router.get("/", (req, res) => {
    const errorCode = req.query.errorCode || 404;
    const errorMsg = req.body.msg || "Sin mensaje";
    return res.status(errorCode).json(errorMsg);
  }),
];
