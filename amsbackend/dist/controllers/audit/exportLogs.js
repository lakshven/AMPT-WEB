"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAuditLogsCSV = exportAuditLogsCSV;
exports.exportAuditLogsExcel = exportAuditLogsExcel;
const client_1 = __importDefault(require("../../prisma/client"));
const json2csv_1 = require("json2csv");
const exceljs_1 = __importDefault(require("exceljs"));
async function exportAuditLogsCSV(req, res) {
    try {
        const logs = await client_1.default.audit.findMany({
            orderBy: { createdAt: "desc" }
        });
        const parser = new json2csv_1.Parser();
        const csv = parser.parse(logs);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=audit_logs.csv");
        return res.send(csv);
    }
    catch (err) {
        console.error("CSV export error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function exportAuditLogsExcel(req, res) {
    try {
        const logs = await client_1.default.audit.findMany({
            orderBy: { createdAt: "desc" }
        });
        const workbook = new exceljs_1.default.Workbook();
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
    }
    catch (err) {
        console.error("Excel export error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=exportLogs.js.map