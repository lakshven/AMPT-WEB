"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = restoreAll;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const dropDownController_1 = __importDefault(require("./dropDownController"));
const Audit_1 = require("../../models/Audit");
async function restoreAll(req, res) {
    try {
        const category = Array.isArray(req.params.category)
            ? req.params.category[0]
            : req.params.category;
        // 1️⃣ Validate category
        const cat = await prismaClient().dropdownCategory.findUnique({
            where: { name: category }
        });
        if (!cat) {
            return res.status(404).json({ error: "Category not found" });
        }
        // 2️⃣ Restore all deleted values
        const result = await prismaClient().dropdownValue.updateMany({
            where: {
                categoryId: cat.id,
                isDeleted: true
            },
            data: {
                isDeleted: false
            }
        });
        if (result.count === 0) {
            return res
                .status(404)
                .json({ error: "No deleted values to restore for this category" });
        }
        const actor = req.user?.username ||
            req.user?.email ||
            "system";
        // 3️⃣ Audit log
        await (0, Audit_1.logAudit)({
            action: "dropdown_change",
            targetType: "dropdown_category",
            targetId: cat.id,
            performedBy: actor,
            actorUserId: req.user?.id || null,
            clientGroupId: req.user?.clientGroupId || null,
            companyId: req.user?.companyId ?? null, // ← REQUIRED
            details: {
                category,
                operation: "restore_all",
                restoredCount: result.count
            }
        });
        // 4️⃣ Load updated dropdowns
        const categories = await prismaClient().dropdownCategory.findMany({
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
        console.error("Restore all dropdown values error:", err);
        res.status(500).json({ error: "Failed to restore all values" });
    }
}
//# sourceMappingURL=restoreAll.js.map