var allRouter = require("../operations/domain/all/router");
var academyRouter = require("../operations/domain/academies/router");
var artistRouter = require("../operations/domain/artists/router");
var citiesRouter = require("../operations/parametrics/general/cities/router");
var locationEntitiesRouter = require("../operations/parametrics/general/locationEntities/router");
var rehearsalRoomsRouter = require("../operations/domain/rehearsal_rooms/router");
var ridersRouter = require("../operations/domain/riders/router");
var usersRouter = require("../operations/domain/users/router");
var toursOutlinesRouter = require("../operations/domain/favourites/toursOutlines/router");
var errorsRouter = require("../operations/parametrics/general/error/router");
var industryOfferRouter = require("../operations/app/industryOffer/industryOffer/router");
var termsAndConditionsRouter = require("../operations/app/policies/termsAndConditions/router");
var privacyRouter = require("../operations/app/policies/privacyPolicy/router");
var faqRouter = require("../operations/app/faq/router");
const createCRUDRoutes = require("../helpers/crud-routes");
const Place = require("../models/domain/Place.schema");
const Event = require("../models/domain/Event.schema");
const ProfileClaim = require("../models/domain/ProfileClaim.schema");
const MusicGenresLevel1 = require("../models/parametrics/music-genres/genres-level1.schema");
const MusicGenresLevel2 = require("../models/parametrics/music-genres/genres-level2.schema");
const MusicGenresLevel3 = require("../models/parametrics/music-genres/genres-level3.schema");
const Currency = require("../models/parametrics/geo/Currency.schema");
const Continent = require("../models/parametrics/geo/Continent.schema");
const Country = require("../models/parametrics/geo/Country.schema");
const Language = require("../models/parametrics/geo/Language.schema");
const Allergy = require("../models/parametrics/geo/demographics/Allergies.schema");
const Instrument = require("../models/domain/Instrument.schema");
const MusicianClassification = require("../models/domain/MusicianClassification.schema");
const VenueEquipment = require("../models/domain/VenueEquipment.schema");
const BandShowConfiguration = require("../models/domain/BandShowConfiguration.schema");
const routesConstants = require("../operations/domain/artists/constants/routes.constants");
const helperFunctions = require("../helpers/helperFunctions");

