"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeletedValues = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const getDeletedValues = async (req, res) => {
    try {
        // Ensure category is always a string
        const category = Array.isArray(req.params.category)
            ? req.params.category[0]
            : req.params.category;
        const categoryRecord = await client_1.default.dropdownCategory.findUnique({
            where: { name: category }
        });
        if (!categoryRecord) {
            return res.status(404).json({ error: "Category not found" });
        }
        const deletedValues = await client_1.default.dropdownValue.findMany({
            where: {
                categoryId: categoryRecord.id,
                isDeleted: true
            },
            orderBy: { value: "asc" }
        });
        res.json({ deleted: deletedValues.map(v => v.value) });
    }
    catch (error) {
        console.error("Error fetching deleted values:", error);
        res.status(500).json({ error: "Failed to fetch deleted values" });
    }
};
exports.getDeletedValues = getDeletedValues;
//# sourceMappingURL=getDeletedValues.js.map