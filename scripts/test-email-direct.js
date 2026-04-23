/**
 * Script de prueba DIRECTO para enviar un email
 * Este script llama directamente al emailService sin pasar por el sistema de notificaciones
 * para ver errores de SES inmediatamente
 *
 * Uso:
 *   node scripts/test-email-direct.js your-email@example.com
 */

require("dotenv").config();
const emailService = require("../helpers/emailService");

async function testEmailDirect() {
  const emailTo = process.argv[2];

  if (!emailTo) {
    console.error("❌ Error: Debes proporcionar un email como argumento");
    console.log("\nUso:");
    console.log("  node scripts/test-email-direct.js your-email@example.com");
    process.exit(1);
  }

  console.log("\n🧪 Testing Email Service (Direct)");
  console.log("===================================");
  console.log(`📧 Enviando email a: ${emailTo}`);
  console.log(
    `📤 Desde: ${process.env.EMAIL_FROM || "noreply@artist-hive.com"}`,
  );
  console.log(`🌎 Región AWS: ${process.env.AWS_REGION || "us-east-1"}`);
  console.log("");

  try {
    const result = await emailService.sendEmail({
      to: emailTo,
      subject: "🧪 Test Email - Artists Hive",
      text: "Este es un email de prueba del sistema de notificaciones de Artists Hive.",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              color: #4CAF50;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content {
              color: #333;
              line-height: 1.6;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">🧪 Test Email</div>
            <div class="content">
              <p>¡Hola!</p>
              <p>Este es un email de prueba del <strong>sistema de notificaciones de Artists Hive</strong>.</p>
              <p>Si estás viendo este mensaje, significa que:</p>
              <ul>
                <li>✅ El servidor está configurado correctamente</li>
                <li>✅ AWS SES está funcionando</li>
                <li>✅ El sistema de notificaciones está operativo</li>
              </ul>
              <p>¡Todo listo para enviar notificaciones! 🎉</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático de prueba.</p>
              <p>Artists Hive Notification System</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("\n✅ Email enviado exitosamente!");
    console.log("\nDetalles:");
    console.log(`   Message ID: ${result.messageId}`);
    console.log("\n📬 Revisa tu bandeja de entrada!");
    console.log("   (También revisa la carpeta de spam si no lo ves)");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al enviar email:");
    console.error("\nTipo de error:", error.name);
    console.error("Mensaje:", error.message);

    if (error.code) {
      console.error("Código:", error.code);
    }

    if (error.message.includes("Email address is not verified")) {
      console.error("\n⚠️  PROBLEMA: Email no verificado en AWS SES");
      console.error("\nPara solucionar:");
      console.error("1. Ve a AWS SES Console");
      console.error("2. Verifica el email: noreply@artist-hive.com");
      console.error("   O verifica todo el dominio: artists-hive.com");
      console.error("3. O cambia EMAIL_FROM en .env a un email ya verificado");
    }

    if (error.message.includes("sandbox")) {
      console.error("\n⚠️  PROBLEMA: AWS SES está en modo Sandbox");
      console.error("\nEn modo sandbox solo puedes enviar emails a:");
      console.error("- Emails verificados en SES");
      console.error("\nPara salir del sandbox:");
      console.error("1. Ve a AWS SES Console");
      console.error("2. Request production access");
    }

    console.error("\n📚 Stack trace completo:");
    console.error(error.stack);

    process.exit(1);
  }
}

testEmailDirect();
