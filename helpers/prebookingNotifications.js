/**
 * Helper para enviar notificaciones relacionadas con prebookings
 */

const notificationService = require("../infrastructure/notifications");

// TEMPORAL: Email de prueba mientras se verifica el dominio en producción
const TEMP_TEST_EMAIL = process.env.TEMP_NOTIFICATION_EMAIL || "admiprogramacion@gmail.com";
const USE_TEST_EMAIL = process.env.USE_TEST_EMAIL === "true";

/**
 * Enviar notificación cuando se crea un prebooking
 * @param {Object} prebooking - El prebooking creado (populado con requester y recipients)
 * @param {Connection} connection - Conexión de Mongoose
 */
async function notifyPrebookingCreated(prebooking, connection, lang) {
  try {
    console.log("[PrebookingNotifications] 📤 Iniciando notificación de prebooking creado");
    console.log(`[PrebookingNotifications] Prebooking ID: ${prebooking._id}`);

    // Obtener el requester (quien crea el prebooking)
    const requester = prebooking.requester_profile_id || prebooking.requester;
    const recipients = prebooking.recipient_ids || prebooking.recipients;

    console.log(`[PrebookingNotifications] Requester: ${requester?.name || "N/A"} (${requester?.email || "N/A"})`);
    console.log(`[PrebookingNotifications] Número de recipients: ${recipients?.length || 0}`);

    if (!recipients || recipients.length === 0) {
      console.log(
        "[PrebookingNotifications] ⚠️ No hay recipients para notificar"
      );
      return;
    }

    // Enviar notificación a cada recipient
    for (const recipient of recipients) {
      console.log(`[PrebookingNotifications] Procesando recipient: ${recipient.name} (${recipient._id})`);

      // Determinar el email a usar
      let emailTo;

      if (USE_TEST_EMAIL) {
        // En modo de prueba, siempre usar el email de prueba
        emailTo = TEMP_TEST_EMAIL;
        console.log(`[PrebookingNotifications] 🧪 Modo de prueba activo: ${recipient.name} → ${emailTo}`);
      } else if (!recipient.email) {
        // En producción, si no hay email, omitir
        console.warn(
          `[PrebookingNotifications] ⚠️ Recipient ${recipient._id || recipient.id} no tiene email configurado - OMITIDO`
        );
        continue;
      } else {
        // En producción con email configurado
        emailTo = recipient.email;
        console.log(`[PrebookingNotifications] Enviando a: ${emailTo}`);
      }

      // Enviar notificación
      console.log(`[PrebookingNotifications] Llamando a notificationService.send() para ${emailTo}`);
      await notificationService.send({
        type: "prebooking.created",
        recipient: {
          id: recipient._id?.toString() || recipient.id?.toString(),
          email: emailTo,
          name: recipient.name || "Usuario",
        },
        data: {
          lang: lang || "en",
          prebooking: {
            _id: prebooking._id?.toString() || prebooking.id,
            event_name: prebooking.event_name,
            requested_date_start: prebooking.requested_date_start,
            venue_name: recipients.find((r) => r.entity_type === "place")?.name,
            notes: prebooking.description,
          },
          requester: {
            name: requester.name || "Un usuario",
          },
        },
      });

      console.log(
        `[PrebookingNotifications] ✅ Notificación de creación encolada para ${emailTo}`
      );
    }

    console.log(`[PrebookingNotifications] ✅ Proceso completado: ${recipients.length} notificaciones procesadas`);
  } catch (error) {
    console.error(
      "[PrebookingNotifications] ❌ Error enviando notificación de creación:",
      error.message
    );
    console.error("[PrebookingNotifications] Stack:", error.stack);
    // No lanzar el error para no afectar el flujo principal
  }
}

/**
 * Enviar notificación cuando se cambia el estado de un prebooking
 * @param {Object} prebooking - El prebooking modificado (populado)
 * @param {String} participantProfileId - ID del perfil que cambió el estado
 * @param {String} newStatus - Nuevo estado: "interested", "not_interested", "viewed"
 * @param {String} notes - Notas opcionales
 */
