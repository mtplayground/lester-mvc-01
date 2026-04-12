"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskActivityFeed = getTaskActivityFeed;
const activityService_1 = require("../services/activityService");
async function getTaskActivityFeed(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId } = req.query;
    try {
        const activities = await (0, activityService_1.listTaskActivities)(req.authUser.id, taskId);
        res.status(200).json(activities);
    }
    catch (error) {
        if (error instanceof activityService_1.ActivityError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
