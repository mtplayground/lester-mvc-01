"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const validators_1 = require("../validators");
const healthRoutes = (0, express_1.Router)();
healthRoutes.get('/health', (0, validators_1.validateRequest)({ query: validators_1.EmptyQuerySchema }), healthController_1.getHealth);
exports.default = healthRoutes;
