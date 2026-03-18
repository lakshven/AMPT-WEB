"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeletedValues = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const getDeletedValues = async (req, res) => {
    try {
        // Ensure category is always a string
        const category = Array.isArray(req.params.category)
            ? req.params.category[0]
            : req.params.category;
        const categoryRecord = await prismaClient().dropdownCategory.findUnique({
            where: { name: category }
        });
        if (!categoryRecord) {
            return res.status(404).json({ error: "Category not found" });
        }
        const deletedValues = await prismaClient().dropdownValue.findMany({
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