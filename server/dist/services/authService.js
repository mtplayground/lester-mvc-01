"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return secret;
}
const jwtSecret = getJwtSecret();
const jwtSignOptions = {
    expiresIn: JWT_EXPIRES_IN
};
class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }
}
exports.AuthError = AuthError;
function signToken(userId, email) {
    return jsonwebtoken_1.default.sign({ sub: userId, email }, jwtSecret, jwtSignOptions);
}
async function registerUser(input) {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (existingUser) {
        throw new AuthError('Email already registered', 409);
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, SALT_ROUNDS);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
            name: input.name
        }
    });
    return {
        token: signToken(user.id, user.email)
    };
}
async function loginUser(input) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (!user) {
        throw new AuthError('Invalid email or password', 401);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new AuthError('Invalid email or password', 401);
    }
    return {
        token: signToken(user.id, user.email)
    };
}
