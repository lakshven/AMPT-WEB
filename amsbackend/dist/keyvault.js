"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSecrets = loadSecrets;
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
const identity_1 = require("@azure/identity");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function loadSecrets() {
    try {
        console.log("🔑 Loading secrets from Azure Key Vault...");
        const credential = new identity_1.DefaultAzureCredential();
        const client = new keyvault_secrets_1.SecretClient(process.env.KEYVAULT_URL, credential);
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
    }
    catch (err) {
        console.error("❌ Failed to load secrets from Key Vault:", err);
    }
}
//# sourceMappingURL=keyvault.js.map