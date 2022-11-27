var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");

var artistRouter = express.Router({ mergeParams: true });

module.exports = [

    artistRouter.get(RoutesConstants.artistsList, (req, res) => {
      let artistsList = require(`../../${RoutesConstants.artistListLocation}`);
      return res.json(artistsList);
    }),

    artistRouter.get(RoutesConstants.findArtistById, (req, res) => {
      let artistsList = require(`../../${RoutesConstants.artistListLocation}`);
      const { artistId } = req.params;
      const searchArtist = helpers.searchResult(artistsList, artistId, "id");
      return res.json(searchArtist || { message: helpers.noResultDefaultLabel });
    })


];