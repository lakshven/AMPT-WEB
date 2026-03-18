// controllers/audit/exportLogs.ts
import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { Parser } from "json2csv";
import ExcelJS from "exceljs";

export async function exportAuditLogsCSV(req: Request, res: Response) {
  try {
    const logs = await prismaClient().audit.findMany({
      orderBy: { createdAt: "desc" }
    });

    const parser = new Parser();
    const csv = parser.parse(logs);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=audit_logs.csv");
    return res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function exportAuditLogsExcel(req: Request, res: Response) {
  try {
    const logs = await prismaClient().audit.findMany({
      orderBy: { createdAt: "desc" }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Audit Logs");

    sheet.columns = [
      { header: "ID", key: "id" },
      { header: "Action", key: "action" },
      { header: "Target Type", key: "targetType" },
      { header: "Target ID", key: "targetId" },
      { header: "Performed By", key: "performedBy" },
      { header: "Client Group", key: "clientGroupId" },
      { header: "Metadata", key: "metadata" },
      { header: "Created At", key: "createdAt" }
    ];

    logs.forEach((log) => {
      sheet.addRow({
        ...log,
        metadata: JSON.stringify(log.metadata)
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats");
    res.setHeader("Content-Disposition", "attachment; filename=audit_logs.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}