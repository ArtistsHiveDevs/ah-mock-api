const express = require("express");

const {
  validateEnvironment,
  validateAuthenticatedUser,
} = require("../../../helpers");
const {
  createAPIErrorResponse,
} = require("../../../helpers/apiHelperFunctions");
const {
  collectorsByCalendarEventType,
  parseCalendarDate,
} = require("../../../helpers/calendarCollectors");
const ErrorCodes = require("../../../constants/errors");
const routesConstants = require("./constants/routes.constants");

const allEventsRouter = express.Router();

class InvalidCalendarRangeError extends Error {}

function resolveDefaultCalendarRange() {
  const now = new Date();

  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    to: new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999),
  };
}

function resolveCalendarRange({ from, to }) {
  const defaultRange = resolveDefaultCalendarRange();

  const rangeStart = from ? parseCalendarDate(from) : defaultRange.from;
  const rangeEnd = to ? parseCalendarDate(to) : defaultRange.to;

  if (!rangeStart || !rangeEnd) {
    throw new InvalidCalendarRangeError(
      "Query params 'from' and 'to' must be valid ISO dates.",
    );
  }

  return { from: rangeStart, to: rangeEnd };
}

function resolveRequestedTypes(types) {
  if (!types) {
    return Object.keys(collectorsByCalendarEventType);
  }

  return String(types)
    .split(",")
    .map((type) => type.trim())
    .filter((type) => !!collectorsByCalendarEventType[type]);
}

async function collectCalendarEvents({ requestedTypes, req, from, to }) {
  const collectorResults = await Promise.allSettled(
    requestedTypes.map((type) =>
      collectorsByCalendarEventType[type]({ req, from, to }),
    ),
  );

  return collectorResults.flatMap((collectorResult, index) => {
    if (collectorResult.status === "rejected") {
      console.error(
        `[all_events] Collector '${requestedTypes[index]}' failed:`,
        collectorResult.reason?.message,
      );
      return [];
    }

    return collectorResult.value;
  });
}

allEventsRouter.get(
  routesConstants.allEvents,
  validateEnvironment,
  validateAuthenticatedUser,
  async (req, res) => {
    try {
      const { from, to } = resolveCalendarRange(req.query);
      const requestedTypes = resolveRequestedTypes(req.query.types);

      const calendarEvents = await collectCalendarEvents({
        requestedTypes,
        req,
        from,
        to,
      });

      calendarEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

      res.json({ data: calendarEvents });
    } catch (err) {
      if (err instanceof InvalidCalendarRangeError) {
        return res
          .status(400)
          .json(
            createAPIErrorResponse(err.message, ErrorCodes.VALIDATION_ERROR),
          );
      }

      console.error("[all_events] Error:", err);
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = allEventsRouter;
