"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendMail({ to, subject, html }) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Unable to send email");
    }
}
//# sourceMappingURL=sendEmail.js.map