async function notifyPrebookingStatusChanged(
  prebooking,
  participantProfileId,
  newStatus,
  notes,
  lang
) {
  try {
    console.log("[PrebookingNotifications] 📤 Iniciando notificación de cambio de estado");
    console.log(`[PrebookingNotifications] Prebooking ID: ${prebooking._id}`);
    console.log(`[PrebookingNotifications] Nuevo estado: ${newStatus}`);
    console.log(`[PrebookingNotifications] Participant ID: ${participantProfileId}`);

    // Obtener el requester (quien debe recibir la notificación)
    const requester = prebooking.requester_profile_id || prebooking.requester;

    console.log(`[PrebookingNotifications] Requester: ${requester?.name || "N/A"} (${requester?.email || "N/A"})`);

    if (!requester) {
      console.warn(
        "[PrebookingNotifications] ⚠️ No se encontró el requester - CANCELADO"
      );
      return;
    }

    // Obtener el participante que respondió
    const recipients = prebooking.recipient_ids || prebooking.recipients;
    const participant = recipients?.find(
      (r) =>
        r._id?.toString() === participantProfileId.toString() ||
        r.id?.toString() === participantProfileId.toString()
    );

    if (!participant) {
      console.warn(
        "[PrebookingNotifications] ⚠️ No se encontró el participante que respondió - CANCELADO"
      );
      return;
    }

    console.log(`[PrebookingNotifications] Participant: ${participant.name} (${participant._id})`);

    // Mapear el status a un tipo de notificación
    let notificationType;
    if (newStatus === "interested") {
      notificationType = "prebooking.accepted";
    } else if (newStatus === "not_interested") {
      notificationType = "prebooking.rejected";
    } else if (newStatus === "viewed") {
      notificationType = "prebooking.viewed";
    } else {
      console.log(
        `[PrebookingNotifications] ⚠️ Status ${newStatus} no requiere notificación - OMITIDO`
      );
      return;
    }

    console.log(`[PrebookingNotifications] Tipo de notificación: ${notificationType}`);

    // Determinar el email a usar
    let emailTo;

    if (USE_TEST_EMAIL) {
      // En modo de prueba, siempre usar el email de prueba
      emailTo = TEMP_TEST_EMAIL;
      console.log(`[PrebookingNotifications] 🧪 Modo de prueba activo: ${requester.name} → ${emailTo}`);
    } else if (!requester.email) {
      // En producción, si no hay email, cancelar
      console.warn(
        `[PrebookingNotifications] ⚠️ Requester ${requester._id || requester.id} no tiene email configurado - CANCELADO`
      );
      return;
    } else {
      // En producción con email configurado
      emailTo = requester.email;
      console.log(`[PrebookingNotifications] Enviando a: ${emailTo}`);
    }

    // Enviar notificación al requester
    console.log(`[PrebookingNotifications] Llamando a notificationService.send() para ${emailTo}`);
    await notificationService.send({
      type: notificationType,
      recipient: {
        id: requester._id?.toString() || requester.id?.toString(),
        email: emailTo,
        name: requester.name || "Usuario",
      },
      data: {
        lang: lang || "en",
        prebooking: {
          _id: prebooking._id?.toString() || prebooking.id,
          event_name: prebooking.event_name,
        },
        participant: {
          name: participant.name || "Un usuario",
        },
        status: newStatus,
        notes: notes || "",
      },
    });

    console.log(
      `[PrebookingNotifications] ✅ Notificación de ${notificationType} encolada para ${emailTo}`
    );
  } catch (error) {
    console.error(
      "[PrebookingNotifications] ❌ Error enviando notificación de cambio de estado:",
      error.message
    );
    console.error("[PrebookingNotifications] Stack:", error.stack);
    // No lanzar el error para no afectar el flujo principal
  }
}

module.exports = {
  notifyPrebookingCreated,
  notifyPrebookingStatusChanged,
};
