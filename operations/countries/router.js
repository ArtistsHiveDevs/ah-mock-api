var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");

var router = express.Router({ mergeParams: true });

module.exports = [

    router.get(RoutesConstants.artistsList, (req, res) => {
      let artistsList = require(`../../${RoutesConstants.countriesListLocation}`);
      return res.json(artistsList);
    }),

    router.get(RoutesConstants.findArtistById, (req, res) => {
      let artistsList = require(`../../${RoutesConstants.countriesListLocation}`);
      const { artistId } = req.params;
      const searchArtist = helpers.searchResult(artistsList, artistId, "id");
      return res.json(searchArtist || { message: helpers.noResultDefaultLabel });
    })


];