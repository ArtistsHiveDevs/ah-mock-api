/**
 * Helper para enviar notificaciones relacionadas con aplicaciones a Open Calls
 */

const notificationService = require("../infrastructure/notifications");

// TEMPORAL: Email de prueba mientras se verifica el dominio en producción
const TEMP_TEST_EMAIL =
  process.env.TEMP_NOTIFICATION_EMAIL || "admiprogramacion@gmail.com";
const USE_TEST_EMAIL = process.env.USE_TEST_EMAIL === "true";

// Email quemado para pruebas cuando el recipient no tiene email configurado
const FALLBACK_TEST_EMAIL =
  process.env.FALLBACK_TEST_EMAIL || "test@artist-hive.com";
const USE_FALLBACK_TEST_EMAIL = process.env.USE_FALLBACK_TEST_EMAIL === "true";

/**
 * Enviar notificación al artista dueño de la aplicación cuando el Place
 * que publicó la Open Call acepta o rechaza su aplicación.
 * @param {Object} application - OpenCallApplication modificada, con artist_id y open_call_id populados
 * @param {String} newStatus - "pending"|"accepted"|"rejected" ("pending" no dispara notificación)
 * @param {String} lang
 */
async function notifyOpenCallApplicationStatusChanged(
  application,
  newStatus,
  lang,
) {
  try {
    console.log(
      "[OpenCallApplicationNotifications] 📤 Iniciando notificación de cambio de estado",
    );
    console.log(
      `[OpenCallApplicationNotifications] Application ID: ${application._id}`,
    );
    console.log(
      `[OpenCallApplicationNotifications] Nuevo estado: ${newStatus}`,
    );

    const artist = application.artist_id;
    const openCall = application.open_call_id;

    if (!artist) {
      console.warn(
        "[OpenCallApplicationNotifications] ⚠️ No se encontró el artist - CANCELADO",
      );
      return;
    }

    let notificationType;
    if (newStatus === "accepted") {
      notificationType = "openCallApplication.accepted";
    } else if (newStatus === "rejected") {
      notificationType = "openCallApplication.rejected";
    } else {
      console.log(
        `[OpenCallApplicationNotifications] ⚠️ Status ${newStatus} no requiere notificación - OMITIDO`,
      );
      return;
    }

    let emailTo;

    if (USE_TEST_EMAIL) {
      emailTo = TEMP_TEST_EMAIL;
      console.log(
        `[OpenCallApplicationNotifications] 🧪 Modo de prueba activo: ${artist.name} → ${emailTo}`,
      );
    } else if (!artist.email) {
      if (USE_FALLBACK_TEST_EMAIL) {
        emailTo = FALLBACK_TEST_EMAIL;
        console.warn(
          `[OpenCallApplicationNotifications] ⚠️ Artist ${artist._id || artist.id} no tiene email configurado - usando email quemado: ${emailTo}`,
        );
      } else {
        console.warn(
          `[OpenCallApplicationNotifications] ⚠️ Artist ${artist._id || artist.id} no tiene email configurado - CANCELADO`,
        );
        return;
      }
    } else {
      emailTo = artist.email;
      console.log(`[OpenCallApplicationNotifications] Enviando a: ${emailTo}`);
    }

    await notificationService.send({
      type: notificationType,
      recipient: {
        id: artist._id?.toString() || artist.id?.toString(),
        email: emailTo,
        name: artist.name || "Artista",
      },
      data: {
        lang: lang || "es",
        openCall: {
          _id: openCall?._id?.toString() || openCall?.id,
          event_name: openCall?.event_name,
          event_date: openCall?.event_date,
          city: openCall?.city,
        },
        status: newStatus,
      },
    });

    console.log(
      `[OpenCallApplicationNotifications] ✅ Notificación de ${notificationType} encolada para ${emailTo}`,
    );
  } catch (error) {
    console.error(
      "[OpenCallApplicationNotifications] ❌ Error enviando notificación de cambio de estado:",
      error.message,
    );
    console.error("[OpenCallApplicationNotifications] Stack:", error.stack);
    // No lanzar el error para no afectar el flujo principal
  }
}

module.exports = {
  notifyOpenCallApplicationStatusChanged,
};
