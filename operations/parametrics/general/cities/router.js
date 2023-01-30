var express = require("express");
var helpers = require("../../../../helpers/index");
var RoutesConstants = require("./constants/index");

var router = express.Router({ mergeParams: true });

module.exports = [
  router.get(RoutesConstants.citiesList, (req, res) => {
    return res.json(helpers.getEntityData("City"));
  }),

  router.get(RoutesConstants.findCityById, (req, res) => {
    const { cityId } = req.params;
    const searchCity = helpers.searchResult(
      helpers.getEntityData("City"),
      cityId,
      "Codigo_municipio"
    );
    return res.json(searchCity || { message: helpers.noResultDefaultLabel });
  }),
];
