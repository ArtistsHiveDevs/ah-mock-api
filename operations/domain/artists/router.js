var express = require("express");
const mongoose = require("mongoose");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const Artist = require("../../../models/domain/Artist");
const User = require("../../../models/appbase/User");

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
    const { page = 1, limit = 10, fields } = req.query;

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

      res.json({
        data: artists,
        currentPage: page,
        totalPages: Math.ceil(artists.length / limit),
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  artistRouter.get(
    RoutesConstants.findArtistById,
    helpers.validateAuthenticatedUser,
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
        const artist = await Artist.findOne(query);

        if (!artist) {
          return res.status(404).json({ message: "Artist not found" });
        }

        // Definir los campos visibles según el rol del usuario
        let visibleAttributes = !req.userId
          ? RoutesConstants.public_fields
          : RoutesConstants.authenticated_fields; // Atributos públicos por defecto

        const currentUser = await User.findById(req.userId);

        const roleAsArtist = currentUser.roles.find(
          (role) =>
            role.entityName === "Artist" &&
            role.entityRoleMap.some((entityRole) => {
              // Verifica si entityRole.id es un ObjectId válido
              if (mongoose.Types.ObjectId.isValid(entityRole.id)) {
                // Compara si los ObjectIds son iguales
                return new mongoose.Types.ObjectId(entityRole.id).equals(
                  artist._id
                );
              } else {
                // Compara como strings si no es un ObjectId válido
                return entityRole.id === artist._id.toString();
              }
            })
        );

        if (roleAsArtist) {
          const roleMap = roleAsArtist.entityRoleMap;
          const rolesInArtist = roleMap.find((artistPermissions) => {
            if (mongoose.Types.ObjectId.isValid(artistPermissions.id)) {
              // Compara si los ObjectIds son iguales
              return new mongoose.Types.ObjectId(artistPermissions.id).equals(
                artist._id
              );
            } else {
              // Compara como strings si no es un ObjectId válido
              return artistPermissions.id === artist._id.toString();
            }
            return false;
          });

          if ((rolesInArtist || []).roles.includes("OWNER")) {
            visibleAttributes = [
              ...visibleAttributes,
              // "email",
              // "phone_number",
              // "address",
            ]; // Ejemplo de campos adicionales para OWNER
          } else if (roleAsArtist.roles.includes("PHOTOGRAPHER")) {
            visibleAttributes = [...visibleAttributes, "photo", "description"];
          }
        }

        const artistData = visibleAttributes.reduce((acc, field) => {
          acc[field] = artist[field];
          return acc;
        }, {});

        res.json(artistData);
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
        const ownerRoles = (ownerUser.roles || []).find(
          (role) => role.entityName === "Artist"
        ) || { entityName: "Artist", entityRoleMap: [] };
        let bandInfo = (ownerRoles.entityRoleMap || []).find(
          (band) => band.id === newArtist._id
        );
        if (!bandInfo) {
          bandInfo = {
            id: newArtist._id,
            profile_pic: newArtist.profile_pic,
            name: newArtist.name,
            subtitle: newArtist.subtitle,
            verified_status: newArtist.verified_status,
            roles: ["OWNER"],
          };
          ownerRoles.entityRoleMap.push(bandInfo);
        }

        bandInfo.roles.push("OWNER");
        ownerUser.save();

        res.status(201).send(newArtist);
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

  artistRouter.put(RoutesConstants.updateById, async (req, res) => {
    const { identifier } = req.params;

    try {
      const artist = await Artist.findOneAndUpdate(
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

      res.json(artist);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // const items = helpers.getEntityData("Artist");
    // return res
    //   .status(200)
    //   .json(items[Math.round(Math.random() * items.length)]);
  }),

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

      res.json(artist);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
];
