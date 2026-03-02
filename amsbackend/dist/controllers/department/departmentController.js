"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartments = getDepartments;
async function getDepartments(req, res) {
    try {
        const departments = [
            "Roads",
            "Bridges",
            "Water",
            "Buildings",
            "Electrical",
            "Mechanical",
            "Civil",
            "Transport",
            "Utilities",
            "Other (Type Manually)"
        ];
        return res.json({ success: true, departments });
    }
    catch (error) {
        console.error("Error loading departments:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
//# sourceMappingURL=departmentController.js.map