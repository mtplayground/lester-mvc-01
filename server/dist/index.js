"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const bootstrapAdmin_1 = require("./lib/bootstrapAdmin");
const prisma_1 = require("./lib/prisma");
const port = Number(process.env.PORT ?? 3000);
async function startServer() {
    try {
        await (0, prisma_1.verifyDatabaseConnection)();
        await (0, bootstrapAdmin_1.ensureAdminUser)();
        app_1.default.listen(port, '0.0.0.0', () => {
            console.log(`Server listening on http://0.0.0.0:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server due to database connection error');
        console.error(error);
        process.exit(1);
    }
}
void startServer();
