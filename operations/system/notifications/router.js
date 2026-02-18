const express = require("express");
const notificationService = require("../../../infrastructure/notifications");
const { validateEnvironment, validateAuthenticatedUser } = require("../../../helpers");

const router = express.Router();

/**
 * POST /api/notifications/test
 * Endpoint para probar el sistema de notificaciones
 * Envía un email de prueba
 */
router.post(
  "/test",
  validateEnvironment,
  validateAuthenticatedUser,
  async (req, res) => {
    try {
      const { to, subject } = req.body;

      if (!to) {
        return res.status(400).json({
          success: false,
          message: "Email 'to' is required",
        });
      }

      const result = await notificationService.sendTestEmail(
        to,
        subject || "Test Email from Artists Hive"
      );

      return res.json({
        success: true,
        message: "Test notification sent",
        result,
      });
    } catch (error) {
      console.error("[Notifications API] Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/notifications/send
 * Endpoint genérico para enviar notificaciones
 */
router.post(
  "/send",
  validateEnvironment,
  validateAuthenticatedUser,
  async (req, res) => {
    try {
      const { type, recipient, data, override } = req.body;

      if (!type || !recipient) {
        return res.status(400).json({
          success: false,
          message: "Type and recipient are required",
        });
      }

      const result = await notificationService.send({
        type,
        recipient,
        data: data || {},
        override: override || {},
      });

      return res.json({
        success: result.sent,
        message: result.sent
          ? "Notification sent successfully"
          : `Failed to send: ${result.reason}`,
        result,
      });
    } catch (error) {
      console.error("[Notifications API] Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/notifications/types
 * Obtener lista de tipos de notificaciones disponibles
 */
router.get("/types", validateEnvironment, (req, res) => {
  const { getAllNotificationTypes } = require("../../../infrastructure/notifications/notificationTypes");
  const types = getAllNotificationTypes();

  return res.json({
    success: true,
    types: Object.values(types).map((t) => ({
      key: t.key,
      name: t.name,
      channels: t.channels,
      priority: t.priority,
    })),
  });
});

/**
 * GET /api/notifications/config
 * Obtener configuración actual del sistema
 */
router.get(
  "/config",
  validateEnvironment,
  validateAuthenticatedUser,
  (req, res) => {
    const {
      NOTIFICATION_CONFIG,
      areNotificationsEnabled,
    } = require("../../../infrastructure/notifications/notificationConfig");

    return res.json({
      success: true,
      config: {
        enabled: areNotificationsEnabled(),
        channels: {
          email: NOTIFICATION_CONFIG.CHANNELS.EMAIL.enabled,
          push: NOTIFICATION_CONFIG.CHANNELS.PUSH.enabled,
          sms: NOTIFICATION_CONFIG.CHANNELS.SMS.enabled,
          websocket: NOTIFICATION_CONFIG.CHANNELS.WEBSOCKET.enabled,
        },
        rateLimit: NOTIFICATION_CONFIG.RATE_LIMIT,
        queue: {
          enabled: NOTIFICATION_CONFIG.QUEUE.enabled,
          type: NOTIFICATION_CONFIG.QUEUE.type,
        },
      },
    });
  }
);

module.exports = router;