function loadRoutes() {
  return [
    { path: "/", route: { router: allRouter } },
    { path: "/academies", route: { router: academyRouter } },
    {
      path: "/allergies",
      route: createCRUDRoutes({
        modelName: "Allergy",
        schema: Allergy.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    { path: "/artists", route: { router: artistRouter } },
    { path: "/cities", route: { router: citiesRouter } },
    {
      path: "/countries",
      route: createCRUDRoutes({
        modelName: "Country",
        schema: Country.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/continents",
      route: createCRUDRoutes({
        modelName: "Continent",
        schema: Continent.schema,
      }),
    },
    {
      path: "/currencies",
      route: createCRUDRoutes({
        modelName: "Currency",
        schema: Currency.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/events",
      route: createCRUDRoutes({
        modelName: "Event",
        schema: Event.schema,
        options: {
          public_fields: [
            ...routesConstants.public_fields,
            "timetable__initial_date",
            "timetable__end_date",
            "timetable__openning_doors",
            "timetable__guest_time",
            "timetable__main_artist_time",
            "artists",
            "place",
            "confirmation_status",
          ],
          authenticated_fields: [
            ...routesConstants.public_fields,
            "timetable__initial_date",
            "timetable__end_date",
            "timetable__openning_doors",
            "timetable__guest_time",
            "timetable__main_artist_time",
            "artists",
            "place",
            "confirmation_status",
            "id",
            // "name",
            // // "subtitle",
            // // "main_artist_id",
            // // "guest_artist_id",
            // // "place_id",
            // "timetable__initial_date",
            // "timetable__end_date",
            // "timetable__openning_doors",
            // "timetable__guest_time",
            // "timetable__main_artist_time",
            // "promoter",
            // // "national_code",
            // "profile_pic",
            // "verified_status",
            // // "tickets_website",
            // // "description",
            // // "website",
            // // "email",
            // // "mobile_phone",
            // // "whatsapp",
            // // "facebook",
            // // "twitter",
            // // "instagram",
            // // "spotify",
            // // "youtube",
            // // "additional_info",
            // // "dress_code",
            // // "discounts",
            // "confirmation_status",
            // "place",
            // // "main_artist",
            // // "genres"
          ],
          customPopulateFields: [
            {
              path: "place",
              select: routesConstants.public_fields.join(" "),
              populate: {
                path: "country",
                select:
                  routesConstants.parametric_public_fields.Country.summary,
              },
            },
          ],
          postScriptFunction: (results) => {
            results.forEach((result) => {
              const artistName = result.artists?.[0]?.name || null;
              const placeName = result.place?.name || null;

              const automaticName = [artistName, placeName]
                .filter(Boolean)
                .join(" - ");

              if (!result.name) {
                result.name = automaticName;
              }
              if (!result.profile_pic) {
                result.profile_pic =
                  result.artists[0]?.profile_pic || result.place?.profile_pic;
              }
              if (!result.description) {
                result.description = automaticName;
              }

              try {
                result.timetable__initial_date =
                  helperFunctions.addMonthsToDate(
                    result.timetable__initial_date,
                    5
                  );
              } catch (error) {}
              result.timetable__openning_doors = Number(
                result.timetable__openning_doors?.replace(":", "") || 0
              );
              result.timetable__main_artist_time = Number(
                result.timetable__main_artist_time?.replace(":", "") || 0
              );

              result.price = 25000 + Math.floor(Math.random() * 10000) - 5000;

              result.phone = 3 + Math.floor(Math.random() * 99999999);
              result.additional_info =
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
              result.dress_code =
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";
              result.promoter = "Sed ut perspiciatis unde omnis";
            });
          },
        },
      }),
    },
    {
      path: "/langs",
      route: createCRUDRoutes({
        modelName: "Language",
        schema: Language.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/genres1",
      route: createCRUDRoutes({
        modelName: "MusicGenresLevel1",
        schema: MusicGenresLevel1.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/genres2",
      route: createCRUDRoutes({
        modelName: "MusicGenresLevel2",
        schema: MusicGenresLevel2.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/genres3",
      route: createCRUDRoutes({
        modelName: "MusicGenresLevel3",
        schema: MusicGenresLevel3.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/instruments",
      route: createCRUDRoutes({
        modelName: "Instrument",
        schema: Instrument.schema,
        options: {
          public_fields: [
            "uniqueId",
            "name",
            "slug",
            "family",
            "category",
            "subcategory",
            "musicianClassification",
            "physicalProperties",
            "musicalProperties",
            "transportLogistics",
            "usageContext",
            "popularityScore",
            "status",
            "i18n",
          ],
          customPopulateFields: [
            {
              path: "geographic.originCountry",
              select: "name alpha2 alpha3",
            },
            {
              path: "geographic.popularIn",
              select: "name alpha2 alpha3",
            },
          ],
          listEntities: { limit: 500 },
        },
      }),
    },
    {
      path: "/musician-classifications",
      route: createCRUDRoutes({
        modelName: "MusicianClassification",
        schema: MusicianClassification.schema,
        options: {
          public_fields: [
            "id",
            "displayName",
            "description",
            "icon",
            "color",
            "techniqueFamily",
            "techniqueSimilarityScore",
            "brandImportance",
            "sponsorPotential",
            "crossoverDifficulty",
            "skillTransferability",
            "typicalBrands",
            "uiConfig",
            "isActive",
            "isPopular",
            "i18n",
          ],
          customPopulateFields: [
            {
              path: "coversInstruments",
              select: "name uniqueId popularityScore family category",
            },
            {
              path: "geographicPopularity.country",
              select: "name alpha2 alpha3",
            },
          ],
          listEntities: { limit: 0 },
        },
      }),
    },
    {
      path: "/venue-equipment",
      route: createCRUDRoutes({
        modelName: "VenueEquipment",
        schema: VenueEquipment.schema,
        options: {
          public_fields: [
            "venue",
            "venueName",
            "location",
            "inventory",
            "policies",
            "contacts",
            "capabilities",
            "statistics",
            "isActive",
          ],
          authenticated_fields: [
            "venue",
            "venueName",
            "location",
            "inventory",
            "policies",
            "contacts",
            "capabilities",
            "statistics",
            "lastInventoryUpdate",
            "featuredEquipment",
            "isActive",
          ],
          customPopulateFields: [
            {
              path: "venue",
              select: routesConstants.public_fields.join(" "),
              populate: {
                path: "country",
                select:
                  routesConstants.parametric_public_fields.Country.summary,
              },
            },
            {
              path: "location.country",
              select: "name alpha2 alpha3",
            },
          ],
        },
      }),
    },
    {
      path: "/band-show-configurations",
      route: createCRUDRoutes({
        modelName: "BandShowConfiguration",
        schema: BandShowConfiguration.schema,
        options: {
          public_fields: [
            "band",
            "bandName",
            "homeLocation",
            "showConfigurations",
            "defaultPreferences",
            "aggregateStats",
            "isActive",
            "isPublicProfile",
          ],
          authenticated_fields: [
            "band",
            "bandName",
            "homeLocation",
            "showConfigurations",
            "defaultPreferences",
            "globalSponsorships",
            "aggregateStats",
            "availability",
            "isActive",
            "isPublicProfile",
          ],
          customPopulateFields: [
            {
              path: "band",
              select: routesConstants.public_fields.join(" "),
              populate: {
                path: "country",
                select:
                  routesConstants.parametric_public_fields.Country.summary,
              },
            },
            {
              path: "homeLocation.country",
              select: "name alpha2 alpha3",
            },
            {
              path: "showConfigurations.bandMembers.member",
              select: "name username profile_pic",
            },
            {
              path: "showConfigurations.venueCompatibility.geographicPreferences.preferredCountries",
              select: "name alpha2 alpha3",
            },
            {
              path: "showConfigurations.performanceHistory.successfulVenueMatches",
              select: "name city country",
            },
          ],
        },
      }),
    },
    {
      path: "/locationEntities",
      route: { router: locationEntitiesRouter },
    },
    // { path: "/instruments", route: createCRUDRoutes({model:Instrument, "Instrument") },
    // { path: "/places", route: placesRoutetrue
    {
      path: "/places",
      route: createCRUDRoutes({
        modelName: "Place",
        schema: Place.schema,
        options: {
          randomizeGetAll: true,
          customPopulateFields: [
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
          ],
          postScriptFunction: (results) => {
            results.forEach((place) => {
              (place.events || []).forEach((event) => {
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

                event.timetable__initial_date = helperFunctions.addMonthsToDate(
                  event.timetable__initial_date,
                  5
                );
              });
            });
          },
        },
      }),
    },
    {
      path: "/claimprofile",
      route: createCRUDRoutes({
        modelName: "ProfileClaim",
        schema: ProfileClaim.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    { path: "/rehearsal_rooms", route: { router: rehearsalRoomsRouter } },
    { path: "/industryOffer", route: { router: industryOfferRouter } },
    { path: "/riders", route: { router: ridersRouter } },
    { path: "/users", route: { router: usersRouter } },
    { path: "/tours_outlines", route: { router: toursOutlinesRouter } },
    { path: "/error", route: { router: errorsRouter } },
    { path: "/terms", route: { router: termsAndConditionsRouter } },
    { path: "/privacy", route: { router: privacyRouter } },
    { path: "/faq", route: { router: faqRouter } },
  ];
}

console.log("Exportando rutas.......");
module.exports = { loadRoutes };
