var express = require("express");
var helpers = require("../../../../helpers/index");
var RoutesConstants = require("../countries/constants/index");
const {
  createPaginatedDataResponse,
} = require("../../../../helpers/apiHelperFunctions");
const { countries } = require("./countries-data");

var router = express.Router({ mergeParams: true });

function findNodeByValue(nodes, value, level = 1) {
  for (const node of nodes) {
    // Buscar por value o sID
    if (node.value === value || node.sID === value) {
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

      // countryRQ puede ser sID, ObjectId o ISO code
      const country = countries.find(
        (c) => c.id === countryRQ || c.sID === countryRQ || c.value === countryRQ
      );

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
            id: s.sID,
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
              id: child.sID,
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
