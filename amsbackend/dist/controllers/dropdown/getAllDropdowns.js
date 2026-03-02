"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getAllDropdowns;
const client_1 = __importDefault(require("../../prisma/client"));
const dropDownController_1 = __importDefault(require("./dropDownController"));
async function getAllDropdowns(req, res) {
    try {
        // 1️⃣ Load STATIC dropdowns
        const staticOptions = await (async () => {
            return new Promise((resolve) => {
                const fakeReq = {};
                const fakeRes = {
                    json: (data) => resolve(data)
                };
                (0, dropDownController_1.default)(fakeReq, fakeRes);
            });
        })();
        // 2️⃣ Load DYNAMIC dropdowns (only non-deleted values)
        const categories = await client_1.default.dropdownCategory.findMany({
            include: {
                values: {
                    where: { isDeleted: false },
                    orderBy: { value: "asc" }
                }
            }
        });
        const dynamicOptions = {};
        categories.forEach(((cat) => {
            dynamicOptions[cat.name] = cat.values.map((v) => v.value);
        }));
        // 3️⃣ Merge STATIC + DYNAMIC
        const finalDropdowns = {
            ...staticOptions,
            ...dynamicOptions
        };
        res.json(finalDropdowns);
    }
    catch (err) {
        console.error("Unified dropdown fetch error:", err);
        res.status(500).json({ error: "Failed to load dropdowns" });
    }
}
//# sourceMappingURL=getAllDropdowns.js.map