import cron from "node-cron";
import { deletePendingEventRegistrations } from "../db/queries/eventPaymentQueries.js";

export function cleanPendingEventRegs() {
    cron.schedule("* * * * *", async () => {
        try {
            const deleted = await deletePendingEventRegistrations();

            if (deleted.length > 0) {
                console.log(
                    `Deleted ${deleted.length} expired event reservations.`,
                );
            }
        } catch (err) {
            console.error("Failed to clean expired event reservations:", err);
        }
    });
}
