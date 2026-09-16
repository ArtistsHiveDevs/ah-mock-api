const mongoose = require("mongoose");
const { Schema } = mongoose;

// Snapshot del usuario que dispara el evento. Es un sub-documento plano (no ref) a propósito:
// igual que en User.roles[].entityRoleMap[], queremos que un evento siga siendo legible/consistente
// aunque el usuario cambie de nombre/username después, y que no dependa de populate para reportes.
// Queda undefined por completo cuando no hay sesión iniciada (búsqueda/consulta anónima).
const AnalyticsUserSnapshotSchema = new Schema(
  {
    id: String,
    sID: String,
    identifier: String,
    currentProfileId: String,
    currentProfileEntityType: String,
  },
  { _id: false },
);

const schema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },

    user: { type: AnalyticsUserSnapshotSchema, default: undefined },

    // 'search' | 'profile' | 'document' | 'open_call' | 'event' | ... (ver ANALYTICS_RESOURCE_TYPES)
    resourceType: { type: String, required: true },

    resource: {
      entityType: String, // 'Artist' | 'Place' | 'OpenCall' | 'Event' | ...
      entityId: String, // sID/id del recurso puntual consultado (perfil, doc, open call, evento...)
      identifier: String,
      query: String, // texto de búsqueda, si aplica
      filters: Schema.Types.Mixed, // filtros/parámetros adicionales (activity, entityType, geo, etc.)
    },

    resultCount: Number, // cuántos resultados devolvió/si encontró el recurso (útil para detectar 0 resultados)
    durationMs: Number, // cuánto tardó resolver la consulta

    environment: String, // dev/uat/prod
    lang: String,
    ip: String,
    userAgent: String,
    referrer: String,
  },
  {
    timestamps: false, // ya tenemos `timestamp` propio
  },
);

schema.index({ resourceType: 1, timestamp: -1 });
schema.index({ "user.id": 1, timestamp: -1 });
schema.index({
  "resource.entityType": 1,
  "resource.entityId": 1,
  timestamp: -1,
});

module.exports = { schema };
