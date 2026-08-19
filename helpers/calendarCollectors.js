const { getModel } = require("./getModel");
const { resolveActiveProfileOwner } = require("./activityOwnership");

const CALENDAR_EVENT_TYPES = {
  CONCERT: "concert",
  CALL: "call",
  ACTIVITY: "activity",
};

const CONCERT_SOURCE_ENABLED = false;

const PUBLISHED_OPEN_CALL_STATUS = "OPEN";

function parseCalendarDate(value) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date) {
  const startOfDayDate = new Date(date);
  startOfDayDate.setHours(0, 0, 0, 0);
  return startOfDayDate;
}

// Un evento `allDay` no puede viajar como ISO completo: el cliente lo interpreta
// en su zona horaria y en cualquier offset negativo (ej. es-co, UTC-5) lo dibuja
// el día anterior. Las fechas sueltas "YYYY-MM-DD" no se desplazan.
function toDateOnly(date) {
  return date.toISOString().split("T")[0];
}

function toCalendarDateValue(date, allDay) {
  return allDay ? toDateOnly(date) : date.toISOString();
}

async function collectConcertCalendarEvents() {
  if (!CONCERT_SOURCE_ENABLED) {
    return [];
  }

  // Punto de reactivación: acá va la lectura del modelo de conciertos del usuario.
  return [];
}

async function collectCallCalendarEvents({ req, from, to }) {
  const OpenCallModel = await getModel(req.serverEnvironment, "OpenCall");

  const openCalls = await OpenCallModel.find({
    status: PUBLISHED_OPEN_CALL_STATUS,
  })
    .select(
      "event_name end_date event_date status place_id city applications_count"
    )
    .lean();

  const today = startOfDay(new Date());

  return openCalls.reduce((calendarEvents, openCall) => {
    // `end_date` (fecha de cierre de la convocatoria) está tipado como String en
    // OpenCall.schema.js: acotar el rango dentro de la query sería una comparación
    // lexicográfica, no de fechas, así que el filtro se resuelve acá ya parseado.
    const deadline = parseCalendarDate(openCall.end_date);

    const isOutOfRange = !deadline || deadline < from || deadline > to;

    if (isOutOfRange) {
      return calendarEvents;
    }

    const deadlineDate = toDateOnly(deadline);
    // Las vencidas se devuelven marcadas en vez de filtrarse: descartarlas dejaba
    // el calendario vacío de convocatorias al navegar a meses pasados.
    const isExpired = deadline < today;

    calendarEvents.push({
      id: openCall._id.toString(),
      type: CALENDAR_EVENT_TYPES.CALL,
      title: openCall.event_name || null,
      start: deadlineDate,
      end: deadlineDate,
      allDay: true,
      status: openCall.status || null,
      entityId: openCall.place_id ? openCall.place_id.toString() : null,
      meta: {
        city: openCall.city || null,
        event_date: openCall.event_date || null,
        applications_count: openCall.applications_count || 0,
        expired: isExpired,
      },
    });

    return calendarEvents;
  }, []);
}

async function collectActivityCalendarEvents({ req, from, to }) {
  const activeProfileOwner = resolveActiveProfileOwner(req);

  if (!req.userId || !activeProfileOwner) {
    return [];
  }

  const ActivityModel = await getModel(req.serverEnvironment, "Activity");

  // Solapamiento de intervalos, no "empieza dentro del rango": una actividad de
  // varios días que arranca antes de la ventana visible sigue estando en curso
  // dentro de ella.
  const activities = await ActivityModel.find({
    ...activeProfileOwner,
    start: { $lte: to },
    $or: [{ end: { $gte: from } }, { end: null, start: { $gte: from } }],
  }).lean();

  return activities.map((activity) => ({
    id: activity._id.toString(),
    type: CALENDAR_EVENT_TYPES.ACTIVITY,
    title: activity.title || null,
    start: toCalendarDateValue(activity.start, activity.allDay),
    end: activity.end
      ? toCalendarDateValue(activity.end, activity.allDay)
      : null,
    allDay: !!activity.allDay,
    status: null,
    entityId: activity.owner_profile_id.toString(),
    meta: {
      activity_type: activity.type || null,
      notes: activity.notes || null,
      owner_profile_entity: activity.owner_profile_entity || null,
    },
  }));
}

module.exports = {
  CALENDAR_EVENT_TYPES,
  CONCERT_SOURCE_ENABLED,
  parseCalendarDate,
  collectConcertCalendarEvents,
  collectCallCalendarEvents,
  collectActivityCalendarEvents,
};
