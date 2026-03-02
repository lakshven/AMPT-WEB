// index.ts
import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cors from "cors";
import corsOptions from "./middleware/corsConfig";
import { userActivityLogger } from "./middleware/userActivityLogger";


import authRoutes from "./routes/authRoutes";
import assetRoutes from "./routes/assets";
import filesRouter from "./routes/files";

import meRoutes from "./routes/meRoutes";
import startupRoutes from "./routes/startupRoutes";
import adminRoleRoutes from "./routes/admin";
import adminAnalyticsRoutes from "./routes/adminRoutes";
import usersRoutes from "./routes/userRoutes";
import dashBoardRoutes from "./routes/dashboardRoutes";
import dropdownRoutes from "./routes/dropdown";
import reports from "./routes/reports";
import uploadRoutes from "./routes/uploads";

import clientGroupsRoutes from "./routes/clientGroupsRoutes";
import assetIssueRoutes from "./routes/assetIssue";
import { getDepartments } from "./controllers/department/departmentController";
import auditRoutes from "./routes/auditRoutes";
import companyAdminRoutes from "./routes/companyAdminRoutes"; // ⭐ ADD THIS
import "./scheduler/systemCron";
import { attachUserContext } from "./middleware/auth";

// ⭐ CommonJS provides __dirname automatically — do NOT redefine it
const app: Application = express();
app.set("trust proxy", 1); // Trust Cloudflare reverse proxy

// ⭐ FIRST: allow Cloudflared temporary URLs
app.use(
  cors({
    origin: true,        // reflect the incoming origin
    credentials: true,   // allow cookies
  })
);

app.use(corsOptions);
app.use(express.json());

// API Routes
app.use("/files", filesRouter);
app.use("/api/auth", authRoutes);
app.use(attachUserContext); // ⭐ Attach user context for all routes after this
app.use(userActivityLogger);

app.use("/api", startupRoutes);
app.use("/api/users", usersRoutes);

app.use("/api/admin", adminRoleRoutes);
app.use("/api/admin", adminAnalyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/me", meRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/dashboard", dashBoardRoutes);
app.use("/api/client-groups", clientGroupsRoutes);
app.get("/departments", getDepartments);
app.use("/api/audit-logs", auditRoutes);   // ⭐ ADD THIS LINE
app.use("/api/issues", assetIssueRoutes);
// ⭐ Company Admin Route
app.use("/api/company-admin", companyAdminRoutes); // ⭐ REQUIRED
// const rootDir = process.cwd();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/defaults", express.static(path.join(process.cwd(), "public", "defaults")));
app.use(
  "/manuals",
  express.static(path.join(__dirname, "public", "manuals"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      }
    }
  })
);
console.log("STATIC PATH:", path.join(process.cwd(), "uploads"));
console.log("Serving manuals from:", path.join(__dirname, "public", "manuals"));
// Static dropdown route
app.use("/api/dropdown", dropdownRoutes);
app.use("/reports", reports);
// ⭐ Add this test route HERE
app.get("/manuals-test", (req, res) => {
  const fs = require("fs");
  const dir = path.join(__dirname, "public", "manuals");

  console.log("Checking folder:", dir);

  try {
    const files = fs.readdirSync(dir);
    console.log("Files found:", files);
    res.json({ dir, files });
  } catch (err) {
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

export default app;