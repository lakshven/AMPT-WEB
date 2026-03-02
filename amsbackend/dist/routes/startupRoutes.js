"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const startupController_1 = require("../controllers/startup/startupController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/startup", auth_1.attachUserContext, startupController_1.getStartupOptions);
exports.default = router;
//# sourceMappingURL=startupRoutes.js.map