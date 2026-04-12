"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.verifyDatabaseConnection = verifyDatabaseConnection;
require("dotenv/config");
const client_1 = require("@prisma/client");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable');
}
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        datasourceUrl: databaseUrl
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
async function verifyDatabaseConnection() {
    await exports.prisma.$connect();
    await exports.prisma.$queryRaw `SELECT 1`;
}
if (process.argv[1] && process.argv[1].includes('prisma.ts')) {
    verifyDatabaseConnection()
        .then(async () => {
        console.log('Database connection verified');
        await exports.prisma.$disconnect();
    })
        .catch(async (error) => {
        console.error('Database connection failed');
        console.error(error);
        await exports.prisma.$disconnect();
        process.exit(1);
    });
}
