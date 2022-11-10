var express = require("express");
var helpers = require("../helpers/helperFunctions");

var artistRouter = express.Router({ mergeParams: true });

var listRoutes = {
  main: "/",
  artistSearch: "/:artistId",
};

module.exports = [

    artistRouter.get(listRoutes.main, (req, res) => {
      let artistsList = require("../assets/artists.json");
      return res.json(artistsList);
    }),

    artistRouter.get(listRoutes.artistSearch, (req, res) => {
      let artistsList = require("../assets/artists.json");
      const { artistId } = req.params;
      const searchArtist = helpers.searchResult(artistsList, artistId, "id");
      return res.json(searchArtist || { message: "No se encontraron resultados" });
    })


];