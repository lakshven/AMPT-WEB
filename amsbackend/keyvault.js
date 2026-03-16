const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config(); // Loads KEYVAULT_URL from .env

async function loadSecrets() {
  try {
    console.log("🔑 Loading secrets from Azure Key Vault...");

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(process.env.KEYVAULT_URL, credential);

    // Load all secrets
    const db = await client.getSecret("DATABASE_URL");
    process.env.DATABASE_URL = db.value;

    const emailUser = await client.getSecret("EMAIL_USER");
    process.env.EMAIL_USER = emailUser.value;

    const emailPass = await client.getSecret("EMAIL_PASS");
    process.env.EMAIL_PASS = emailPass.value;

    const jwt = await client.getSecret("JWT_SECRET");
    process.env.JWT_SECRET = jwt.value;

    const admin = await client.getSecret("ADMIN_CODE");
    process.env.ADMIN_CODE = admin.value;

    console.log("🔥 All secrets loaded successfully from Key Vault");
  } catch (err) {
    console.error("❌ Failed to load secrets from Key Vault:", err);
  }
}

module.exports = {loadSecrets};
