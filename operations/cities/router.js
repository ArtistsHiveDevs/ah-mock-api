var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");

var router = express.Router({ mergeParams: true });

module.exports = [
  router.get(RoutesConstants.citiesList, (req, res) => {
    let artistsList = require(`../../${RoutesConstants.citiesListLocation}`);
    return res.json(artistsList);
  }),

  router.get(RoutesConstants.findCityById, (req, res) => {
    let citiesList = require(`../../${RoutesConstants.citiesListLocation}`);
    const { cityId } = req.params;
    const searchCity = helpers.searchResult(
      citiesList,
      cityId,
      "Codigo_municipio"
    );
    return res.json(searchCity || { message: helpers.noResultDefaultLabel });
  }),
];
