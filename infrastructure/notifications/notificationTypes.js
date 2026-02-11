/**
 * Tipos de notificaciones soportadas en el sistema
 * Cada tipo define qué canales están habilitados y qué template usar
 *
 * NOTA: Estos son flags específicos por tipo. Para habilitar/deshabilitar
 * canales globalmente, ver notificationConfig.js
 */

const NOTIFICATION_TYPES = {
  // ============= PREBOOKING =============
  PREBOOKING_CREATED: {
    key: "prebooking.created",
    name: "Nuevo Prebooking Creado",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "high", // low, normal, high
    template: "prebooking_created", // nombre del template a usar
  },

  PREBOOKING_ACCEPTED: {
    key: "prebooking.accepted",
    name: "Prebooking Aceptado",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "high",
    template: "prebooking_response",
  },

  PREBOOKING_REJECTED: {
    key: "prebooking.rejected",
    name: "Prebooking Rechazado",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "prebooking_response",
  },

  PREBOOKING_VIEWED: {
    key: "prebooking.viewed",
    name: "Prebooking Visto",
    channels: {
      email: false, // No enviamos email solo por ver
      push: false,
      sms: false,
      websocket: true, // Solo update en tiempo real
    },
    priority: "low",
    template: "prebooking_response",
  },

  PREBOOKING_CANCELLED: {
    key: "prebooking.cancelled",
    name: "Prebooking Cancelado",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "prebooking_cancelled",
  },

  // ============= BOOKING (futuro) =============
  BOOKING_CONFIRMED: {
    key: "booking.confirmed",
    name: "Booking Confirmado",
    channels: {
      email: true,
      push: true,
      sms: true, // SMS para confirmaciones importantes
      websocket: true,
    },
    priority: "high",
    template: "booking_confirmed",
  },

  BOOKING_REMINDER: {
    key: "booking.reminder",
    name: "Recordatorio de Booking",
    channels: {
      email: true,
      push: true,
      sms: true,
      websocket: false, // No necesario en websocket
    },
    priority: "normal",
    template: "booking_reminder",
  },

  // ============= FOLLOW/SOCIAL =============
  NEW_FOLLOWER: {
    key: "social.new_follower",
    name: "Nuevo Seguidor",
    channels: {
      email: false, // Muy frecuente, no enviar email
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "low",
    template: "new_follower",
  },

  // ============= CHAT/MESSAGES =============
  NEW_MESSAGE: {
    key: "chat.new_message",
    name: "Nuevo Mensaje",
    channels: {
      email: false, // No email por cada mensaje
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "new_message",
  },

  // ============= EVENTOS =============
  EVENT_CREATED: {
    key: "event.created",
    name: "Evento Creado",
    channels: {
      email: false,
      push: false,
      sms: false,
      websocket: true,
    },
    priority: "low",
    template: "event_created",
  },

  EVENT_UPDATED: {
    key: "event.updated",
    name: "Evento Actualizado",
    channels: {
      email: false,
      push: true, // Notificar a seguidores
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "event_updated",
  },

  // ============= USUARIO =============
  USER_WELCOME: {
    key: "user.welcome",
    name: "Bienvenida de Usuario",
    channels: {
      email: true,
      push: false,
      sms: false,
      websocket: false,
    },
    priority: "normal",
    template: "user_welcome",
  },

  USER_PROFILE_ASSIGNED: {
    key: "user.profileAssignment.assigned",
    name: "Usuario Asignado a Perfil",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "user_profile_assigned",
  },

  USER_PROFILE_ROLE_UPDATED: {
    key: "user.profileAssignment.roleUpdated",
    name: "Rol de Usuario Actualizado",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "user_profile_role_updated",
  },

  USER_PROFILE_REMOVED: {
    key: "user.profileAssignment.removed",
    name: "Usuario Removido de Perfil",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "user_profile_removed",
  },

  USER_PROFILE_INVITATION: {
    key: "user.profileAssignment.invitation",
    name: "Invitación a Perfil",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "high",
    template: "user_profile_invitation",
  },

  USER_PROFILE_INVITATION_ACCEPTED: {
    key: "user.profileAssignment.invitationAccepted",
    name: "Invitación Aceptada",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "user_profile_invitation_accepted",
  },

  USER_PROFILE_INVITATION_DECLINED: {
    key: "user.profileAssignment.invitationDeclined",
    name: "Invitación Rechazada",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "normal",
    template: "user_profile_invitation_declined",
  },

  // ============= SISTEMA =============
  TEST_NOTIFICATION: {
    key: "system.test",
    name: "Notificación de Prueba",
    channels: {
      email: true,
      push: true,
      sms: false,
      websocket: true,
    },
    priority: "low",
    template: "test",
  },
};

/**
 * Obtener configuración de un tipo de notificación
 * @param {string} key - Clave del tipo (ej: "prebooking.created")
 * @returns {Object|null} Configuración del tipo o null si no existe
 */
function getNotificationType(key) {
  return (
    Object.values(NOTIFICATION_TYPES).find((type) => type.key === key) || null
  );
}

/**
 * Verificar si un canal está habilitado para un tipo de notificación específico
 * NOTA: Esto solo verifica la configuración del tipo, NO verifica flags globales
 * Para verificación completa usar canSendThroughChannel de notificationConfig.js
 * @param {string} typeKey - Clave del tipo de notificación
 * @param {string} channel - Canal a verificar (email, push, sms, websocket)
 * @returns {boolean}
 */
function isChannelEnabledForType(typeKey, channel) {
  const type = getNotificationType(typeKey);
  return type ? type.channels[channel] === true : false;
}

/**
 * Obtener todos los tipos de notificación
 * @returns {Object}
 */
function getAllNotificationTypes() {
  return NOTIFICATION_TYPES;
}

module.exports = {
  NOTIFICATION_TYPES,
  getNotificationType,
  isChannelEnabledForType,
  getAllNotificationTypes,
};
