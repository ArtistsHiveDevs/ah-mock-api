var express = require("express");
var helpers = require("../../../../helpers/index");
var RoutesConstants = require("../countries/constants/index");
const {
  createPaginatedDataResponse,
} = require("../../../../helpers/apiHelperFunctions");
const { countries } = require("./countries-data");
const { toCountryObjectId } = require("../../../../helpers/countrySID");

var router = express.Router({ mergeParams: true });

function findNodeByValue(nodes, value, level = 1) {
  for (const node of nodes) {
    if (node.value === value) {
      return node;
    }
    // si tiene hijos, seguir buscando
    const children =
      node.states || node.cities || node.districts || node.neighborhoods; // depende de tu estructura
    if (children) {
      const result = findNodeByValue(children, value, level + 1);
      if (result) return result;
    }
  }
  return null;
}

module.exports = [
  router.get(
    RoutesConstants.artistsList,
    helpers.validateEnvironment,
    (req, res) => {
      const { countryId: countryRQ, level, parentId } = req.query;

      const countryId = toCountryObjectId(req.serverEnvironment, countryRQ);
      const country = countries.find((c) => c.id === countryId);

      if (!country) {
        return res.json(createPaginatedDataResponse([]));
      }

      let response = [];

      switch (parseInt(level)) {
        case 1:
          // states del país
          response = country.states.map((s) => ({
            label: s.label,
            value: s.value,
          }));
          break;

        default:
          // buscar el padre (un nivel antes) usando parentId
          const parent = findNodeByValue(country.states, parentId);
          if (parent) {
            const children =
              parent.states ||
              parent.cities ||
              parent.districts ||
              parent.neighborhoods;
            response = (children || []).map((child) => ({
              label: child.label,
              value: child.value,
            }));
          }
          break;
      }

      return res.json(createPaginatedDataResponse(response));
    },
  ),

  // router.get(RoutesConstants.findArtistById, (req, res) => {
  //   let artistsList = require(`../../${RoutesConstants.countriesListLocation}`);
  //   const { artistId } = req.params;
  //   const searchArtist = helpers.searchResult(artistsList, artistId, "id");
  //   return res.json(searchArtist || { message: helpers.noResultDefaultLabel });
  // }),
];
