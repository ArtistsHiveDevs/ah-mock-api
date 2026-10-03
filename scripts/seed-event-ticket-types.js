const mongoose = require("mongoose");
require("dotenv").config();

const { schema: EventSchema } = require("../models/domain/Event.schema");
const {
  schema: EventTicketTypeSchema,
} = require("../models/domain/EventTicketType.schema");

const DEFAULT_TICKET_TYPES = [
  { name: "Preventa", price: 20000, currency: "COP", order: 1 },
  { name: "Taquilla", price: 25000, currency: "COP", order: 2 },
];

const envArg = process.argv.find((arg) => arg.startsWith("--env="));
const targetEnv = envArg ? envArg.split("=")[1] : "dev";
const eventIdentifier = process.argv
  .slice(2)
  .find((arg) => !arg.startsWith("--"));

const MONGO_URI_BY_ENV = {
  dev: process.env.MONGO_URI_DEV,
  uat: process.env.MONGO_URI_UAT,
  prod: process.env.MONGO_URI_PROD,
};

async function findEvent(EventModel) {
  if (mongoose.Types.ObjectId.isValid(eventIdentifier)) {
    const eventById = await EventModel.findById(eventIdentifier);
    if (eventById) {
      return eventById;
    }
  }

  return EventModel.findOne({ sID: eventIdentifier });
}

async function seed() {
  if (!eventIdentifier) {
    console.error(
      "❌ Falta el identificador del evento. Uso: node scripts/seed-event-ticket-types.js <eventSIDoId> [--env=dev]",
    );
    process.exit(1);
  }

  const mongoUri = MONGO_URI_BY_ENV[targetEnv];
  if (!mongoUri) {
    console.error(`❌ No se encontró MONGO_URI para env="${targetEnv}" en .env`);
    process.exit(1);
  }

  console.log(`🔄 Conectando a MongoDB (${targetEnv})...`);
  const connection = await mongoose.createConnection(mongoUri, {
    serverSelectionTimeoutMS: 30000,
  });
  console.log("✅ Conectado a MongoDB");

  const Event = connection.model("Event", EventSchema);
  const EventTicketType = connection.model(
    "EventTicketType",
    EventTicketTypeSchema,
  );

  try {
    const event = await findEvent(Event);

    if (!event) {
      console.error(`❌ Evento no encontrado: ${eventIdentifier}`);
      process.exitCode = 1;
      return;
    }

    console.log(
      `\n📋 Evento "${event.name || event.sID}" (id=${event._id}, sID=${event.sID})`,
    );

    let created = 0;
    let skipped = 0;

    for (const ticketType of DEFAULT_TICKET_TYPES) {
      const existing = await EventTicketType.findOne({
        event_id: event._id,
        name: ticketType.name,
      });

      if (existing) {
        console.log(
          `  ↷ "${ticketType.name}" ya existe (id=${existing._id}), se omite`,
        );
        skipped++;
        continue;
      }

      const saved = await EventTicketType.create({
        ...ticketType,
        event_id: event._id,
      });
      console.log(
        `  → "${saved.name}" creado (id=${saved._id}, precio=${saved.price} ${saved.currency})`,
      );
      created++;
    }

    console.log(
      `\n✅ ${created} tipo(s) de boleta creado(s), ${skipped} ya existía(n).`,
    );
  } finally {
    await connection.close();
    console.log("\n🔌 Desconectado de MongoDB");
  }
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
