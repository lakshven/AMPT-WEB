"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const metricsService_1 = require("../services/metricsService");
const getStats = async (req, res) => {
    try {
        const stats = await (0, metricsService_1.getSystemMetrics)();
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load stats" });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=systemStatsController.js.map