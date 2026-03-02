"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const corsOptions = (0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://ampt.online:3000",
        "http://www.ampt.online:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "X-Requested-With"
    ],
    credentials: false
});
exports.default = corsOptions;
//# sourceMappingURL=corsConfig.js.map