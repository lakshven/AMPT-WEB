"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAlertsAsRead = exports.listAlerts = exports.createAlert = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const alertsService_1 = require("../../services/alertsService");
const createAlert = async (req, res) => {
    try {
        const { type, message, severity } = req.body;
        const alert = await prismaClient().systemAlert.create({
            data: { type, message, severity }
        });
        res.json(alert);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create alert" });
    }
};
exports.createAlert = createAlert;
const listAlerts = async (req, res) => {
    try {
        const alerts = await (0, alertsService_1.getAlerts)();
        res.json(alerts);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load alerts" });
    }
};
exports.listAlerts = listAlerts;
const markAlertsAsRead = async (req, res) => {
    try {
        const { ids } = req.body;
        await (0, alertsService_1.markAlertsRead)(ids);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to mark alerts read" });
    }
};
exports.markAlertsAsRead = markAlertsAsRead;
//# sourceMappingURL=alertsController.js.map