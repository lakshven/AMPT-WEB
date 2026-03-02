"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = restoreValue;
const client_1 = __importDefault(require("../../prisma/client"));
const dropDownController_1 = __importDefault(require("./dropDownController"));
const Audit_1 = require("../../models/Audit");
async function restoreValue(req, res) {
    try {
        // ⭐ Force params to be pure strings (fixes TS2322)
        const category = Array.isArray(req.params.category)
            ? req.params.category[0]
            : req.params.category;
        const value = Array.isArray(req.params.value)
            ? req.params.value[0]
            : req.params.value;
        // 1️⃣ Validate category
        const cat = await client_1.default.dropdownCategory.findUnique({
            where: { name: category }
        });
        if (!cat) {
            return res.status(404).json({ error: "Category not found" });
        }
        // 2️⃣ Find soft-deleted value
        const existing = await client_1.default.dropdownValue.findFirst({
            where: {
                categoryId: cat.id,
                value: value,
                isDeleted: true
            }
        });
        if (!existing) {
            return res.status(404).json({ error: "Value not found or not deleted" });
        }
        // 3️⃣ Restore it
        const restored = await client_1.default.dropdownValue.update({
            where: { id: existing.id },
            data: { isDeleted: false }
        });
        const actor = req.user?.username ||
            req.user?.email ||
            "system";
        // 4️⃣ Audit log
        await (0, Audit_1.logAudit)({
            action: "dropdown_change",
            targetType: "dropdown_value",
            targetId: restored.id,
            performedBy: actor,
            actorUserId: req.user?.id || null,
            clientGroupId: req.user?.clientGroupId || null,
            companyId: req.user?.companyId ?? null, // ← REQUIRED
            details: {
                category,
                value,
                operation: "restore"
            }
        });
        // 4️⃣ Return updated dropdowns
        const categories = await client_1.default.dropdownCategory.findMany({
            include: {
                values: { where: { isDeleted: false }, orderBy: { value: "asc" } }
            }
        });
        const dynamicOptions = {};
        categories.forEach((c) => {
            dynamicOptions[c.name] = c.values.map((v) => v.value);
        });
        // Load static dropdowns
        const staticOptions = await (async () => {
            return new Promise((resolve) => {
                const fakeReq = {};
                const fakeRes = {
                    json: (data) => resolve(data)
                };
                (0, dropDownController_1.default)(fakeReq, fakeRes);
            });
        })();
        res.json({
            success: true,
            dropdowns: {
                ...staticOptions,
                ...dynamicOptions
            }
        });
    }
    catch (err) {
        console.error("Restore dropdown value error:", err);
        res.status(500).json({ error: "Failed to restore value" });
    }
}
//# sourceMappingURL=restoreValue.js.map