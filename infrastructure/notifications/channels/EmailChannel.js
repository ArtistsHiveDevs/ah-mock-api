const emailService = require("../../../helpers/emailService");
const { getChannelConfig } = require("../notificationConfig");

/**
 * Handler del canal de Email
 * Responsable de enviar notificaciones por correo electrónico
 */
class EmailChannel {
  constructor() {
    this.config = getChannelConfig("EMAIL");
  }

  /**
   * Enviar notificación por email
   * @param {Object} options
   * @param {Object} options.type - Configuración del tipo de notificación
   * @param {Object} options.recipient - Datos del destinatario
   * @param {Object} options.data - Datos para el template
   */
  async send({ type, recipient, data }) {
    if (!recipient.email) {
      console.warn(
        `[EmailChannel] ⚠️ Recipient ${recipient.id} no tiene email`
      );
      return;
    }

    // Seleccionar template según el tipo
    const template = this.getTemplate(type.template);

    // Generar el contenido del email
    const emailContent = template({ recipient, data });

    // Enviar usando el servicio de email
    await emailService.sendEmail({
      to: recipient.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    console.log(
      `[EmailChannel] ✅ Email enviado a ${recipient.email} - ${type.name}`
    );
  }

  /**
   * Obtener template por nombre
   */
  getTemplate(templateName) {
    const templates = {
      prebooking_created: this.templatePrebookingCreated,
      prebooking_response: this.templatePrebookingResponse,
      prebooking_cancelled: this.templatePrebookingCancelled,
      user_welcome: this.templateUserWelcome,
      test: this.templateTest,
      // Agregar más templates aquí
    };

    return templates[templateName] || templates.test;
  }

  /**
   * Template: Prebooking Creado
   */
  templatePrebookingCreated({ recipient, data }) {
    const { prebooking, requester } = data;

    return {
      subject: `Nueva solicitud: ${prebooking.event_name || "Prebooking"}`,
      text: `
Hola ${recipient.name || "Usuario"},

${requester.name} te ha enviado una nueva solicitud de prebooking:

Evento: ${prebooking.event_name || "Sin nombre"}
Fecha: ${prebooking.requested_date_start || "No especificada"}
Lugar: ${prebooking.venue_name || "No especificado"}
${prebooking.notes ? `Notas: ${prebooking.notes}` : ""}

Ver detalles: ${process.env.FRONTEND_URL || "http://localhost:3000"}/prebookings/${prebooking._id}

---
Este es un mensaje automático, por favor no respondas a este email.
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white !important; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Nueva Solicitud de Prebooking</h2>
    </div>
    <div class="content">
      <p>Hola <strong>${recipient.name || "Usuario"}</strong>,</p>
      <p><strong>${requester.name}</strong> te ha enviado una nueva solicitud de prebooking:</p>
      <div class="details">
        <p><strong>Evento:</strong> ${prebooking.event_name || "Sin nombre"}</p>
        <p><strong>Fecha:</strong> ${prebooking.requested_date_start || "No especificada"}</p>
        <p><strong>Lugar:</strong> ${prebooking.venue_name || "No especificado"}</p>
        ${prebooking.notes ? `<p><strong>Notas:</strong> ${prebooking.notes}</p>` : ""}
      </div>
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/prebookings/${prebooking._id}" class="button">
          Ver Detalles
        </a>
      </p>
      <div class="footer">
        <p>Este es un mensaje automático, por favor no respondas a este email.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  /**
   * Template: Respuesta a Prebooking
   */
  templatePrebookingResponse({ recipient, data }) {
    const { prebooking, requester, status, notes } = data;

    const statusMessages = {
      accepted: { text: "aceptó", emoji: "✅" },
      rejected: { text: "rechazó", emoji: "❌" },
      viewed: { text: "vio", emoji: "👀" },
    };

    const statusInfo = statusMessages[status] || statusMessages.viewed;

    return {
      subject: `${statusInfo.emoji} ${requester.name} ${statusInfo.text} tu solicitud de prebooking`,
      text: `
${statusInfo.emoji} ${requester.name} ${statusInfo.text} tu solicitud

Hola ${recipient.name},

${requester.name} ha ${statusInfo.text} tu solicitud de prebooking para:
${prebooking.event_name || "tu evento"}

${notes ? `Mensaje: ${notes}` : ""}

Ver detalles: ${process.env.FRONTEND_URL || "http://localhost:3000"}/prebookings/${prebooking._id}

---
Este es un mensaje automático, por favor no respondas a este email.
      `.trim(),
      html: `<!-- HTML similar al anterior -->`,
    };
  }

  /**
   * Template: Prebooking Cancelado
   */
  templatePrebookingCancelled({ recipient, data }) {
    // Similar a los anteriores
    return this.templateTest({ recipient, data });
  }

  /**
   * Template: Bienvenida de Usuario
   */
  templateUserWelcome({ recipient, data }) {
    const { user } = data;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    return {
      subject: `¡Bienvenido a Artists Hive, ${recipient.name}!`,
      text: `
¡Hola ${recipient.name}!

Bienvenido a Artists Hive, la plataforma que conecta artistas, lugares y eventos.

Tu cuenta ha sido creada exitosamente. Ahora puedes:
- Explorar artistas y lugares
- Crear y gestionar prebookings
- Conectar con la comunidad artística
- Y mucho más...

Empieza ahora: ${frontendUrl}

Si tienes alguna pregunta, no dudes en contactarnos.

¡Disfruta de Artists Hive!

---
El equipo de Artists Hive
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 30px 20px; }
    .welcome-text { font-size: 18px; margin-bottom: 20px; }
    .features { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .features ul { margin: 10px 0; padding-left: 20px; }
    .features li { margin: 8px 0; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; font-size: 16px; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎵 ¡Bienvenido a Artists Hive!</h1>
    </div>
    <div class="content">
      <p class="welcome-text">¡Hola <strong>${recipient.name}</strong>!</p>
      <p>Nos emociona darte la bienvenida a <strong>Artists Hive</strong>, la plataforma que conecta artistas, lugares y eventos en un solo lugar.</p>

      <div class="features">
        <p><strong>Tu cuenta ha sido creada exitosamente. Ahora puedes:</strong></p>
        <ul>
          <li>🎤 Explorar artistas y descubrir nuevo talento</li>
          <li>🏛️ Encontrar lugares para eventos</li>
          <li>📅 Crear y gestionar prebookings</li>
          <li>🤝 Conectar con la comunidad artística</li>
          <li>⭐ Seguir tus artistas y lugares favoritos</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${frontendUrl}" class="button">
          Empezar Ahora
        </a>
      </p>

      <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos respondiendo a este email.</p>

      <p style="margin-top: 20px;"><strong>¡Disfruta de Artists Hive!</strong></p>
    </div>
    <div class="footer">
      <p><strong>El equipo de Artists Hive</strong></p>
      <p>Este es un mensaje automático enviado porque creaste una cuenta en Artists Hive.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  /**
   * Template: Test
   */
  templateTest({ recipient, data }) {
    return {
      subject: data.subject || "Test Notification",
      text: data.message || "Este es un mensaje de prueba.",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🧪 Test Notification</h2>
    <p>${data.message || "Este es un mensaje de prueba del sistema de notificaciones."}</p>
    <p><small>Enviado a: ${recipient.email}</small></p>
  </div>
</body>
</html>
      `.trim(),
    };
  }
}

module.exports = EmailChannel;
