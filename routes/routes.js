var allRouter = require("../operations/domain/all/router");
var academyRouter = require("../operations/domain/academies/router");
var artistRouter = require("../operations/domain/artists/router");
var citiesRouter = require("../operations/parametrics/general/cities/router");
var locationEntitiesRouter = require("../operations/parametrics/general/locationEntities/router");
// var rehearsalRoomsRouter = require("../operations/domain/rehearsal_rooms/router");
var ridersRouter = require("../operations/domain/riders/router");
var usersRouter = require("../operations/domain/users/router");
var toursOutlinesRouter = require("../operations/domain/favourites/toursOutlines/router");
var errorsRouter = require("../operations/parametrics/general/error/router");
var industryOfferRouter = require("../operations/app/industryOffer/industryOffer/router");
var termsAndConditionsRouter = require("../operations/app/policies/termsAndConditions/router");
var privacyRouter = require("../operations/app/policies/privacyPolicy/router");
var faqRouter = require("../operations/app/faq/router");
var notificationsRouter = require("../operations/system/notifications/router");
const createCRUDRoutes = require("../helpers/crud-routes");
const Place = require("../models/domain/Place.schema");
const Event = require("../models/domain/Event.schema");
const Prebooking = require("../models/domain/Prebooking.schema");
const ProfileClaim = require("../models/domain/ProfileClaim.schema");
const Currency = require("../models/parametrics/geo/Currency.schema");
const Continent = require("../models/parametrics/geo/Continent.schema");
const Country = require("../models/parametrics/geo/Country.schema");
const Language = require("../models/parametrics/geo/Language.schema");
const Allergy = require("../models/parametrics/geo/demographics/Allergies.schema");
const routesConstants = require("../operations/domain/artists/constants/routes.constants");
const helperFunctions = require("../helpers/helperFunctions");
const { normalizeProfileId } = require("../models/appbase/EntityDirectory");
const { getModel } = require("../helpers/getModel");
const {
  notifyPrebookingCreated,
  notifyPrebookingStatusChanged,
} = require("../helpers/prebookingNotifications");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Elimina múltiples campos de un objeto
 * @param {Object} obj - Objeto del cual eliminar campos
 * @param {Array<string>} fields - Array de nombres de campos a eliminar
 */
function deleteFields(obj, fields) {
  fields.forEach((field) => delete obj[field]);
}

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
          postScriptFunction: (data) => {
            const { results, req } = data || {};
            console.log("EVENTOS::::::    ", results?.length);
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
          postScriptFunction: (data) => {
            const { results, req } = data || {};
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
      path: "/prebookings",
      route: createCRUDRoutes({
        modelName: "Prebooking",
        schema: Prebooking.schema,
        options: {
          public_fields: [
            ...routesConstants.public_fields,
            "event_name",
            "description",
            "requester",
            "recipients",
            "participant_approvals",
            "flexible_dates",
            "status",
            "created_by",
            "response_deadline",
            "last_viewed_by",
            "requested_date_start",
            "requested_date_end",
          ],
          authenticated_fields: [
            ...routesConstants.public_fields,
            "event_name",
            "description",
            "requester",
            "recipients",
            "participant_approvals",
            "flexible_dates",
            "status",
            "created_by",
            "response_deadline",
            "last_viewed_by",
            "requested_date_start",
            "requested_date_end",
          ],
          customPopulateFields: [
            {
              path: "requester_profile_id",
              select: [
                ...routesConstants.appbase_public_fields.EntityDirectory
                  .summary,
                "location",
              ].join(" "),
            },
            {
              path: "recipient_ids",
              select: [
                ...routesConstants.appbase_public_fields.EntityDirectory
                  .summary,
                "location",
              ].join(" "),
            },
          ],
          postScriptFunction: async (data) => {
            const { results, req } = data || {};
            // Normalizar el profile ID del usuario actual
            const ids = await normalizeProfileId(
              req.user.currentProfileIdentifier,
              req.connection
            );

            console.log("IDS Prebooking: ", ids);

            const PrebookingModel = await getModel(
              req.serverEnvironment,
              "Prebooking"
            );

            const processResult = async (result) => {
              // Auto-agregar a participant_approvals si es recipient y no está
              await PrebookingModel.ensureParticipantExists(
                result,
                ids.entity_id,
                req.user.id,
                req.connection
              );

              // Renombrar campos
              result.requester = result.requester_profile_id;
              result.recipients = result.recipient_ids;

              // Limpiar campos de recipients
              result.recipients?.forEach((recipient) => {
                deleteFields(recipient, ["_id", "genres"]);
              });

              // Limpiar campos del resultado
              deleteFields(result, ["requester_profile_id", "recipient_ids"]);
            };

            // Procesar array o objeto único
            if (Array.isArray(results)) {
              await Promise.all(results.map(processResult));
            } else if (results) {
              await processResult(results);
            }
          },
          filters: [
            {
              field: "recipient_ids",
              compareWith: "sameProfile",
              compareField: "_id",
            },
          ],
          postCreateFunction: async (data) => {
            const { entity, req } = data || {};

            // Populate requester y recipients para las notificaciones
            await entity.populate([
              {
                path: "requester_profile_id",
                select: ["name", "email"].join(" "),
              },
              {
                path: "recipient_ids",
                select: ["name", "email", "entity_type"].join(" "),
              },
            ]);

            // Enviar notificaciones a los recipients
            await notifyPrebookingCreated(entity, req.connection, req.lang);

            return entity;
          },
          actions: {
            setStatus: async (req, res, entity, body) => {
              // Normalizar el profile ID del usuario actual
              const ids = await normalizeProfileId(
                req.user.currentProfileIdentifier,
                req.connection
              );

              // Actualizar el estado del participante
              // body debe contener: { status: "accepted"|"rejected"|"viewed"|"pending", notes: "..." }
              entity.updateParticipantStatus(
                ids.entity_id,
                body.status,
                body.notes
              );

              console.log(
                "[setStatus] Profile ID:",
                ids.entity_id,
                "| New status:",
                body.status
              );

              // Populate para las notificaciones
              await entity.populate([
                {
                  path: "requester_profile_id",
                  select: ["name", "email"].join(" "),
                },
                {
                  path: "recipient_ids",
                  select: ["name", "email", "entity_type"].join(" "),
                },
              ]);

              // Enviar notificación al requester sobre el cambio de estado
              await notifyPrebookingStatusChanged(
                entity,
                ids.entity_id,
                body.status,
                body.notes,
                req.lang
              );

              // Retornar el entity modificado para que crud-routes lo guarde
              return entity;
            },
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
    // { path: "/rehearsal_rooms", route: { router: rehearsalRoomsRouter } },
    { path: "/industryOffer", route: { router: industryOfferRouter } },
    { path: "/riders", route: { router: ridersRouter } },
    { path: "/users", route: { router: usersRouter } },
    { path: "/tours_outlines", route: { router: toursOutlinesRouter } },
    { path: "/error", route: { router: errorsRouter } },
    { path: "/terms", route: { router: termsAndConditionsRouter } },
    { path: "/privacy", route: { router: privacyRouter } },
    { path: "/faq", route: { router: faqRouter } },
    { path: "/notifications", route: { router: notificationsRouter } },
  ];
}

console.log("Exportando rutas.......");
module.exports = { loadRoutes };
