"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
const healthService_1 = require("../services/healthService");
const validators_1 = require("../validators");
async function getHealth(_req, res) {
    const health = validators_1.HealthStatusSchema.parse(await (0, healthService_1.getHealthStatus)());
    if (health.status === 'ok') {
        res.status(200).json(health);
        return;
    }
    res.status(503).json(health);
}
