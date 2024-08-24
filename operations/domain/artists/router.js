var express = require("express");
const mongoose = require("mongoose");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const Artist = require("../../../models/domain/Artist");
const User = require("../../../models/appbase/User");
const ErrorCodes = require("../../../constants/errors");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");

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
  artistRouter.get(RoutesConstants.artistsList, async (req, res) => {
    // try {
    //   let result = filterResultsByQuery(req, helpers.getEntityData("Artist"));
    //   // result = helpers.hideProperties(result, RoutesConstants.public_fields);
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
    const { page = 1, limit = 50, fields } = req.query;

    const modelFields = RoutesConstants.public_fields.join(",");

    const projection = (modelFields || fields || "")
      .split(",")
      .reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

    try {
      const artists = await Artist.find({})
        .select(projection)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.json(
        createPaginatedDataResponse(
          artists,
          page,
          Math.ceil(artists.length / limit)
        )
      );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  artistRouter.get(
    RoutesConstants.findArtistById,
    // helpers.validateAuthenticatedUser,
    async (req, res) => {
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
        const artistInfo = await Artist.findOne(query);

        if (!artistInfo) {
          return res.status(404).json({ message: "Artist not found" });
        }

        // Definir los campos visibles según el rol del usuario
        // let visibleAttributes = !userId
        //   ? RoutesConstants.public_fields
        //   : RoutesConstants.authenticated_fields; // Atributos públicos por defecto
        let visibleAttributes = RoutesConstants.authenticated_fields;

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
    RoutesConstants.create,
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
    RoutesConstants.updateById,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      const { id: searchValue } = req.params;
      const userId = req.userId;

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
                  instagram: `INSTAGRAM CAMBIADOOOOO   ${new Date().toLocaleTimeString()}`,
                },
              }, // Ejemplo: Actualizar el campo verified_status a 1
              { new: true }
            );

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

  artistRouter.delete(RoutesConstants.deleteById, async (req, res) => {
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
