"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
// ⭐ Load Key Vault FIRST — and WAIT for it before anything else
const keyvault_1 = require("./keyvault");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const corsConfig_1 = __importDefault(require("./middleware/corsConfig"));
const userActivityLogger_1 = require("./middleware/userActivityLogger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const assets_1 = __importDefault(require("./routes/assets"));
const files_1 = __importDefault(require("./routes/files"));
const meRoutes_1 = __importDefault(require("./routes/meRoutes"));
const startupRoutes_1 = __importDefault(require("./routes/startupRoutes"));
const admin_1 = __importDefault(require("./routes/admin"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const dropdown_1 = __importDefault(require("./routes/dropdown"));
const reports_1 = __importDefault(require("./routes/reports"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const clientGroupsRoutes_1 = __importDefault(require("./routes/clientGroupsRoutes"));
const assetIssue_1 = __importDefault(require("./routes/assetIssue"));
const departmentController_1 = require("./controllers/department/departmentController");
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const companyAdminRoutes_1 = __importDefault(require("./routes/companyAdminRoutes"));
const auth_1 = require("./middleware/auth");
const systemCron_1 = require("./scheduler/systemCron");
// ⭐ ADD THIS — lazy Prisma initialization
const client_1 = require("./prisma/client");
// ⭐ Wrap everything in an async bootstrap function
async function bootstrap() {
    dotenv_1.default.config();
    // ⭐ WAIT for Key Vault secrets BEFORE Prisma loads anywhere
    await (0, keyvault_1.loadSecrets)();
    console.log("🔥 DATABASE_URL LOADED:", process.env.DATABASE_URL);
    // ⭐ Initialize Prisma AFTER secrets load
    function prismaClient() { return (0, client_1.getPrisma)(); }
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    // ⭐ Use ONLY corsOptions
    app.use(corsConfig_1.default);
    app.use(express_1.default.json());
    // API Routes
    app.use("/files", files_1.default);
    app.use("/api/auth", authRoutes_1.default);
    app.use(auth_1.attachUserContext);
    app.use(userActivityLogger_1.userActivityLogger);
    app.use("/api", startupRoutes_1.default);
    app.use("/api/users", userRoutes_1.default);
    app.use("/api/admin", admin_1.default);
    app.use("/api/admin", adminRoutes_1.default);
    app.use("/api/upload", uploads_1.default);
    app.use("/api/me", meRoutes_1.default);
    app.use("/api/assets", assets_1.default);
    app.use("/api/dashboard", dashboardRoutes_1.default);
    app.use("/api/client-groups", clientGroupsRoutes_1.default);
    app.get("/departments", departmentController_1.getDepartments);
    app.use("/api/audit-logs", auditRoutes_1.default);
    app.use("/api/issues", assetIssue_1.default);
    app.use("/api/company-admin", companyAdminRoutes_1.default);
    // Static folders
    app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
    app.use("/defaults", express_1.default.static(path_1.default.join(process.cwd(), "public", "defaults")));
    app.use("/api/manuals", express_1.default.static(path_1.default.join(process.cwd(), "public", "manuals"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".pdf")) {
                res.setHeader("Content-Type", "application/pdf");
            }
        },
    }));
    console.log("STATIC PATH:", path_1.default.join(process.cwd(), "uploads"));
    console.log("Serving manuals from:", path_1.default.join(process.cwd(), "public", "manuals"));
    app.use("/api/dropdown", dropdown_1.default);
    app.use("/reports", reports_1.default);
    // ⭐ FIXED: Correctly closed /manuals-test route
    app.get("/manuals-test", (req, res) => {
        const fs = require("fs");
        const dir = path_1.default.join(process.cwd(), "public", "manuals");
        console.log("Checking folder:", dir);
        try {
            const files = fs.readdirSync(dir);
            console.log("Files found:", files);
            return res.json({ dir, files });
        }
        catch (err) {
            if (err instanceof Error) {
                console.error("Error reading folder:", err.message);
                return res.status(500).json({ error: err.message });
            }
            console.error("Unknown error:", err);
            return res.status(500).json({ error: "Unknown error" });
        }
    });
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✅ Backend running on port ${PORT}`);
        (0, systemCron_1.startCronJobs)();
    });
    return app;
}
// Run bootstrap
bootstrap();
exports.default = {};
//# sourceMappingURL=index.js.map