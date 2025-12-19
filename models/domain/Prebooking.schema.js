const mongoose = require("mongoose");
const { Schema } = mongoose;
const { normalizeProfileId } = require("../appbase/EntityDirectory");

// ============================================================================
// ENUMS (Referencia TypeScript)
// ============================================================================
/*
export enum PreBookingRequestStatus {
  DRAFT = 'DRAFT',                       // Borrador no enviado
  PENDING = 'PENDING',                   // Enviada, esperando respuestas (requester NO cuenta)
  PARTIALLY_VIEWED = 'PARTIALLY_VIEWED', // Algunos la vieron (sin contar requester)
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED', // Algunos aceptaron (sin contar requester)
  ALL_ACCEPTED = 'ALL_ACCEPTED',         // Cumple mínimo: 1 de cada tipo
  REJECTED = 'REJECTED',                 // Todos de al menos un tipo rechazaron
  CANCELLED = 'CANCELLED',               // Cancelada por solicitante
  CONVERTED = 'CONVERTED',               // Convertida en evento
  EXPIRED = 'EXPIRED'                    // Expiró response_deadline (90 días default)
}

export enum ApprovalStatus {
  ALL_PENDING = 'ALL_PENDING',           // Nadie ha respondido (excepto requester)
  PARTIAL = 'PARTIAL',                   // Algunos aceptaron (sin contar requester)
  ALL_APPROVED = 'ALL_APPROVED',         // Al menos 1 de cada tipo aceptó
  REJECTED = 'REJECTED'                  // TODOS de un tipo rechazaron
}

export enum ParticipantStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export type RequestType = 'single_date' | 'date_range' | 'week' | 'month' | 'quarter';
*/

// ============================================================================
// SUBSCHEMAS
// ============================================================================

/**
 * Date Range Schema
 * Rango de fechas con hora y minuto
 * Usado para fechas alternativas con prioridad
 */
const DateRangeSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true }, // Incluye fecha, hora y minuto
    end: { type: Date, required: true }, // Incluye fecha, hora y minuto
    priority: { type: Number, required: true }, // 1 = preferida, 2 = alternativa, etc.
  },
  { _id: false }
);

/**
 * Participant Approval Status Schema
 * Estado de aprobación por participante individual
 */
