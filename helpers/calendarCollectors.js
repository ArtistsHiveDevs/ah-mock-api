const Holidays = require("date-holidays");

const { getModel } = require("./getModel");
const { resolveActiveProfile } = require("./calendarActivityOwnership");
const {
  CALENDAR_ACTIVITY_TYPES,
} = require("../models/domain/CalendarActivity.schema");

const HOLIDAY_CALENDAR_TYPE = "holiday";
const HOLIDAY_COUNTRY = "CO";

const CALENDAR_EVENT_TYPES = [
  ...CALENDAR_ACTIVITY_TYPES,
  HOLIDAY_CALENDAR_TYPE,
];

const PUBLISHED_OPEN_CALL_STATUS = "OPEN";

const holidaysCalculator = new Holidays(HOLIDAY_COUNTRY);
const holidaysByYear = new Map();

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

function toDateOnly(date) {
  return date.toISOString().split("T")[0];
}

function hasTimeComponent(dateValue) {
  return typeof dateValue === "string" && /\d{2}:\d{2}/.test(dateValue);
}

function toCalendarDateValue(date, allDay) {
  return allDay ? toDateOnly(date) : date.toISOString();
}

function maskedId(document) {
  return document?.sID || document?._id?.toString() || null;
}

function overlapsRange({ start, end, from, to }) {
  return start <= to && (end || start) >= from;
}

async function collectActivityCalendarEvents({ req, from, to }) {
  const activeProfile = await resolveActiveProfile(req);

  if (!req.userId || !activeProfile) {
    return [];
  }

  const CalendarActivityModel = await getModel(
    req.serverEnvironment,
    "CalendarActivity",
  );

  const activities = await CalendarActivityModel.find({
    type: "activity",
    owner_profile_id: activeProfile.id,
    owner_profile_entity: activeProfile.entity,
    start: { $lte: to },
    $or: [{ end: { $gte: from } }, { end: null, start: { $gte: from } }],
  }).lean();

  return activities.map((activity) => ({
    id: maskedId(activity),
    type: "activity",
    subtype: activity.subtype || null,
    title: activity.title || null,
    start: toCalendarDateValue(activity.start, activity.allDay),
    end: activity.end
      ? toCalendarDateValue(activity.end, activity.allDay)
      : null,
    allDay: !!activity.allDay,
    status: null,
    entityId: activeProfile.sID || activeProfile.id.toString(),
    editable: true,
    meta: {
      notes: activity.notes || null,
      owner_profile_entity: activity.owner_profile_entity || null,
    },
  }));
}

async function collectOpenCallCalendarEvents({ req, from, to }) {
  const OpenCallModel = await getModel(req.serverEnvironment, "OpenCall");

  const openCalls = await OpenCallModel.find({
    status: PUBLISHED_OPEN_CALL_STATUS,
  })
    .select(
      "sID event_name end_date event_date status place_id city applications_count",
    )
    .populate({ path: "place_id", select: "sID" })
    .lean();

  const today = startOfDay(new Date());

  return openCalls.reduce((calendarEvents, openCall) => {
    const deadline = parseCalendarDate(openCall.end_date);

    const isOutOfRange = !deadline || deadline < from || deadline > to;

    if (isOutOfRange) {
      return calendarEvents;
    }

    const deadlineDate = toDateOnly(deadline);

    calendarEvents.push({
      id: maskedId(openCall),
      type: "opencall",
      subtype: null,
      title: openCall.event_name || null,
      start: deadlineDate,
      end: deadlineDate,
      allDay: true,
      status: openCall.status || null,
      entityId: maskedId(openCall.place_id),
      editable: false,
      meta: {
        city: openCall.city || null,
        event_date: openCall.event_date || null,
        applications_count: openCall.applications_count || 0,
        expired: deadline < today,
      },
    });

    return calendarEvents;
  }, []);
}

async function collectEventCalendarEvents({ req, from, to }) {
  const EventModel = await getModel(req.serverEnvironment, "Event");

  const events = await EventModel.find({})
    .select(
      "sID name subtitle profile_pic place timetable__initial_date timetable__end_date confirmation_status",
    )
    .populate({ path: "place", select: "sID name city" })
    .lean();

  return events.reduce((calendarEvents, event) => {
    const start = parseCalendarDate(
      event.timetable__initial_date || event.timetable__end_date,
    );
    const end = parseCalendarDate(event.timetable__end_date);

    if (!start || !overlapsRange({ start, end, from, to })) {
      return calendarEvents;
    }

    const allDay = !hasTimeComponent(
      event.timetable__initial_date || event.timetable__end_date,
    );

    calendarEvents.push({
      id: maskedId(event),
      type: "event",
      subtype: null,
      title: event.name || null,
      start: toCalendarDateValue(start, allDay),
      end: end ? toCalendarDateValue(end, allDay) : null,
      allDay,
      status: null,
      entityId: maskedId(event.place),
      editable: false,
      meta: {
        subtitle: event.subtitle || null,
        profile_pic: event.profile_pic || null,
        place_name: event.place?.name || null,
        city: event.place?.city || null,
        confirmation_status: event.confirmation_status ?? null,
      },
    });

    return calendarEvents;
  }, []);
}

function getHolidaysOfYear(year) {
  if (!holidaysByYear.has(year)) {
    holidaysByYear.set(year, holidaysCalculator.getHolidays(year) || []);
  }

  return holidaysByYear.get(year);
}

async function collectHolidayCalendarEvents({ from, to }) {
  const calendarEvents = [];

  for (let year = from.getFullYear(); year <= to.getFullYear(); year += 1) {
    getHolidaysOfYear(year).forEach((holiday) => {
      const start = parseCalendarDate(holiday.start);
      const end = parseCalendarDate(holiday.end);

      if (!start || start > to || (end || start) < from) {
        return;
      }

      const holidayDate = toDateOnly(start);

      calendarEvents.push({
        id: `${HOLIDAY_CALENDAR_TYPE}-${HOLIDAY_COUNTRY}-${holidayDate}`,
        type: HOLIDAY_CALENDAR_TYPE,
        subtype: holiday.type || null,
        title: holiday.name || null,
        start: holidayDate,
        end: holidayDate,
        allDay: true,
        status: null,
        entityId: null,
        editable: false,
        meta: {
          name: holiday.name || null,
          country: HOLIDAY_COUNTRY,
        },
      });
    });
  }

  return calendarEvents;
}

const collectorsByCalendarEventType = {
  activity: collectActivityCalendarEvents,
  opencall: collectOpenCallCalendarEvents,
  event: collectEventCalendarEvents,
  [HOLIDAY_CALENDAR_TYPE]: collectHolidayCalendarEvents,
};

module.exports = {
  CALENDAR_EVENT_TYPES,
  HOLIDAY_CALENDAR_TYPE,
  collectorsByCalendarEventType,
  parseCalendarDate,
  toDateOnly,
  collectActivityCalendarEvents,
  collectOpenCallCalendarEvents,
  collectEventCalendarEvents,
  collectHolidayCalendarEvents,
};
