"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = getHealthStatus;
const prisma_1 = require("../lib/prisma");
async function getHealthStatus() {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return {
            status: 'ok',
            database: 'up',
            timestamp: new Date().toISOString()
        };
    }
    catch {
        return {
            status: 'error',
            database: 'down',
            timestamp: new Date().toISOString()
        };
    }
}
