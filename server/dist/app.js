"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', routes_1.default);
const clientDistPath = path_1.default.resolve(__dirname, '../../client/dist');
if (fs_1.default.existsSync(clientDistPath)) {
    app.use(express_1.default.static(clientDistPath));
    app.get('*', (request, response, next) => {
        if (request.path.startsWith('/api')) {
            next();
            return;
        }
        response.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
