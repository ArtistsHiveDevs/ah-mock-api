const nodemailer = require("nodemailer");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

// Configurar SES v2 client
const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentialDefaultProvider: defaultProvider,
  // Las credenciales se toman automáticamente del IAM role en Elastic Beanstalk
});

// Crear transporter de Nodemailer con SES v2
// Documentación: https://nodemailer.com/transports/ses/
const transporter = nodemailer.createTransport({
  SES: {
    sesClient,
    SendEmailCommand,
  },
});

/**
 * Enviar email genérico
 * @param {Object} options - Opciones del email
 * @param {string} options.to - Email del destinatario
 * @param {string} options.subject - Asunto del email
 * @param {string} options.text - Contenido en texto plano
 * @param {string} options.html - Contenido en HTML (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@artist-hive.com",
    to,
    subject,
    text,
    html: html || text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "[EmailService] ✅ Email enviado exitosamente:",
      info.messageId
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EmailService] ❌ Error enviando email:", error);
    throw error;
  }
}

/**
 * Enviar notificación de nuevo prebooking
 * @param {Object} options - Opciones de la notificación
 * @param {string} options.to - Email del destinatario
 * @param {string} options.recipientName - Nombre del destinatario
 * @param {Object} options.prebooking - Datos del prebooking
 * @param {string} options.requesterName - Nombre del solicitante
 * @returns {Promise<Object>} Resultado del envío
 */
async function sendPrebookingNotification({
  to,
  recipientName,
  prebooking,
  requesterName,
}) {
  const subject = `Nueva solicitud: ${prebooking.event_name || "Prebooking"}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #4CAF50;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .details {
          background: white;
          padding: 15px;
          margin: 15px 0;
          border-left: 4px solid #4CAF50;
          border-radius: 4px;
        }
        .footer {
          color: #666;
          font-size: 12px;
          margin-top: 30px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nueva Solicitud de Prebooking</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${recipientName}</strong>,</p>
          <p><strong>${requesterName}</strong> te ha enviado una nueva solicitud de prebooking:</p>

          <div class="details">
            <p><strong>Evento:</strong> ${
              prebooking.event_name || "Sin nombre"
            }</p>
            <p><strong>Fecha:</strong> ${
              prebooking.requested_date_start
                ? new Date(prebooking.requested_date_start).toLocaleDateString(
                    "es-ES"
                  )
                : "No especificada"
            }</p>
            <p><strong>Lugar:</strong> ${
              prebooking.venue_name || "No especificado"
            }</p>
            ${
              prebooking.notes
                ? `<p><strong>Notas:</strong> ${prebooking.notes}</p>`
                : ""
            }
          </div>

          <p>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/prebookings/${prebooking._id}" class="button">
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
  `;

  const text = `
Hola ${recipientName},

${requesterName} te ha enviado una nueva solicitud de prebooking:

Evento: ${prebooking.event_name || "Sin nombre"}
Fecha: ${prebooking.requested_date_start || "No especificada"}
Lugar: ${prebooking.venue_name || "No especificado"}
${prebooking.notes ? `Notas: ${prebooking.notes}` : ""}

Ver detalles: ${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/prebookings/${prebooking._id}

---
Este es un mensaje automático, por favor no respondas a este email.
  `;

  return sendEmail({ to, subject, text, html });
}

/**
 * Enviar notificación de respuesta a prebooking
 * @param {Object} options - Opciones de la notificación
 * @param {string} options.to - Email del destinatario
 * @param {string} options.requesterName - Nombre del solicitante original
 * @param {string} options.recipientName - Nombre de quien responde
 * @param {Object} options.prebooking - Datos del prebooking
 * @param {string} options.status - Estado: "accepted" | "rejected" | "viewed"
 * @param {string} options.notes - Notas opcionales de la respuesta
 * @returns {Promise<Object>} Resultado del envío
 */
async function sendPrebookingResponseNotification({
  to,
  requesterName,
  recipientName,
  prebooking,
  status,
  notes,
}) {
  const statusMessages = {
    accepted: { text: "aceptó", color: "#4CAF50", emoji: "✅" },
    rejected: { text: "rechazó", color: "#f44336", emoji: "❌" },
    viewed: { text: "vio", color: "#2196F3", emoji: "👀" },
  };

  const statusInfo = statusMessages[status] || statusMessages.viewed;
  const subject = `${statusInfo.emoji} ${recipientName} ${statusInfo.text} tu solicitud de prebooking`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: ${statusInfo.color};
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #2196F3;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .notes {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .footer {
          color: #666;
          font-size: 12px;
          margin-top: 30px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${statusInfo.emoji} ${recipientName} ${
    statusInfo.text
  } tu solicitud</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${requesterName}</strong>,</p>
          <p><strong>${recipientName}</strong> ha ${
    statusInfo.text
  } tu solicitud de prebooking para:</p>
          <p style="font-size: 18px; margin: 20px 0;"><strong>${
            prebooking.event_name || "tu evento"
          }</strong></p>

          ${
            notes
              ? `
            <div class="notes">
              <strong>Mensaje:</strong><br>
              ${notes}
            </div>
          `
              : ""
          }

          <p>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/prebookings/${prebooking._id}" class="button">
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
  `;

  const text = `
${statusInfo.emoji} ${recipientName} ${statusInfo.text} tu solicitud

Hola ${requesterName},

${recipientName} ha ${statusInfo.text} tu solicitud de prebooking para:
${prebooking.event_name || "tu evento"}

${notes ? `Mensaje: ${notes}` : ""}

Ver detalles: ${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/prebookings/${prebooking._id}

---
Este es un mensaje automático, por favor no respondas a este email.
  `;

  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendEmail,
  sendPrebookingNotification,
  sendPrebookingResponseNotification,
};
