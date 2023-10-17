var express = require("express");
var RoutesConstants = require("./constants/index");
const helpers = require("../../../../helpers");
const { generateTourOutline } = require("./generators");

var userRouter = express.Router({ mergeParams: true });

module.exports = [
  userRouter.get(RoutesConstants.findById, (req, res) => {
    const { id } = req.params;
    return res.status(200).json(generateTourOutline(id));
  }),
];
