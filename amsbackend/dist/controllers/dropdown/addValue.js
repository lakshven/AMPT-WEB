"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addValue;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const dropDownController_1 = __importDefault(require("./dropDownController"));
const Audit_1 = require("../../models/Audit");
async function addValue(req, res) {
    try {
        const rawCategory = req.params.category;
        const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
        const { value } = req.body;
        if (!value || !category) {
            return res.status(400).json({ error: "Missing category or value" });
        }
        // 1️⃣ Validate category
        const cat = await prismaClient().dropdownCategory.findUnique({
            where: { name: category }
        });
        if (!cat) {
            return res.status(404).json({ error: "Category not found" });
        }
        const actor = req.user?.username ||
            req.user?.email ||
            "system";
        const actorUserId = req.user?.id || null;
        const clientGroupId = req.user?.clientGroupId || null;
        const companyId = req.user?.companyId ?? null; // ← REQUIRED
        // 2️⃣ Prevent duplicates (active)
        const existingActive = await prismaClient().dropdownValue.findFirst({
            where: {
                categoryId: cat.id,
                value,
                isDeleted: false
            }
        });
        if (existingActive) {
            return res.status(400).json({ error: "Value already exists" });
        }
        // 3️⃣ If soft‑deleted → restore instead of creating new
        const existingDeleted = await prismaClient().dropdownValue.findFirst({
            where: {
                categoryId: cat.id,
                value,
                isDeleted: true
            }
        });
        let finalValueId = null;
        let operation = "create";
        if (existingDeleted) {
            const updated = await prismaClient().dropdownValue.update({
                where: { id: existingDeleted.id },
                data: { isDeleted: false }
            });
            finalValueId = updated.id;
            operation = "restore";
        }
        else {
            const created = await prismaClient().dropdownValue.create({
                data: {
                    value,
                    categoryId: cat.id
                }
            });
            finalValueId = created.id;
            operation = "create";
        }
        // 4️⃣ Audit log
        await (0, Audit_1.logAudit)({
            action: "dropdown_change",
            targetType: "dropdown_value",
            targetId: finalValueId,
            performedBy: actor,
            actorUserId,
            clientGroupId,
            companyId,
            details: {
                category,
                value,
                operation
            }
        });
        // 5️⃣ Load dynamic dropdowns
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
        res.json({
            success: true,
            dropdowns: {
                ...staticOptions,
                ...dynamicOptions
            }
        });
    }
    catch (err) {
        console.error("Add dropdown value error:", err);
        res.status(500).json({ error: "Failed to add value" });
    }
}
//# sourceMappingURL=addValue.js.map