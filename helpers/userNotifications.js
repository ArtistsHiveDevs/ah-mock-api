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
 * @param {string} lang - Código de idioma (de req.lang o req.headers['lang'])
 */
async function notifyUserWelcome(user, lang) {
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

    // Determinar el idioma: priorizar user_language, luego lang pasado, luego español
    const userLang = user.user_language || lang || "es";
    console.log(`[UserNotifications] Idioma detectado: ${userLang} (user.user_language: ${user.user_language}, lang param: ${lang})`);

    // Determinar el nombre a mostrar: stage_name, given_names, username, o "Usuario"
    const displayName = user.stage_name || user.given_names || user.username || "Usuario";

    console.log(`[UserNotifications] Nombre para saludo: ${displayName} (stage_name: ${user.stage_name}, given_names: ${user.given_names}, username: ${user.username})`);

    // Enviar notificación
    console.log(`[UserNotifications] Llamando a notificationService.send() para ${emailTo}`);
    await notificationService.send({
      type: "user.welcome",
      recipient: {
        id: user._id?.toString() || user.id?.toString(),
        email: emailTo,
        name: displayName,
      },
      data: {
        lang: userLang,
        user: {
          _id: user._id?.toString() || user.id,
          name: displayName,
          stage_name: user.stage_name,
          given_names: user.given_names,
          username: user.username,
          email: user.email,
        },
      },
    });

    console.log(
      `[UserNotifications] ✅ Notificación de bienvenida encolada para ${emailTo} (idioma: ${userLang})`
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

/**
 * Helper para obtener el email destino considerando modo de prueba
 * @param {Object} user - Usuario con email
 * @returns {string|null} Email a usar o null si no hay email
 */
function getTargetEmail(user) {
  if (USE_TEST_EMAIL) {
    console.log(`[UserNotifications] 🧪 Modo de prueba: ${user.email || user.name} → ${TEMP_TEST_EMAIL}`);
    return TEMP_TEST_EMAIL;
  }
  if (!user.email) {
    console.warn(`[UserNotifications] ⚠️ Usuario ${user._id} no tiene email - CANCELADO`);
    return null;
  }
  return user.email;
}

/**
 * Helper para formatear nombre de usuario de forma simple
 * @param {Object} user - Usuario
 * @returns {string} Nombre formateado: stage_name, given_names, username, o "Usuario"
 */
function getDisplayName(user) {
  return user.stage_name || user.given_names || user.username || "Usuario";
}

/**
 * Helper para formatear nombre de usuario de forma informativa (con @username)
 * @param {Object} user - Usuario
 * @returns {string} Nombre formateado: "stage_name (@username)" o "given_names surnames (@username)" o "given_names (@username)" o "@username"
 */
function getInformativeName(user) {
  if (user.stage_name) {
    return user.username ? `${user.stage_name} (@${user.username})` : user.stage_name;
  } else if (user.given_names && user.surnames) {
    return user.username
      ? `${user.given_names} ${user.surnames} (@${user.username})`
      : `${user.given_names} ${user.surnames}`;
  } else if (user.given_names) {
    return user.username ? `${user.given_names} (@${user.username})` : user.given_names;
  } else {
    return user.username ? `@${user.username}` : "Usuario";
  }
}

/**
 * Notificar cuando un usuario es asignado a un perfil
 * @param {Object} params
 * @param {Object} params.user - Usuario asignado
 * @param {Object} params.profile - Perfil al que fue asignado (id, name, type)
 * @param {string} params.role - Rol asignado
 * @param {Object} params.assignedBy - Usuario que realizó la asignación
 */
async function notifyProfileAssigned({ user, profile, role, assignedBy, lang }) {
  try {
    console.log("[UserNotifications] 📤 Notificando asignación de perfil");

    const emailTo = getTargetEmail(user);
    if (!emailTo) return;

    const displayName = getDisplayName(user);
    const assignedByName = getInformativeName(assignedBy);

    await notificationService.send({
      type: "user.profileAssignment.assigned",
      recipient: {
        id: user._id?.toString() || user.id?.toString(),
        email: emailTo,
        name: displayName,
      },
      data: {
        lang: lang || "en",
        user: {
          _id: user._id?.toString() || user.id,
          name: displayName,
          username: user.username,
          email: user.email,
        },
        profile: {
          id: profile.id || profile._id?.toString(),
          name: profile.name,
          type: profile.type,
        },
        role,
        assignedBy: {
          id: assignedBy._id?.toString() || assignedBy.id,
          name: assignedByName,
        },
      },
    });

    console.log(`[UserNotifications] ✅ Notificación de asignación enviada a ${emailTo}`);
  } catch (error) {
    console.error("[UserNotifications] ❌ Error en notifyProfileAssigned:", error.message);
  }
}

/**
 * Notificar cuando el rol de un usuario en un perfil es actualizado
 * @param {Object} params
 * @param {Object} params.user - Usuario afectado
 * @param {Object} params.profile - Perfil donde se actualizó el rol
 * @param {string} params.previousRole - Rol anterior
 * @param {string} params.newRole - Nuevo rol
 */
async function notifyProfileRoleUpdated({ user, profile, previousRole, newRole, lang }) {
  try {
    console.log("[UserNotifications] 📤 Notificando actualización de rol");

    const emailTo = getTargetEmail(user);
    if (!emailTo) return;

    const displayName = getDisplayName(user);

    await notificationService.send({
      type: "user.profileAssignment.roleUpdated",
      recipient: {
        id: user._id?.toString() || user.id?.toString(),
        email: emailTo,
        name: displayName,
      },
      data: {
        lang: lang || "en",
        user: {
          _id: user._id?.toString() || user.id,
          name: displayName,
          username: user.username,
          email: user.email,
        },
        profile: {
          id: profile.id || profile._id?.toString(),
          name: profile.name,
          type: profile.type,
        },
        previousRole,
        newRole,
      },
    });

    console.log(`[UserNotifications] ✅ Notificación de rol actualizado enviada a ${emailTo}`);
  } catch (error) {
    console.error("[UserNotifications] ❌ Error en notifyProfileRoleUpdated:", error.message);
  }
}

/**
 * Notificar cuando un usuario es removido de un perfil
 * @param {Object} params
 * @param {Object} params.user - Usuario removido
 * @param {Object} params.profile - Perfil del que fue removido
 */
async function notifyProfileRemoved({ user, profile, lang }) {
  try {
    console.log("[UserNotifications] 📤 Notificando remoción de perfil");

    const emailTo = getTargetEmail(user);
    if (!emailTo) return;

    const displayName = getDisplayName(user);

    await notificationService.send({
      type: "user.profileAssignment.removed",
      recipient: {
        id: user._id?.toString() || user.id?.toString(),
        email: emailTo,
        name: displayName,
      },
      data: {
        lang: lang || "en",
        user: {
          _id: user._id?.toString() || user.id,
          name: displayName,
          username: user.username,
          email: user.email,
        },
        profile: {
          id: profile.id || profile._id?.toString(),
          name: profile.name,
          type: profile.type,
        },
      },
    });

    console.log(`[UserNotifications] ✅ Notificación de remoción enviada a ${emailTo}`);
  } catch (error) {
    console.error("[UserNotifications] ❌ Error en notifyProfileRemoved:", error.message);
  }
}

/**
 * Notificar invitación a unirse a un perfil
 * @param {Object} params
 * @param {Object} params.user - Usuario invitado
 * @param {Object} params.profile - Perfil al que se invita
 * @param {string} params.proposedRole - Rol propuesto
 * @param {Object} params.invitedBy - Usuario que envía la invitación
 * @param {string} params.invitationId - ID de la invitación para los enlaces
 */
async function notifyProfileInvitation({ user, profile, proposedRole, invitedBy, invitationId, lang }) {
  try {
    console.log("[UserNotifications] 📤 Notificando invitación a perfil");

    const emailTo = getTargetEmail(user);
    if (!emailTo) return;

    const displayName = getDisplayName(user);
    const invitedByName = getInformativeName(invitedBy);

    await notificationService.send({
      type: "user.profileAssignment.invitation",
      recipient: {
        id: user._id?.toString() || user.id?.toString(),
        email: emailTo,
        name: displayName,
      },
      data: {
        lang: lang || "en",
        user: {
          _id: user._id?.toString() || user.id,
          name: displayName,
          username: user.username,
          email: user.email,
        },
        profile: {
          id: profile.id || profile._id?.toString(),
          name: profile.name,
          type: profile.type,
        },
        proposedRole,
        invitedBy: {
          id: invitedBy._id?.toString() || invitedBy.id,
          name: invitedByName,
        },
        invitationId,
      },
    });

    console.log(`[UserNotifications] ✅ Invitación enviada a ${emailTo}`);
  } catch (error) {
    console.error("[UserNotifications] ❌ Error en notifyProfileInvitation:", error.message);
  }
}

/**
 * Notificar que una invitación fue aceptada (al que invitó)
 * @param {Object} params
 * @param {Object} params.inviter - Usuario que envió la invitación
 * @param {Object} params.invitee - Usuario que aceptó
 * @param {Object} params.profile - Perfil al que se unió
 */
async function notifyProfileInvitationAccepted({ inviter, invitee, profile, lang }) {
  try {
    console.log("[UserNotifications] 📤 Notificando invitación aceptada");

    const emailTo = getTargetEmail(inviter);
    if (!emailTo) return;

    const inviterName = getDisplayName(inviter);
    const inviteeName = getInformativeName(invitee);

    await notificationService.send({
      type: "user.profileAssignment.invitationAccepted",
      recipient: {
        id: inviter._id?.toString() || inviter.id?.toString(),
        email: emailTo,
        name: inviterName,
      },
      data: {
        lang: lang || "en",
        inviter: {
          _id: inviter._id?.toString() || inviter.id,
          name: inviterName,
        },
        invitee: {
          _id: invitee._id?.toString() || invitee.id,
          name: inviteeName,
          username: invitee.username,
        },
        profile: {
          id: profile.id || profile._id?.toString(),
          name: profile.name,
          type: profile.type,
        },
      },
    });

    console.log(`[UserNotifications] ✅ Notificación de aceptación enviada a ${emailTo}`);
  } catch (error) {
    console.error("[UserNotifications] ❌ Error en notifyProfileInvitationAccepted:", error.message);
  }
}

/**
 * Notificar que una invitación fue rechazada (al que invitó)
 * @param {Object} params
 * @param {Object} params.inviter - Usuario que envió la invitación
 * @param {Object} params.invitee - Usuario que rechazó
 * @param {Object} params.profile - Perfil al que se invitaba
 */
async function notifyProfileInvitationDeclined({ inviter, invitee, profile, lang }) {
  try {
    console.log("[UserNotifications] 📤 Notificando invitación rechazada");

    const emailTo = getTargetEmail(inviter);
    if (!emailTo) return;

    const inviterName = getDisplayName(inviter);
    const inviteeName = getInformativeName(invitee);

    await notificationService.send({
      type: "user.profileAssignment.invitationDeclined",
      recipient: {
        id: inviter._id?.toString() || inviter.id?.toString(),
        email: emailTo,
        name: inviterName,
      },
      data: {
        lang: lang || "en",
        inviter: {
          _id: inviter._id?.toString() || inviter.id,
          name: inviterName,
        },
        invitee: {
          _id: invitee._id?.toString() || invitee.id,
          name: inviteeName,
          username: invitee.username,
        },
        profile: {
          id: profile.id || profile._id?.toString(),
          name: profile.name,
          type: profile.type,
        },
      },
    });

    console.log(`[UserNotifications] ✅ Notificación de rechazo enviada a ${emailTo}`);
  } catch (error) {
    console.error("[UserNotifications] ❌ Error en notifyProfileInvitationDeclined:", error.message);
  }
}

module.exports = {
  notifyUserWelcome,
  notifyProfileAssigned,
  notifyProfileRoleUpdated,
  notifyProfileRemoved,
  notifyProfileInvitation,
  notifyProfileInvitationAccepted,
  notifyProfileInvitationDeclined,
};
