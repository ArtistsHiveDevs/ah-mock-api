var express = require("express");
const mongoose = require("mongoose");
var helpers = require("../../../helpers/index");
var routesConstants = require("./constants/index");
const Artist = require("../../../models/domain/Artist.schema");
const User = require("../../../models/appbase/User");
const ErrorCodes = require("../../../constants/errors");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");
const Country = require("../../../models/parametrics/geo/Country.schema");
const createCRUDActions = require("../../../helpers/crud-actions");
const apiHelperFunctions = require("../../../helpers/apiHelperFunctions");

var artistRouter = express.Router({ mergeParams: true });

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [
    {
      field: "events",
      objectRelationshipName: "events",
      relationshipName: "main_artist_id",
      relationshipData: helpers.getEntityData("Event"),
    },
    {
      field: "events.main_artist",
      relationshipName: "main_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      field: "events.guest_artist",
      relationshipName: "guest_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      field: "events.place",
      relationshipName: "place_id",
      relationshipData: helpers.getEntityData("Place"),
    },
  ];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find((fieldName) => fieldName === relationship.field)
    )
  );

  filled.forEach((artist) => {
    const artistsEvents = artist["events"] || [];

    const sortedEvents = helpers.sortByDate(
      artistsEvents,
      "timetable__initial_date",
      "timetable__openning_doors"
    );
    artist["events"] = sortedEvents;
    const placesEvents =
      [...new Set(artist["events"].map((event) => event.place_id))] || [];

    // VISITED CITIES ==================================================================================
    const places = helpers.getEntityData("Place");

    const placesCities = placesEvents.map((placeID) => {
      const place = places.find((place) => `${place.id}` === `${placeID}`);
      return {
        city: place.city,
        state: place.state,
        country: place.country,
        location: place.location,
      };
    });

    const joinedData = placesCities.map(
      (city) => `${city.city}#${city.state}#${city.country}`
    );

    const counts = {};
    artist["events"].forEach(function (event) {
      const place = places.find(
        (place) => `${place.id}` === `${event.place_id}`
      );
      const joinedDataOfPlace = `${place.city}#${place.state}#${place.country}`;

      counts[joinedDataOfPlace] = (counts[joinedDataOfPlace] || 0) + 1;
    });

    const uniqueCities = [...new Set(joinedData)];

    artist["cities"] = uniqueCities.map((uniqueCityJoinedName) => {
      const uniqueCity = placesCities.find(
        (city) =>
          `${city.city}#${city.state}#${city.country}` === uniqueCityJoinedName
      );
      uniqueCity["totalEvents"] = counts[uniqueCityJoinedName];
      return uniqueCity;
    });

    // Social Networks ==================================================================================
    const socialNetworks = [
      "appleMusic",
      "cd_baby",
      "deezer",
      "facebook",
      "instagram",
      "linkedin",
      "soundcloud",
      "spotify",
      "tiktok",
      "twitch",
      "twitter",
      "vimeo",
      "youtube",
    ].filter((socialNetwork) => !!artist[socialNetwork]);

    artist.stats["socialNetworks"] = socialNetworks.map((socialNetwork) => {
      return {
        name: socialNetwork,
        followers: Math.round(Math.random() * 100000),
        variation: (Math.random() * 200 - 100).toFixed(2),
        timelapse: Math.random() > 0.5 ? "semanal" : "mensual",
      };
    });

    if (!artist.stats["socialNetworks"]) {
      artist.stats.socialNetworks = {};
    }

    // Albums from Spotify ===============================================================================
    const albums = helpers.getEntityData("Album");

    artist.arts = {};

    const albumsInfo = albums.find(
      (artistInfo) => `${artistInfo.ah_id}` === `${artist.id}`
    );

    if (albumsInfo?.total > 0) {
      artist.arts["music"] = {
        albums: albumsInfo.items.map((album) => {
          return {
            images: album.images,
            name: album.name,
            release_date: album.release_date,
            release_date_precision: album.release_date_precision,
            spotify: { id: album.id, url: album.external_urls.spotify },
            total_tracks: album.total_tracks,
          };
        }),
      };
    }
  });

  return filled;
}

