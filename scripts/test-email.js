/**
 * Script de prueba para enviar un email usando el sistema de notificaciones
 *
 * Uso:
 *   node scripts/test-email.js your-email@example.com
 */

require("dotenv").config();
const notificationService = require("../infrastructure/notifications");

async function testEmail() {
  const emailTo = process.argv[2];

  if (!emailTo) {
    console.error("❌ Error: Debes proporcionar un email como argumento");
    console.log("\nUso:");
    console.log("  node scripts/test-email.js your-email@example.com");
    process.exit(1);
  }

  console.log("\n🧪 Testing Notification System");
  console.log("================================");
  console.log(`📧 Enviando email de prueba a: ${emailTo}`);
  console.log("");

  try {
    const result = await notificationService.sendTestEmail(
      emailTo,
      "🧪 Test Email - Artists Hive Notification System"
    );

    console.log("\n✅ Resultado:", JSON.stringify(result, null, 2));
    console.log("\n📬 Revisa tu bandeja de entrada!");
    console.log("   (También revisa la carpeta de spam si no lo ves)");

    // Esperar 2 segundos para que el email se envíe en background
    console.log("\n⏳ Esperando que se procese el email en background...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("✅ Email procesado!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al enviar email:", error);
    console.error("\nDetalles del error:");
    console.error(error.stack);
    process.exit(1);
  }
}

testEmail();
