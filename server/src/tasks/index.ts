import { startEventCron } from "./events.js";
import { cleanPendingEventRegs } from "./pendingEventRegistrations.js";

export function startCronJobs() {
    cleanPendingEventRegs();
    startEventCron();
}
