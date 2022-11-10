import { Router } from "express";
import { searchResult } from "../helpers/functionsHelpers";
const fs = require("fs");

const artistRouter = Router({ mergeParams: true });

const listRoutes = {
  main: "/",
  artistSearch: "/:artistId",
};

artistRouter.get(listRoutes.main, (req, res) => {
  let artistsList = require("./artists.json");
  return res.json(artistsList);
});

artistRouter.get(listRoutes.artistSearch, (req, res) => {
  let artistsList = require("./artists.json");
  const { artistId } = req.params;
  const searchArtist = searchResult(artistsList, artistId, "id");
  return res.json(searchArtist || { message: "No se encontraron resultados" });
});

export default artistRouter;