function filterResultsByQuery(req, result) {
  if (req.query) {
    // Consulta por palabra clave
    if (req.query.q) {
      result = helpers.findMany(helpers.getEntityData("Artist"), req.query.q, [
        "name",
      ]);
    }

    // Consulta por cercanía
    if (req.query.l) {
      const coords = req.query.l.split(",");
      const latlong = {
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1]),
      };
      result = helpers.findByDistance(result, latlong, "location");
    }

    // Pide algunas relaciones a otros elementos
    if (req.query.f) {
      const fields = req.query.f.split(",");

      fillResultWithFields(fields, result);
    }
  }
  return result;
}

module.exports = [
  artistRouter.get(routesConstants.artistsList, async (req, res) => {
    // try {
    //   let result = filterResultsByQuery(req, helpers.getEntityData("Artist"));
    //   // result = helpers.hideProperties(result, routesConstants.public_fields);
    //   return res.json(result);
    // } catch (error) {
    //   console.log(error);
    //   return res.status(500).json([]);
    // }
    // try {
    //   const artists = await Artist.find();
    //   res.status(200).send(artists);
    // } catch (err) {
    //   res.status(500).send(err);
    // }
    let { page = 1, limit = 1000, fields } = req.query;

    const modelFields = routesConstants.public_fields.join(",");

    const projection = (modelFields || fields || "")
      .split(",")
      .reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

    try {
      const artists = await Artist.find({}).select(projection);
      // .skip((page - 1) * limit)
      // .limit(Number(limit));

      helpers.shuffle(artists);

      limit = 100;

      res.json(
        createPaginatedDataResponse(
          artists.slice(0, limit),
          page,
          Math.ceil(artists.length / limit)
        )
      );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  artistRouter.get(
    routesConstants.findArtistById,
    helpers.validateIfUserExists,
    // helpers.validateAuthenticatedUser,
    async (req, res) => {
      lang = req.lang;
      // const { artistId } = req.params;
      // const searchArtist = helpers.searchResult(
      //   helpers.getEntityData("Artist"),
      //   artistId,
      //   "id"
      // );

      // try {
      //   return res.json(
      //     filterResultsByQuery(req, searchArtist) || {
      //       message: helpers.noResultDefaultLabel,
      //     }
      //   );
      // } catch (error) {
      //   console.log(error);

      //   return res.status(500).json({});
      // }
      const { artistId } = req.params;
      const userId = req.userId;

      if (!artistId) {
        res
          .status(404)
          .json({ message: "Must search an id, username or name" });
      }
      try {
        let query = {};

        if (mongoose.Types.ObjectId.isValid(artistId)) {
          // Si es un ObjectId válido, busca por _id
          query._id = artistId; // mongoose.Types.ObjectId(artistId);
        } else {
          // Si no es un ObjectId, busca por otros campos
          query = {
            $or: [
              // { shortId: artistId },
              { username: artistId },
              { name: artistId },
            ],
          };
        }

        const model = Artist;
        const modelName = model.name;

        // Obtener campos de proyección de la configuración
        const projectionFields = routesConstants?.parametric_public_fields?.[
          modelName
        ]?.summary ??
          routesConstants?.authenticated_fields ?? ["name"];

        const modelFields = model.schema.paths.i18n
          ? [...projectionFields, `i18n.${lang}`]
          : projectionFields;

        // console.log(" ========================  ARTIST");
        // console.log(projectionFields);
        // console.log(modelFields);

        // Identificar campos que necesitan populate
        const customPopulateFields = [
          {
            path: "arts.music.related_artists",
            select: routesConstants.public_fields.join(" "),
            populate: {
              path: "country",
              select: routesConstants.parametric_public_fields.Country.summary,
            },
          },
          {
            path: "events",
            select: [
              ...routesConstants.public_fields,
              "timetable__initial_date",
              "timetable__end_date",
              "timetable__openning_doors",
              "timetable__guest_time",
              "timetable__main_artist_time",
              "artists",
              "place",
              "confirmation_status",
            ].join(" "),
            populate: [
              {
                path: "artists",
                select: routesConstants.public_fields,
                populate: {
                  path: "country",
                  select:
                    routesConstants.parametric_public_fields.Country.summary,
                },
              },
              {
                path: "place",
                select: routesConstants.public_fields,
                populate: {
                  path: "country",
                  select:
                    routesConstants.parametric_public_fields.Country.summary,
                },
              },
            ],
          },
        ];

        const populateFields = [
          ...modelFields
            .filter((field) => {
              const fieldType = model.schema.paths[field];
              return (
                fieldType &&
                (fieldType.instance.toLowerCase() === "objectid" ||
                  (fieldType.instance.toLowerCase() === "array" &&
                    fieldType.caster &&
                    fieldType.caster.instance.toLowerCase() === "objectid"))
              );
            })
            .map((field) => {
              const refModelName =
                model.schema.paths[field].options.ref ||
                model.schema.paths[field].caster.options.ref;

              // Obtener el modelo de referencia dinámicamente
              const refModel = mongoose.model(refModelName);
              const hasI18n = refModel.schema.paths.i18n;

              const refModelFields = hasI18n
                ? [
                    `i18n.${lang}`,
                    ...(routesConstants?.parametric_public_fields?.[
                      refModelName
                    ]?.summary ??
                      routesConstants?.public_fields ?? ["name"]),
                  ]
                : routesConstants?.parametric_public_fields?.[refModelName]
                    ?.summary ??
                  routesConstants?.public_fields ?? ["name"];

              return {
                path: field,
                select: refModelFields.join(" "),
              };
            }),

          "events",
          ...customPopulateFields,
        ];

        // console.log("POPULATE: ", populateFields);

        // console.log(query);

        // Construir la consulta con proyección y populate
        let queryResult = model.findOne(query); //.select(projection);

        // console.log(modelName, " Populate ", populateFields);
        // Aplicar `populate` a los campos correspondientes
        if (populateFields.length > 0) {
          populateFields.forEach((populateOption) => {
            queryResult = queryResult.populate(populateOption);
          });
        }

        // Ejecutar la consulta
        let artistInfo = await queryResult.exec();

        // console.log(artistInfo);

        // Manejar caso en el que la entidad no sea encontrada
        if (!artistInfo) {
          throw new Error(`${modelName} not found`);
        }

        // Traducir los resultados utilizando translateDBResults
        artistInfo = apiHelperFunctions.translateDBResults({
          results: [artistInfo],
          lang,
        })[0]; // Convertir el array de resultados en un solo objeto

        artistInfo.events.forEach((event) => {
          if (!event.name) {
            const names = (event.artists || [])
              .slice(0, 3)
              .map((artist) => artist.name)
              .join(", ");
            event.name = `${names} - ${event.place?.name}`;
          }
          if (!event.profile_pic) {
            event.profile_pic =
              event.artists[0]?.profile_pic || event.place?.profile_pic;
          }
          if (!event.description) {
            event.description = event.name;
          }
        });

        // Definir los campos visibles según el rol del usuario
        // let visibleAttributes = !userId
        //   ? routesConstants.public_fields
        //   : routesConstants.authenticated_fields; // Atributos públicos por defecto
        let visibleAttributes = routesConstants.authenticated_fields;

        const currentUser = await User.findById(userId);

        const roleAsArtist = currentUser?.roles.find(
          (role) =>
            role.entityName === "Artist" &&
            role.entityRoleMap.some((entityRole) => {
              // Verifica si entityRole.id es un ObjectId válido
              if (mongoose.Types.ObjectId.isValid(entityRole.id)) {
                // Compara si los ObjectIds son iguales
                return new mongoose.Types.ObjectId(entityRole.id).equals(
                  artistInfo._id
                );
              } else {
                // Compara como strings si no es un ObjectId válido
                return entityRole.id === artistInfo._id.toString();
              }
            })
        );

        let currentUserIsOwner = false;
        if (roleAsArtist) {
          const roleMapInAllArtists = roleAsArtist.entityRoleMap;
          const rolesInArtist = roleMapInAllArtists.find(
            (artistPermissions) => {
              if (mongoose.Types.ObjectId.isValid(artistPermissions.id)) {
                // Compara si los ObjectIds son iguales
                return new mongoose.Types.ObjectId(artistPermissions.id).equals(
                  artistInfo._id
                );
              } else {
                // Compara como strings si no es un ObjectId válido
                return artistPermissions.id === artistInfo._id.toString();
              }
            }
          );

          if ((rolesInArtist?.roles || []).includes("OWNER")) {
            currentUserIsOwner = true;
            visibleAttributes = [
              ...visibleAttributes,
              // "email",
              // "phone_number",
              // "address",
            ]; // Ejemplo de campos adicionales para OWNER
          } else if ((rolesInArtist?.roles || []).includes("PHOTOGRAPHER")) {
            visibleAttributes = [...visibleAttributes, "photo", "description"];
          }
        }

        //  ====================================    Country and city ===========================
        if (!!artistInfo["country"]) {
          // TODO, no debería retornar la capital
          artistInfo.city = artistInfo["city"] || artistInfo["country"].capital;
        }
        if (!!artistInfo.arts?.music?.related_artists) {
          // TODO, no debería retornar la capital
          helpers.shuffle(artistInfo.arts?.music?.related_artists);
        }

        if (!currentUserIsOwner) {
          let reducedArtistData = visibleAttributes.reduce((acc, field) => {
            acc[field] = artistInfo[field];
            return acc;
          }, {});

          res.json(createPaginatedDataResponse(reducedArtistData));
        } else {
          res.json(createPaginatedDataResponse(artistInfo));
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    }
  ),

  // Crear Artista
  artistRouter.post(
    routesConstants.create,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      try {
        const info = { ...req.body };

        info.entityRoleMap = [
          {
            role: "OWNER",
            ids: [new mongoose.Types.ObjectId(req.userId)],
          },
        ];

        const newArtist = new Artist(info);
        await newArtist.save();

        const ownerUser = await User.findById(req.userId);
        let ownerRoles = (ownerUser.roles || []).find(
          (role) => role.entityName === "Artist"
        );
        if (!ownerRoles) {
          ownerUser.roles.push({ entityName: "Artist", entityRoleMap: [] });
          ownerRoles = ownerUser.roles[ownerUser.roles.length - 1];
        }

        let bandInfo = (ownerRoles.entityRoleMap || []).find(
          (band) => band.id === newArtist._id
        );
        if (!bandInfo) {
          bandInfo = {
            id: newArtist._id,
            profile_pic: newArtist.profile_pic,
            name: newArtist.name,
            username: newArtist.username,
            subtitle: newArtist.subtitle,
            verified_status: newArtist.verified_status,
            roles: ["OWNER"],
          };
          ownerRoles.entityRoleMap.push(bandInfo);
        }

        bandInfo.roles.push("OWNER");

        ownerUser.save();

        res.status(201).send(createPaginatedDataResponse(newArtist));
      } catch (err) {
        res.status(400).send(err);
      }

      // try {
      //   const info = { ...req.body };
      //   info.entityRoleMap = [
      //     {
      //       id: req.userId,
      //       roles: ["OWNER"],
      //     },
      //   ];

      //   console.log("LOG 1", info);
      //   const user = new Artist(info);
      //   console.log("LOG 2");
      //   await user.save();
      //   console.log("LOG 3");
      //   res.status(201).send(user);
      //   console.log("LOG 4");
      // } catch (err) {
      //   console.log("LOG 5", err);
      //   console.error(err);
      //   if (!res.headersSent) {
      //     // Asegúrate de que los encabezados no se hayan enviado
      //     res.status(400).send(err);
      //   }
      // }
    }
  ),

  artistRouter.put(
    routesConstants.updateById,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      const { id: searchValue } = req.params;
      const userId = req.userId;

      const newInfo = { ...req.body };

      try {
        // let query = {};

        // if (mongoose.Types.ObjectId.isValid(artistId)) {
        //   // Si es un ObjectId válido, busca por _id
        //   query._id = artistId; // mongoose.Types.ObjectId(artistId);
        // } else {
        //   // Si no es un ObjectId, busca por otros campos
        //   query = {
        //     $or: [
        //       // { shortId: artistId },
        //       { username: artistId },
        //       { name: artistId },
        //     ],
        //   };
        // }
        // const artist = await Artist.findOneAndUpdate(
        //   query,
        //   req.body,
        //   { new: true } // Retorna el documento actualizado
        // );

        // if (!artist) {
        //   return res.status(404).json({ message: "Artist not found" });
        // }

        // res.json(artist);

        // Primero, intentamos encontrar el documento basado en el searchValue
        const artist = await Artist.findOne({
          $or: [
            mongoose.Types.ObjectId.isValid(searchValue)
              ? { _id: searchValue }
              : null,
            { username: searchValue },
            { name: searchValue },
          ].filter(Boolean), // Filtra valores nulos si el cast a ObjectId no es válido
        });

        if (!artist) {
          // Caso 1: El documento no se encontró
          console.log("El artista no fue encontrado.");
          res.status(404).json({
            message: `Artista '${searchValue}' no fue encontrado`,
            errorCode: ErrorCodes.CONTENT_NOT_FOUND,
          });
        } else {
          // Caso 2: El documento fue encontrado, ahora verificamos el userId en los roles
          const hasRole = artist.entityRoleMap.some(
            (role) =>
              ["OWNER", "ADMIN"].includes(role.role) &&
              role.ids.includes(userId)
          );

          if (hasRole) {
            // Si el userId coincide con OWNER o ADMIN, hacemos la actualización
            const updatedArtist = await Artist.findOneAndUpdate(
              {
                _id: artist._id,
                entityRoleMap: {
                  $elemMatch: {
                    role: { $in: ["OWNER", "ADMIN"] },
                    ids: userId,
                  },
                },
              },
              {
                $set: {
                  ...newInfo,
                },
              }, // Ejemplo: Actualizar el campo verified_status a 1
              { new: true }
            );

            if (helpers.hasToUpdateUserRoleMap(newInfo)) {
              const roleMapNewInfo = helpers.userRoleMapFields.reduce(
                (result, key) => {
                  if (newInfo.hasOwnProperty(key)) {
                    result[key] = newInfo[key];
                  }
                  return result;
                },
                {}
              );

              updatedArtist.entityRoleMap?.forEach((role) =>
                role.ids.forEach(async (relatedId) => {
                  const entityName = "Artist"; // El nombre de la entidad cuyo rol deseas actualizar
                  const entityRoleMapId = updatedArtist._id; // El ID dentro del entityRoleMap que deseas actualizar

                  // Construye el objeto de actualización dinámicamente
                  const updateFields = {};
                  Object.keys(roleMapNewInfo).forEach((key) => {
                    updateFields[
                      `roles.$[roleElement].entityRoleMap.$[mapElement].${key}`
                    ] = roleMapNewInfo[key];
                  });

                  // Realizar la consulta de actualización solo para los campos presentes
                  const roleMapUpdateResult = await User.findOneAndUpdate(
                    {
                      _id: new mongoose.Types.ObjectId(userId),
                      "roles.entityName": entityName,
                      "roles.entityRoleMap.id": entityRoleMapId,
                    },
                    {
                      $set: updateFields, // Aplica solo los campos presentes en updateData
                    },
                    {
                      arrayFilters: [
                        { "roleElement.entityName": entityName },
                        { "mapElement.id": entityRoleMapId },
                      ],
                      new: true,
                    }
                  );
                })
              );
            }
            return res
              .status(201)
              .send(createPaginatedDataResponse(updatedArtist));
          } else {
            // Caso 3: El userId no tiene los roles OWNER o ADMIN
            res.status(401).json({
              message: "Unauthorized user",
              errorCode: ErrorCodes.AUTH_PERMISSION_DENIED,
            });
          }
        }
      } catch (err) {
        res.status(500).json({ message: err.message });
      }

      // const items = helpers.getEntityData("Artist");
      // return res
      //   .status(200)
      //   .json(items[Math.round(Math.random() * items.length)]);
    }
  ),

  artistRouter.delete(routesConstants.deleteById, async (req, res) => {
    //   const items = helpers.getEntityData("Artist");
    //   return res
    //     .status(200)
    //     .json(items[Math.round(Math.random() * items.length)]);
    const { identifier } = req.params;

    try {
      const artist = await Artist.findOneAndDelete(
        {
          $or: [
            { id: identifier },
            { shortId: identifier },
            { username: identifier },
          ],
        },
        req.body,
        { new: true } // Retorna el documento actualizado
      );

      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }

      res.json(createPaginatedDataResponse(artist));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
];
