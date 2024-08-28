const express = require("express");
const mongoose = require("mongoose");

const routesConstants = require("../operations/domain/artists/constants/routes.constants");
const { createPaginatedDataResponse } = require("./apiHelperFunctions");
const User = require("../models/appbase/User");
var helpers = require("./index");
const apiHelperFunctions = require("./apiHelperFunctions");
const EntityDirectory = require("../models/appbase/EntityDirectory");
const createCRUDActions = require("./crud-actions");

// Función genérica para crear rutas CRUD
function createCRUDRoutes(model, modelName) {
  const router = express.Router();
  const modelActions = createCRUDActions(model, modelName);

  // GET list route
  router.get(
    routesConstants.artistsList,
    helpers.validateIfUserExists,
    async (req, res) => {
      try {
        const response = await modelActions.listEntities({
          page: req.query.page,
          limit: req.query.limit,
          fields: req.query.fields,
        });

        res.json(response);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  // GET by ID route
  router.get(
    routesConstants.findArtistById,
    helpers.validateIfUserExists,
    async (req, res) => {
      try {
        const response = await modelActions.findEntityById({
          id: req.params.artistId,
          userId: req.userId,
        });
        res.json(response);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  // POST create route
  router.post(
    routesConstants.create,
    helpers.validateIfUserExists,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      try {
        const response = await modelActions.createEntity({
          userId: req.userId,
          body: req.body,
        });
        res.json(response);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  // PUT update route
  router.put(
    routesConstants.updateById,
    helpers.validateIfUserExists,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      try {
        const { id } = req.params;
        const response = await modelActions.updateEntity({
          id,
          userId: req.userId,
          body: req.body,
        });
        res.json(response);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  );

  return router;
}

module.exports = createCRUDRoutes;
