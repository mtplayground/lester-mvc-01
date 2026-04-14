"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminUser = ensureAdminUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./prisma");
const SALT_ROUNDS = 12;
function getAdminConfig() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD?.trim();
    const name = process.env.ADMIN_NAME?.trim() || 'Admin User';
    if (!email || !password) {
        return null;
    }
    if (password.length < 8 || password.length > 72) {
        throw new Error('ADMIN_PASSWORD must be between 8 and 72 characters');
    }
    return { email, password, name };
}
async function ensureAdminUser() {
    const admin = getAdminConfig();
    if (!admin) {
        return;
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: admin.email }
    });
    if (existingUser) {
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(admin.password, SALT_ROUNDS);
    await prisma_1.prisma.user.create({
        data: {
            email: admin.email,
            passwordHash,
            name: admin.name
        }
    });
    console.log(`Bootstrapped admin user: ${admin.email}`);
}