const ParticipantApprovalStatusSchema = new mongoose.Schema(
  {
    participant_profile_id: {
      type: Schema.Types.ObjectId,
      ref: "EntityDirectory",
      required: true,
    }, // ID normalizado en pre-save
    participant_user_id: { type: String, required: true },
    // participant_type: { type: String, required: true }, // 'artist' | 'place' | 'booker' | etc.
    status: {
      type: String,
      enum: ["pending", "viewed", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
    responded_at: { type: Date, default: Date.now },
    response_notes: { type: String },
  },
  { _id: false }
);

/**
 * Participant Note Schema
 * Nota/comentario de un participante
 */
const ParticipantNoteSchema = new mongoose.Schema(
  {
    author_user_id: { type: String, required: true },
    author_profile_id: { type: String, required: true },
    author_name: { type: String, required: true },
    note: { type: String, required: true },
    created_at: { type: Date, default: Date.now, required: true },
    is_private: { type: Boolean, default: false }, // Solo visible para el autor
  },
  { _id: false }
);

// ============================================================================
// SCHEMA PRINCIPAL - PREBOOKING
// ============================================================================

const schema = new Schema(
  {
    // ========================================================================
    // PARTICIPANTES (Multi-party support)
    // ========================================================================

    // Quien inicia la solicitud (puede ser artist, place, booker, etc.)
    requester_profile_id: {
      type: Schema.Types.ObjectId,
      ref: "EntityDirectory",
      required: true,
    }, // ID normalizado en pre-save
    requester_user_id: { type: String, required: true }, // ID para queries rápidos

    // A quienes se solicita (puede ser múltiple: venue + varios artists)
    recipient_ids: [{ type: Schema.Types.ObjectId, ref: "EntityDirectory" }], // IDs normalizados en pre-save

    // Estado de aprobación por participante
    participant_approvals: [ParticipantApprovalStatusSchema],

    // ========================================================================
    // DETALLES TEMPORALES (con hora y minuto)
    // ========================================================================

    requested_date_start: { type: Date, required: true }, // Fecha Y HORA inicio (ej: 2025-01-15 20:00)
    requested_date_end: { type: Date, required: true }, // Fecha Y HORA fin (ej: 2025-01-15 23:30)

    request_type: {
      type: String,
      enum: ["single_date", "date_range", "week", "month", "quarter"],
      required: true,
    },

    flexible_dates: { type: Boolean, default: false }, // ¿Acepta fechas alternativas?
    alternative_dates: [DateRangeSchema], // Rangos alternativos si flexible (también con hora)

    // ========================================================================
    // DETALLES BÁSICOS
    // ========================================================================

    event_name: { type: String, required: true }, // Nombre tentativo
    description: { type: String }, // Descripción breve

    // ========================================================================
    // ESTADO
    // ========================================================================

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "PARTIALLY_VIEWED",
        "PARTIALLY_ACCEPTED",
        "ALL_ACCEPTED",
        "REJECTED",
        "CANCELLED",
        "CONVERTED",
        "EXPIRED",
      ],
      default: "PENDING",
      required: true,
    },

    overall_approval_status: {
      type: String,
      enum: ["ALL_PENDING", "PARTIAL", "ALL_APPROVED", "REJECTED"],
      default: "ALL_PENDING",
      required: true,
    },

    // Notas por participante
    notes: [ParticipantNoteSchema], // Cada uno puede agregar notas

    // ========================================================================
    // METADATA
    // ========================================================================

    // created_by: { type: String, required: true }, // user_id del creador
    event_id: { type: String }, // Si se convierte en evento
    response_deadline: { type: Date, required: true }, // Plazo para responder (DEFAULT: +90 días)
    last_viewed_by: { type: Map, of: Date }, // Tracking de vistas por user
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// ============================================================================
// ÍNDICES
// ============================================================================

schema.index({ requester_profile_id: 1, status: 1 });
schema.index({ recipient_ids: 1, status: 1 });
schema.index({ created_by: 1 });
schema.index({ requested_date_start: 1 });
schema.index({ status: 1, createdAt: -1 });
schema.index({ event_id: 1 });

// ============================================================================
// VIRTUALS
// ============================================================================

/**
 * Virtual para verificar si el prebooking está vencido
 */
schema.virtual("isExpired").get(function () {
  if (
    this.status === "CONVERTED" ||
    this.status === "CANCELLED" ||
    this.status === "EXPIRED"
  ) {
    return false;
  }
  const now = new Date();
  return this.response_deadline < now;
});

/**
 * Virtual para obtener el tiempo restante hasta el evento
 */
schema.virtual("daysUntilEvent").get(function () {
  const now = new Date();
  const start = new Date(this.requested_date_start);
  const diffTime = start - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

/**
 * Virtual para obtener días restantes para responder
 */
schema.virtual("daysUntilDeadline").get(function () {
  const now = new Date();
  const deadline = new Date(this.response_deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

/**
 * Virtual para verificar si todos los participantes han visto la solicitud
 */
schema.virtual("allParticipantsViewed").get(function () {
  if (!this.participant_approvals || this.participant_approvals.length === 0) {
    return false;
  }
  return this.participant_approvals.every(
    (approval) => approval.status !== "pending"
  );
});

/**
 * Virtual para obtener el conteo de aprobaciones
 */
schema.virtual("approvalCounts").get(function () {
  if (!this.participant_approvals) {
    return { pending: 0, viewed: 0, accepted: 0, rejected: 0 };
  }

  return this.participant_approvals.reduce(
    (counts, approval) => {
      counts[approval.status] = (counts[approval.status] || 0) + 1;
      return counts;
    },
    { pending: 0, viewed: 0, accepted: 0, rejected: 0 }
  );
});

/**
 * Virtual para populate del requester
 */
schema.virtual("requester", {
  ref: "EntityDirectory",
  localField: "requester_profile_id",
  foreignField: "_id",
  justOne: true,
});

/**
 * Virtual para populate de recipients
 */
schema.virtual("recipients", {
  ref: "EntityDirectory",
  localField: "recipient_ids",
  foreignField: "_id",
  justOne: false,
});

// ============================================================================
// STATICS (métodos estáticos del modelo)
// ============================================================================

/**
 * Pre-procesa los datos ANTES de la construcción del documento
 * Normaliza los profile_ids para que Mongoose pueda validarlos correctamente
 * También asegura que el requester tenga un approval automático en "accepted"
 */
schema.statics.preConstruct = async function (connection, ownerUser, data) {
  data.requester_user_id = ownerUser._id;

  data.requester_profile_id = ownerUser.currentProfileIdentifier;
  // PASO 1: Normalizar requester_profile_id
  // if (
  //   data.requester_profile_id &&
  //   !mongoose.Types.ObjectId.isValid(data.requester_profile_id)
  // ) {
  const requesterNormalization = await normalizeProfileId(
    data.requester_profile_id,
    connection
  );

  data.requester_profile_id = requesterNormalization._id;
  // }

  // PASO 2: Normalizar recipient_ids
  if (data.recipient_ids && Array.isArray(data.recipient_ids)) {
    data.recipient_ids = await Promise.all(
      data.recipient_ids.map((id) => normalizeProfileId(id, connection))
    );
  }

  // PASO 3: Inicializar participant_approvals si no existe
  if (!data.participant_approvals) {
    data.participant_approvals = [];
  }

  // PASO 4: Normalizar participant_approvals[].participant_profile_id
  if (Array.isArray(data.participant_approvals)) {
    for (const approval of data.participant_approvals) {
      if (approval.participant_profile_id) {
        approval.participant_profile_id = await normalizeProfileId(
          approval.participant_profile_id,
          connection
        );
      }
    }
  }

  // PASO 5: Asegurar que el requester tenga un approval automático en "accepted"
  const requesterApproval = data.participant_approvals.find(
    (approval) =>
      approval.participant_profile_id?.toString() ===
      data.requester_profile_id?.toString()
  );

  if (!requesterApproval) {
    // Agregar el requester con status "accepted" automáticamente
    data.participant_approvals.push({
      participant_profile_id: requesterNormalization.entity_id,
      // participant_profile_id: ownerUser.currentProfileIdentifier,

      participant_user_id: data.requester_user_id,
      status: "accepted",
      responded_at: new Date(),
      response_notes: "Automatic approval (requester)",
    });
  } else {
    // Si ya existe, forzar status a "accepted"
    requesterApproval.status = "accepted";
    requesterApproval.response_notes =
      requesterApproval.response_notes || "Automatic approval (requester)";
  }
};

// ============================================================================
// MÉTODOS
// ============================================================================

/**
 * Método para actualizar el estado de aprobación de un participante
 */
schema.methods.updateParticipantStatus = function (
  participantId,
  newStatus,
  responseNotes
) {
  const approval = this.participant_approvals.find(
    (a) => a.participant_id === participantId
  );

  if (approval) {
    approval.status = newStatus;
    approval.responded_at = new Date();
    if (responseNotes) {
      approval.response_notes = responseNotes;
    }
  }

  return this.save();
};

/**
 * Método para agregar una nota
 */
schema.methods.addNote = function (
  authorUserId,
  authorProfileId,
  authorName,
  noteText,
  isPrivate = false
) {
  this.notes.push({
    author_user_id: authorUserId,
    author_profile_id: authorProfileId,
    author_name: authorName,
    note: noteText,
    created_at: new Date(),
    is_private: isPrivate,
  });

  return this.save();
};

/**
 * Método para marcar como vista por un usuario
 */
schema.methods.markAsViewedBy = function (userId) {
  if (!this.last_viewed_by) {
    this.last_viewed_by = new Map();
  }
  this.last_viewed_by.set(userId, new Date());

  return this.save();
};

// Incluye los virtuals en los resultados JSON
schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = { schema };
