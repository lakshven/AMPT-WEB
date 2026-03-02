"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getStaticOptions;
async function getStaticOptions(req, res) {
    try {
        const range = (n) => Array.from({ length: n + 1 }, (_, i) => i.toString());
        const range1to = (n) => Array.from({ length: n }, (_, i) => `${i + 1}`);
        res.json({
            // spans: range(10),
            structure_type: ["Bridge", "Tunnel", "Culvert"],
            material_type: ["Steel", "Concrete", "Wood"],
            work_item: ["Fractures", "Spalled masonry", "Open joints"],
            current_likelihood: range1to(10),
            current_severity: range1to(10),
            current_rating: range1to(10),
            mitigation_likelihood: range1to(10),
            mitigation_severity: range1to(10),
            mitigation_rating: range1to(10),
            status: ["Active", "Inactive", "Under Review", "Complete"],
            carries: ["Rail over water"],
            possible_consequence: ["Loss of Strength", "Loss of Mortar"],
            // Exam Regime
            detailed_exam_years: Array.from({ length: 15 }, (_, i) => `${i + 1} year`),
        });
    }
    catch (err) {
        console.error("Dropdown options error:", err);
        res.status(500).json({ error: "Error fetching dropdown options" });
    }
}
//# sourceMappingURL=dropDownController.js.map