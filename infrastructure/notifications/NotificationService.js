const EventEmitter = require("events");
const { getNotificationType } = require("./notificationTypes");
const {
  canSendThroughChannel,
  areNotificationsEnabled,
  NOTIFICATION_CONFIG,
} = require("./notificationConfig");

/**
 * Servicio centralizado de notificaciones
 * Orquesta el envío de notificaciones a través de múltiples canales
 */
class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map(); // Almacena los handlers de cada canal
    this.setupDefaultChannels();
  }

  /**
   * Registrar channels por defecto
   */
  setupDefaultChannels() {
    // Los channels se registrarán dinámicamente cuando se inicialicen
    // Ver notificationChannels/*.js
  }

  /**
   * Registrar un canal de notificación
   * @param {string} name - Nombre del canal (email, push, sms, websocket)
   * @param {Object} handler - Handler del canal con método send()
   */
  registerChannel(name, handler) {
    if (!handler || typeof handler.send !== "function") {
      throw new Error(`Channel handler for "${name}" must have a send() method`);
    }
    this.channels.set(name.toLowerCase(), handler);
    console.log(`[NotificationService] ✅ Canal registrado: ${name}`);
  }

  /**
   * Método principal: enviar notificación
   * @param {Object} options
   * @param {string} options.type - Tipo de notificación (key del NOTIFICATION_TYPES)
   * @param {Object} options.recipient - Información del destinatario
   * @param {string} options.recipient.id - ID del usuario
   * @param {string} options.recipient.email - Email (opcional según canal)
   * @param {string} options.recipient.phoneNumber - Teléfono (opcional para SMS)
   * @param {string} options.recipient.pushToken - Token de push (opcional)
   * @param {Object} options.data - Datos específicos para el template
   * @param {Object} options.override - Override de configuración (opcional)
   * @param {Object} options.override.channels - { email: true/false, ... }
   */
  async send({ type, recipient, data, override = {} }) {
    try {
      // 1. Verificar si las notificaciones están habilitadas globalmente
      if (!areNotificationsEnabled()) {
        console.log(
          "[NotificationService] ⚠️ Notificaciones deshabilitadas globalmente"
        );
        return { sent: false, reason: "notifications_disabled" };
      }

      // 2. Obtener configuración del tipo de notificación
      const notificationType = getNotificationType(type);
      if (!notificationType) {
        console.error(
          `[NotificationService] ❌ Tipo de notificación no encontrado: ${type}`
        );
        return { sent: false, reason: "invalid_notification_type" };
      }

      console.log(
        `[NotificationService] 📤 Procesando notificación: ${notificationType.name}`
      );

      // 3. Determinar qué canales usar
      const channelsToUse = this.getChannelsToUse(
        notificationType,
        override.channels
      );

      if (channelsToUse.length === 0) {
        console.log(
          "[NotificationService] ⚠️ No hay canales habilitados para esta notificación"
        );
        return { sent: false, reason: "no_channels_enabled" };
      }

      // 4. Enviar por cada canal (asíncrono, no bloqueante)
      const results = {};

      for (const channel of channelsToUse) {
        // Ejecutar en background usando setImmediate
        setImmediate(async () => {
          try {
            await this.sendThroughChannel({
              channel,
              notificationType,
              recipient,
              data,
            });
          } catch (error) {
            console.error(
              `[NotificationService] ❌ Error en canal ${channel}:`,
              error
            );
          }
        });

        results[channel] = "queued";
      }

      return {
        sent: true,
        type: notificationType.key,
        channels: results,
      };
    } catch (error) {
      console.error("[NotificationService] ❌ Error general:", error);
      return { sent: false, reason: "error", error: error.message };
    }
  }

  /**
   * Determinar qué canales usar basado en configuración
   */
  getChannelsToUse(notificationType, override = {}) {
    const channels = [];

    for (const [channel, enabledInType] of Object.entries(
      notificationType.channels
    )) {
      // 1. Verificar si hay override
      const overridden = override[channel];
      if (overridden !== undefined) {
        if (overridden === true) {
          channels.push(channel);
        }
        continue;
      }

      // 2. Verificar configuración normal (global + tipo)
      if (canSendThroughChannel(channel, notificationType)) {
        channels.push(channel);
      }
    }

    return channels;
  }

  /**
   * Enviar notificación a través de un canal específico
   */
  async sendThroughChannel({ channel, notificationType, recipient, data }) {
    const handler = this.channels.get(channel.toLowerCase());

    if (!handler) {
      console.warn(
        `[NotificationService] ⚠️ Handler no registrado para canal: ${channel}`
      );
      return;
    }

    console.log(
      `[NotificationService] 📨 Enviando por ${channel}: ${notificationType.name}`
    );

    try {
      await handler.send({
        type: notificationType,
        recipient,
        data,
      });

      // Emitir evento de éxito
      this.emit("notification:sent", {
        channel,
        type: notificationType.key,
        recipient: recipient.id,
      });
    } catch (error) {
      // Emitir evento de error
      this.emit("notification:error", {
        channel,
        type: notificationType.key,
        recipient: recipient.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Método de conveniencia: enviar email de prueba
   */
  async sendTestEmail(to, subject = "Test Email") {
    return this.send({
      type: "system.test",
      recipient: {
        id: "test-user",
        email: to,
      },
      data: {
        subject,
        message: "Este es un email de prueba del sistema de notificaciones.",
      },
      override: {
        channels: {
          email: true,
          push: false,
          sms: false,
          websocket: false,
        },
      },
    });
  }
}

// Exportar instancia singleton
const notificationService = new NotificationService();

module.exports = notificationService;
