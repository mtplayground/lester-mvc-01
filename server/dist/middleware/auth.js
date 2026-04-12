"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return secret;
}
const jwtSecret = getJwtSecret();
async function requireAuth(req, res, next) {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const token = authorizationHeader.slice('Bearer '.length).trim();
    try {
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!payload.sub) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.authUser = user;
        next();
    }
    catch {
        res.status(401).json({ message: 'Unauthorized' });
    }
}
