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
function createCRUDRoutes({ modelName, schema, options = {} }) {
  try {
    const router = express.Router();

    console.log("****   2 ", modelName);

    // GET list route
    router.get(
      routesConstants.artistsList,
      helpers.validateIfUserExists,
      async (req, res) => {
        try {
          const modelActions = await createCRUDActions({
            modelName,
            schema,
            options,
            req,
          });
          const response = await modelActions.listEntities({
            page: req.query.page,
            limit: 3000 || req.query.limit || 100,
            fields: req.query.fields,
            lang: req.lang,
            public_fields: options.public_fields,
            postScriptFunction: options.postScriptFunction,
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
            lang: req.lang,
            idFields: ["alpha2", "alpha3"],
            postScriptFunction: options.postScriptFunction,
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

    return Promise.resolve(router);
  } catch (error) {
    console.log(error);
  }
}

module.exports = createCRUDRoutes;
