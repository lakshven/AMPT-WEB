"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deleteValue;
const client_1 = __importDefault(require("../../prisma/client"));
const dropDownController_1 = __importDefault(require("./dropDownController"));
const Audit_1 = require("../../models/Audit");
async function deleteValue(req, res) {
    try {
        const rawCategory = req.params.category;
        const rawValue = req.params.value;
        const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
        const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
        // 1️⃣ Validate category
        const cat = await client_1.default.dropdownCategory.findUnique({
            where: { name: category }
        });
        if (!cat) {
            return res.status(404).json({ error: "Category not found" });
        }
        // 2️⃣ Find active value
        const existing = await client_1.default.dropdownValue.findFirst({
            where: {
                categoryId: cat.id,
                value,
                isDeleted: false
            }
        });
        if (!existing) {
            return res.status(404).json({ error: "Value not found or already deleted" });
        }
        // 3️⃣ Check if value is used in assets
        const assetsUsingValue = await client_1.default.assets.findMany({
            where: {
                [category]: value
            }
        });
        if (assetsUsingValue.length > 0) {
            return res.status(400).json({
                error: `Cannot delete. Value "${value}" is used in ${assetsUsingValue.length} asset records.`
            });
        }
        // 4️⃣ Soft delete
        const deleted = await client_1.default.dropdownValue.update({
            where: { id: existing.id },
            data: { isDeleted: true }
        });
        const actor = req.user?.username ||
            req.user?.email ||
            "system";
        // 5️⃣ Audit log
        await (0, Audit_1.logAudit)({
            action: "dropdown_change",
            targetType: "dropdown_value",
            targetId: deleted.id,
            performedBy: actor,
            actorUserId: req.user?.id || null,
            clientGroupId: req.user?.clientGroupId || null,
            companyId: req.user?.companyId ?? null, // ← REQUIRED
            details: {
                category,
                value,
                operation: "delete"
            }
        });
        // 5️⃣ Load dynamic dropdowns
        const categories = await client_1.default.dropdownCategory.findMany({
            include: {
                values: {
                    where: { isDeleted: false },
                    orderBy: { value: "asc" }
                }
            }
        });
        const dynamicOptions = {};
        categories.forEach((c) => {
            dynamicOptions[c.name] = c.values.map((v) => v.value);
        });
        // 6️⃣ Load static dropdowns
        const staticOptions = await (async () => {
            return new Promise((resolve) => {
                const fakeReq = {};
                const fakeRes = {
                    json: (data) => resolve(data)
                };
                (0, dropDownController_1.default)(fakeReq, fakeRes);
            });
        })();
        // 7️⃣ Merge static + dynamic
        const finalDropdowns = {
            ...staticOptions,
            ...dynamicOptions
        };
        res.json({
            success: true,
            dropdowns: finalDropdowns
        });
    }
    catch (err) {
        console.error("Delete dropdown value error:", err);
        res.status(500).json({ error: "Failed to delete value" });
    }
}
//# sourceMappingURL=deleteValue.js.map