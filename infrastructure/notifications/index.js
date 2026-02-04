/**
 * Punto de entrada del sistema de notificaciones
 * Inicializa todos los canales y exporta el servicio
 */

const NotificationService = require("./NotificationService");
const EmailChannel = require("./channels/EmailChannel");
const { isChannelEnabledGlobally } = require("./notificationConfig");

// Registrar canal de Email
if (isChannelEnabledGlobally("EMAIL")) {
  const emailChannel = new EmailChannel();
  NotificationService.registerChannel("email", emailChannel);
}

// TODO: Registrar otros canales cuando estén implementados
// if (isChannelEnabledGlobally('PUSH')) {
//   const pushChannel = new PushChannel();
//   NotificationService.registerChannel('push', pushChannel);
// }

// if (isChannelEnabledGlobally('SMS')) {
//   const smsChannel = new SMSChannel();
//   NotificationService.registerChannel('sms', smsChannel);
// }

// if (isChannelEnabledGlobally('WEBSOCKET')) {
//   const websocketChannel = new WebSocketChannel();
//   NotificationService.registerChannel('websocket', websocketChannel);
// }

module.exports = NotificationService;
