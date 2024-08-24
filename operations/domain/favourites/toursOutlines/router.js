var express = require("express");
var RoutesConstants = require("./constants/index");
const helpers = require("../../../../helpers");
const { generateTourOutline } = require("./generators");
const {
  createPaginatedDataResponse,
} = require("../../../../helpers/apiHelperFunctions");

var userRouter = express.Router({ mergeParams: true });

module.exports = [
  userRouter.get(
    RoutesConstants.usersList,
    helpers.validateAuthenticatedUser,
    (req, res) => {
      const userId = req.userId;
      return res
        .status(200)
        .json(createPaginatedDataResponse(generateTourOutline(userId)));
    }
  ),
];
