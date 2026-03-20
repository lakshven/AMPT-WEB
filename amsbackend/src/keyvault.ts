import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import dotenv from "dotenv";

dotenv.config();

export async function loadSecrets() {
  // Local environment → skip Key Vault
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Skipping Azure Key Vault in local development");
    return;
  }
  try {
    console.log("🔑 Loading secrets from Azure Key Vault...");
   const vaultUrl = process.env.KEYVAULT_URL;
    if (!vaultUrl) {
      console.error("❌ KEYVAULT_URL missing in production environment");
      return;
    }
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(process.env.KEYVAULT_URL!, credential);

    const db = await client.getSecret("database-url");
    process.env.DATABASE_URL = db.value;

    const emailUser = await client.getSecret("EMAIL-USER");
    process.env.EMAIL_USER = emailUser.value;

    const emailPass = await client.getSecret("EMAIL-PASS");
    process.env.EMAIL_PASS = emailPass.value;

    const jwt = await client.getSecret("JWT-SECRET");
    process.env.JWT_SECRET = jwt.value;

    const admin = await client.getSecret("AADMIN-CODE");
    process.env.ADMIN_CODE = admin.value;

    console.log("🔥 All secrets loaded successfully from Key Vault");
  } catch (err) {
    console.error("❌ Failed to load secrets from Key Vault:", err);
  }
}
