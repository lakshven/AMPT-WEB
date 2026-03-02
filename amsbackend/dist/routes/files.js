"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filesController_1 = require("../controllers/filesController");
const router = (0, express_1.Router)();
// ⭐ Support frontend URL: /files/excel/:type/:id
router.get("/excel/:type/:id", (req, res) => {
    return (0, filesController_1.streamExcel)(req, res);
});
// ⭐ Support backend URL: /files/:type/:id
router.get("/:type/:id", (req, res) => {
    return (0, filesController_1.streamExcel)(req, res);
});
exports.default = router;
//# sourceMappingURL=files.js.map