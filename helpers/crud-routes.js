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

    // Obtener middlewares desde helpers (centralizados)
    const baseMiddlewares = helpers.getBaseMiddlewares();
    const actionContextMiddlewares =
      helpers.getActionContextMiddlewares(modelName);
    const writeMiddlewares = helpers.getWriteMiddlewares();

    // GET list route
    router.get(
      routesConstants.artistsList,
      ...baseMiddlewares,
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
            filters: options.filters,
            user: req.user,
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
      ...baseMiddlewares,
      async (req, res) => {
        try {
          const modelActions = await createCRUDActions({
            modelName,
            schema,
            options,
            req,
          });

          const response = await modelActions.findEntityById({
            req,
            res,
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
      ...writeMiddlewares,
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
          console.error(`[${modelName}] Error creating entity:`, err.message);
          console.error("Stack trace:", err.stack);
          res.status(500).json({ message: err.message });
        }
      }
    );

    // PUT update route
    router.put(
      routesConstants.updateById,
      ...writeMiddlewares,
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

    // DELETE route
    router.delete(
      routesConstants.updateById,
      ...writeMiddlewares,
      async (req, res) => {
        try {
          const modelActions = await createCRUDActions({
            modelName,
            schema,
            options,
            req,
          });

          const { id } = req.params;
          const response = await modelActions.deleteEntity({
            id,
            userId: req.userId,
          });
          res.json(response);
        } catch (err) {
          console.error(`[${modelName}] Error deleting entity:`, err.message);
          res.status(500).json({ message: err.message });
        }
      }
    );

    if (!!options.actions) {
      router.post(
        routesConstants.action,
        ...writeMiddlewares,
        async (req, res) => {
          try {
            const { id, action } = req.body; // Acción a ejecutar (follow, unfollow, etc.)

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

            // Obtener el documento actual (raw = documento de Mongoose con métodos)
            const entity = await modelActions.findEntityById({ id, raw: true });
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
            let result;

            // Si la acción retorna un documento de Mongoose, guardarlo directamente
            if (updatedEntity && typeof updatedEntity.save === "function") {
              await updatedEntity.save();
              result = updatedEntity.toObject();
            } else {
              // Si retorna un objeto plano, usar updateEntity
              const response = await modelActions.updateEntity({
                id,
                userId: req.userId,
                body: updatedEntity,
              });
              // Extraer el dato del response (puede estar en .data o directamente)
              result = response.data || response;
            }

            // Aplicar postScriptFunction si existe
            if (
              options.postScriptFunction &&
              typeof options.postScriptFunction === "function"
            ) {
              await options.postScriptFunction({ results: result, req });
            }

            // Retornar respuesta paginada
            res.json(apiHelperFunctions.createPaginatedDataResponse(result));
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
