"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
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
const companyAdminRoutes_1 = __importDefault(require("./routes/companyAdminRoutes")); // ⭐ ADD THIS
require("./scheduler/systemCron");
const auth_1 = require("./middleware/auth");
// ⭐ CommonJS provides __dirname automatically — do NOT redefine it
const app = (0, express_1.default)();
app.set("trust proxy", 1); // Trust Cloudflare reverse proxy
// ⭐ FIRST: allow Cloudflared temporary URLs
app.use((0, cors_1.default)({
    origin: true, // reflect the incoming origin
    credentials: true, // allow cookies
}));
app.use(corsConfig_1.default);
app.use(express_1.default.json());
// API Routes
app.use("/files", files_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use(auth_1.attachUserContext); // ⭐ Attach user context for all routes after this
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
app.use("/api/audit-logs", auditRoutes_1.default); // ⭐ ADD THIS LINE
app.use("/api/issues", assetIssue_1.default);
// ⭐ Company Admin Route
app.use("/api/company-admin", companyAdminRoutes_1.default); // ⭐ REQUIRED
// const rootDir = process.cwd();
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use("/defaults", express_1.default.static(path_1.default.join(process.cwd(), "public", "defaults")));
app.use("/manuals", express_1.default.static(path_1.default.join(__dirname, "public", "manuals"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".pdf")) {
            res.setHeader("Content-Type", "application/pdf");
        }
    }
}));
console.log("STATIC PATH:", path_1.default.join(process.cwd(), "uploads"));
console.log("Serving manuals from:", path_1.default.join(__dirname, "public", "manuals"));
// Static dropdown route
app.use("/api/dropdown", dropdown_1.default);
app.use("/reports", reports_1.default);
// ⭐ Add this test route HERE
app.get("/manuals-test", (req, res) => {
    const fs = require("fs");
    const dir = path_1.default.join(__dirname, "public", "manuals");
    console.log("Checking folder:", dir);
    try {
        const files = fs.readdirSync(dir);
        console.log("Files found:", files);
        res.json({ dir, files });
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
});
exports.default = app;
//# sourceMappingURL=index.js.map