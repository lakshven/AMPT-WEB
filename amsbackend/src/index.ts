// index.ts
// ⭐ Load Key Vault FIRST — and WAIT for it before anything else
import { loadSecrets } from "./keyvault";
import express, { Application } from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
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
import companyAdminRoutes from "./routes/companyAdminRoutes";
import { attachUserContext } from "./middleware/auth";
import { startCronJobs } from "./scheduler/systemCron";
import workItemsRoutes from "./routes/workItemRoutes";
import { verifyInviteToken } from "./controllers/clientGroups/verifyInviteToken";
import { getPrisma } from "./prisma/client";

// ⭐ Wrap everything in an async bootstrap function
async function bootstrap() {
  dotenv.config();

  // ⭐ WAIT for Key Vault secrets BEFORE Prisma loads anywhere
  await loadSecrets();
  console.log("🔥 DATABASE_URL LOADED:", process.env.DATABASE_URL);

  const app: Application = express();
  app.set("trust proxy", 1);

  // ⭐ Use ONLY corsOptions
  app.use(corsOptions);
  app.use(express.json());

  // ⭐ CORRECT STATIC PATH FOR UPLOADS (WORKS IN LOCAL + PRODUCTION)
  const uploadsPath = path.join(process.cwd(), "uploads");
  console.log("Serving uploads from:", uploadsPath);
 
  // Static folders
  app.use( "/uploads",
    express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      // Allow browser to open files instead of forcing download
      res.setHeader("Content-Disposition", "inline");

      // PDF
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      }

      // Excel (xlsx)
      if (filePath.endsWith(".xlsx")) {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
      }

      // Excel (xls)
      if (filePath.endsWith(".xls")) {
        res.setHeader("Content-Type", "application/vnd.ms-excel");
      }

      // Word (docx)
      if (filePath.endsWith(".docx")) {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
      }

      // Word (doc)
      if (filePath.endsWith(".doc")) {
        res.setHeader("Content-Type", "application/msword");
      }
     }
     })
   );

  app.use("/defaults", express.static(path.join(process.cwd(), "public", "defaults")));

  app.use(
    "/api/manuals",
    express.static(path.join(process.cwd(), "public", "manuals"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".pdf")) {
          res.setHeader("Content-Type", "application/pdf");
        }
      },
    })
  );
  // API Routes
  app.use("/files", filesRouter);
  app.use("/api/auth", authRoutes);
  app.get("/api/client-groups/verify-invite-token", verifyInviteToken);  
  app.use(attachUserContext);
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
  app.use("/api/audit-logs", auditRoutes);
  app.use("/api/work-items", workItemsRoutes);
  app.use("/api/issues", assetIssueRoutes);
  app.use("/api/company-admin", companyAdminRoutes);

  console.log("STATIC PATH:", path.join(process.cwd(), "uploads"));
  console.log("Serving manuals from:", path.join(process.cwd(), "public", "manuals"));

  app.use("/api/dropdown", dropdownRoutes);
  app.use("/reports", reports);

  // Manual test route
  app.get("/manuals-test", (req, res) => {
    const dir = path.join(process.cwd(), "public", "manuals");

    console.log("Checking folder:", dir);

    try {
      const files = fs.readdirSync(dir);
      console.log("Files found:", files);
      return res.json({ dir, files });
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

  app.listen(PORT, async () => {
    console.log(`✅ Backend running on port ${PORT}`);
    await getPrisma().$connect();
    console.log("⏳ Delayed cron startup...");
    startCronJobs();
  });

  return app;
}

// Run bootstrap
bootstrap();

export default {};
