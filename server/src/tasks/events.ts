import cron from "node-cron";
import { markCompletedEvents } from "../db/queries/eventQueries.js";

export function startEventCron() {
    cron.schedule("*/5 * * * *", async () => {
        try {
            await markCompletedEvents();
            console.log("CRON - Event status updated");
        } catch (err) {
            console.error("CRON - Event update failed", err);
        }
    });
}
