/**
 * Configuración global del sistema de notificaciones
 * Define flags maestros para habilitar/deshabilitar todo el sistema
 * o canales específicos independientemente de la configuración por tipo
 */

const NOTIFICATION_CONFIG = {
  // Flag maestro: si está en false, NO se envía ninguna notificación
  ENABLED: process.env.NOTIFICATIONS_ENABLED !== "false", // true por defecto

  // Flags por canal: permiten desactivar un canal completo
  CHANNELS: {
    EMAIL: {
      enabled: process.env.NOTIFICATIONS_EMAIL_ENABLED !== "false",
      // Configuración específica de email
      from: process.env.EMAIL_FROM || "noreply@artists-hive.com",
      replyTo: process.env.EMAIL_REPLY_TO || null,
    },

    PUSH: {
      enabled: process.env.NOTIFICATIONS_PUSH_ENABLED !== "false",
      // Configuración específica de push (AWS SNS, Firebase, etc.)
      provider: process.env.PUSH_PROVIDER || "sns", // 'sns' | 'firebase'
    },

    SMS: {
      enabled: process.env.NOTIFICATIONS_SMS_ENABLED === "true", // false por defecto (costoso)
      // Configuración de SMS
      provider: process.env.SMS_PROVIDER || "sns", // 'sns' | 'twilio'
    },

    WEBSOCKET: {
      enabled: process.env.NOTIFICATIONS_WEBSOCKET_ENABLED !== "false",
      // Configuración de WebSocket
      port: process.env.WEBSOCKET_PORT || null, // null = mismo puerto que HTTP
    },
  },

  // Configuración de rate limiting (evitar spam)
  RATE_LIMIT: {
    enabled: process.env.NOTIFICATIONS_RATE_LIMIT_ENABLED !== "false",
    // Máximo de notificaciones del mismo tipo por usuario en el periodo
    maxPerType: parseInt(process.env.NOTIFICATIONS_MAX_PER_TYPE) || 5,
    // Periodo de tiempo en milisegundos (default: 1 hora)
    windowMs: parseInt(process.env.NOTIFICATIONS_RATE_LIMIT_WINDOW) || 3600000,
  },

  // Configuración de cola/queue
  QUEUE: {
    enabled: process.env.NOTIFICATIONS_QUEUE_ENABLED !== "false",
    // Tipo de cola: 'memory' (en memoria) o 'sqs' (AWS SQS)
    type: process.env.NOTIFICATIONS_QUEUE_TYPE || "memory",
    // Configuración de reintentos
    retries: parseInt(process.env.NOTIFICATIONS_QUEUE_RETRIES) || 3,
    // Delay entre reintentos en ms
    retryDelay: parseInt(process.env.NOTIFICATIONS_RETRY_DELAY) || 5000,
  },

  // Configuración de logging
  LOGGING: {
    enabled: process.env.NOTIFICATIONS_LOGGING_ENABLED !== "false",
    // Guardar historial de notificaciones en DB
    persistHistory: process.env.NOTIFICATIONS_PERSIST_HISTORY === "true",
    // Nivel de detalle: 'minimal' | 'normal' | 'verbose'
    level: process.env.NOTIFICATIONS_LOG_LEVEL || "normal",
  },
};

/**
 * Verificar si las notificaciones están habilitadas globalmente
 * @returns {boolean}
 */
function areNotificationsEnabled() {
  return NOTIFICATION_CONFIG.ENABLED === true;
}

/**
 * Verificar si un canal específico está habilitado globalmente
 * @param {string} channel - 'EMAIL' | 'PUSH' | 'SMS' | 'WEBSOCKET'
 * @returns {boolean}
 */
function isChannelEnabledGlobally(channel) {
  const channelUpper = channel.toUpperCase();
  return (
    areNotificationsEnabled() &&
    NOTIFICATION_CONFIG.CHANNELS[channelUpper]?.enabled === true
  );
}

/**
 * Verificar si se puede enviar una notificación por un canal
 * Combina la verificación global + específica del tipo
 * @param {string} channel - 'email' | 'push' | 'sms' | 'websocket'
 * @param {Object} notificationType - Objeto de configuración del tipo de notificación
 * @returns {boolean}
 */
function canSendThroughChannel(channel, notificationType) {
  // 1. Verificar flag maestro
  if (!areNotificationsEnabled()) {
    return false;
  }

  // 2. Verificar canal globalmente
  if (!isChannelEnabledGlobally(channel)) {
    return false;
  }

  // 3. Verificar si el tipo de notificación tiene habilitado este canal
  if (!notificationType.channels[channel]) {
    return false;
  }

  return true;
}

/**
 * Obtener configuración de un canal
 * @param {string} channel - 'EMAIL' | 'PUSH' | 'SMS' | 'WEBSOCKET'
 * @returns {Object|null}
 */
function getChannelConfig(channel) {
  const channelUpper = channel.toUpperCase();
  return NOTIFICATION_CONFIG.CHANNELS[channelUpper] || null;
}

module.exports = {
  NOTIFICATION_CONFIG,
  areNotificationsEnabled,
  isChannelEnabledGlobally,
  canSendThroughChannel,
  getChannelConfig,
};
