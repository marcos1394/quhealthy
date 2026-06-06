const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

// USAGE: node register-risc.js path/to/service-account.json https://api.quhealthy.org/api/auth/security/risc-webhook

async function main() {
  const keyPath = process.argv[2];
  const webhookUrl = process.argv[3] || "https://api.quhealthy.org/api/auth/security/risc-webhook";

  if (!keyPath) {
    console.error("❌ Por favor, proporciona el path a tu archivo JSON de Service Account.");
    console.log("Uso: node register-risc.js <path-al-json> [webhook-url]");
    process.exit(1);
  }

  if (!fs.existsSync(keyPath)) {
    console.error(`❌ El archivo no existe: ${keyPath}`);
    process.exit(1);
  }

  console.log("⏳ Autenticando con la Service Account...");
  const auth = new GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/risc.configuration.readwrite']
  });

  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    console.log("✅ Token obtenido. Registrando Webhook en Google RISC API...");
    console.log(`📡 URL a registrar: ${webhookUrl}`);

    const res = await client.request({
      url: 'https://risc.googleapis.com/v1beta/stream:update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        delivery: {
          delivery_method: "https://schemas.openid.net/secevent/risc/delivery-method/push",
          url: webhookUrl
        },
        events_requested: [
          "https://schemas.openid.net/secevent/risc/event-type/account-disabled",
          "https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked",
          "https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required"
        ]
      }
    });

    console.log("🎉 ¡Éxito! Tu API de RISC ha sido configurada.");
    console.log("Respuesta de Google:", res.data);

  } catch (error) {
    console.error("❌ Hubo un error al registrar el webhook:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error);
    }
  }
}

main();
