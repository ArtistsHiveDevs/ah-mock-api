/**
 * Helper para enviar notificaciones relacionadas con usuarios
 */

const notificationService = require("../infrastructure/notifications");

// TEMPORAL: Email de prueba mientras se verifica el dominio en producción
const TEMP_TEST_EMAIL = process.env.TEMP_NOTIFICATION_EMAIL || "admiprogramacion@gmail.com";
const USE_TEST_EMAIL = process.env.USE_TEST_EMAIL === "true";

/**
 * Enviar notificación de bienvenida cuando se crea un usuario
 * @param {Object} user - El usuario creado
 */
async function notifyUserWelcome(user) {
  try {
    console.log("[UserNotifications] 📤 Iniciando notificación de bienvenida");
    console.log(`[UserNotifications] User ID: ${user._id}`);
    console.log(`[UserNotifications] User name: ${user.name}`);
    console.log(`[UserNotifications] User email: ${user.email || "N/A"}`);

    // Determinar el email a usar
    let emailTo;

    if (USE_TEST_EMAIL) {
      // En modo de prueba, siempre usar el email de prueba
      emailTo = TEMP_TEST_EMAIL;
      console.log(`[UserNotifications] 🧪 Modo de prueba activo: ${user.email || user.name} → ${emailTo}`);
    } else if (!user.email) {
      // En producción, si no hay email, cancelar
      console.warn(
        `[UserNotifications] ⚠️ Usuario ${user._id} no tiene email configurado - CANCELADO`
      );
      return;
    } else {
      // En producción con email configurado
      emailTo = user.email;
      console.log(`[UserNotifications] Enviando a: ${emailTo}`);
    }

    // Enviar notificación
    console.log(`[UserNotifications] Llamando a notificationService.send() para ${emailTo}`);
    await notificationService.send({
      type: "user.welcome",
      recipient: {
        id: user._id?.toString() || user.id?.toString(),
        email: emailTo,
        name: user.name || user.username || "Usuario",
      },
      data: {
        user: {
          _id: user._id?.toString() || user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      },
    });

    console.log(
      `[UserNotifications] ✅ Notificación de bienvenida encolada para ${emailTo}`
    );
  } catch (error) {
    console.error(
      "[UserNotifications] ❌ Error enviando notificación de bienvenida:",
      error.message
    );
    console.error("[UserNotifications] Stack:", error.stack);
    // No lanzar el error para no afectar el flujo principal
  }
}

module.exports = {
  notifyUserWelcome,
};
