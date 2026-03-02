"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filesController_1 = require("../controllers/filesController");
const router = (0, express_1.Router)();
// ✅ Stream Excel or fallback file
router.get("/:type/:id", (req, res) => {
    return (0, filesController_1.streamExcel)(req, res);
});
exports.default = router;
//# sourceMappingURL=reports.js.map