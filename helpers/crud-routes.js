const express = require("express");

const routesConstants = require("../operations/domain/artists/constants/routes.constants");
const { createPaginatedDataResponse } = require("./apiHelperFunctions");
const { User, schema: userSchema } = require("../models/appbase/User");
var helpers = require("./index");
const apiHelperFunctions = require("./apiHelperFunctions");
const EntityDirectory = require("../models/appbase/EntityDirectory");
const createCRUDActions = require("./crud-actions");

const modelActions = {};

// Función genérica para crear rutas CRUD
function createCRUDRoutes({ modelName, schema, options = {} }) {
  try {
    const router = express.Router();

    // GET list route
    router.get(
      routesConstants.artistsList,
      helpers.validateEnvironment,
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
            limit: 3000 || req.query.limit || 50,
            fields: req.query.fields,
            lang: req.lang,
            public_fields: options.public_fields,
            postScriptFunction: options.postScriptFunction,
          });

          res.json(response);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      }
    );

    // GET by ID route
    router.get(
      routesConstants.findArtistById,
      helpers.validateEnvironment,
      helpers.validateIfUserExists,
      async (req, res) => {
        try {
          const modelActions = await createCRUDActions({
            modelName,
            schema,
            options,
            req,
          });

          const response = await modelActions.findEntityById({
            id: req.params.artistId,
            userId: req.userId,
            lang: req.lang,
            idFields: ["alpha2", "alpha3", "ISO_4217_key", "key"],
            postScriptFunction: options.postScriptFunction,
          });
          res.json(response);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      }
    );

    // POST create route
    router.post(
      routesConstants.create,
      helpers.validateEnvironment,
      helpers.validateIfUserExists,
      helpers.validateAuthenticatedUser,
      async (req, res) => {
        try {
          const modelActions = await createCRUDActions({
            modelName,
            schema,
            options,
            req,
          });

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
      helpers.validateEnvironment,
      helpers.validateIfUserExists,
      helpers.validateAuthenticatedUser,
      async (req, res) => {
        try {
          const modelActions = await createCRUDActions({
            modelName,
            schema,
            options,
            req,
          });

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

    if (!!options.actions) {
      router.post(
        routesConstants.action,
        helpers.validateEnvironment,
        helpers.validateIfUserExists,
        helpers.validateAuthenticatedUser,
        async (req, res) => {
          try {
            const { action } = req.body; // Acción a ejecutar (follow, unfollow, etc.)
            const { id } = req.params; // ID del elemento a modificar
            const modelActions = await createCRUDActions({
              modelName,
              schema,
              options,
              req,
            });

            if (!options.actions || !options.actions[action]) {
              return res
                .status(400)
                .json({ message: `Acción '${action}' no permitida.` });
            }

            // Obtener el documento actual
            const entity = await modelActions.findEntityById({ id });
            if (!entity) {
              return res
                .status(404)
                .json({ message: `${modelName} no encontrado.` });
            }

            // Aplicar la acción definida en options.actions
            const updatedEntity = await options.actions[action](
              req,
              res,
              entity,
              req.body
            );

            // Guardar los cambios
            const response = await modelActions.updateEntity({
              id,
              userId: req.userId,
              body: updatedEntity,
            });

            res.json(response);
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
          }
        }
      );
    }

    return {
      router: Promise.resolve(router),
      modelName,
      schema,
    };
  } catch (error) {
    console.log(error);
  }
}

module.exports = createCRUDRoutes;
