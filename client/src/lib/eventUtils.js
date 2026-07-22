import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    XCircle,
} from "lucide-react";

export const EVENT_STATUS_META = {
    scheduled: {
        label: "Scheduled",
        cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: CalendarDays,
    },
    cancelled: {
        label: "Cancelled",
        cls: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: XCircle,
    },
    completed: {
        label: "Completed",
        cls: "bg-green-500/10 text-green-400 border-green-500/20",
        icon: CheckCircle2,
    },
    unknown: {
        label: "Unknown",
        cls: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        icon: AlertCircle,
    },
};

export const EVENT_TYPE_META = {
    workshop: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    seminar: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    competition: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    fest: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    meetup: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export function formatEventDateTime(start, end) {
    if (!start) return "Date not set";

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const date = startDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const startTime = startDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const endTime = endDate?.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return endTime
        ? `${date} · ${startTime} - ${endTime}`
        : `${date} · ${startTime}`;
}

export function formatDateTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
}

export function formatFee(value) {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount <= 0) return "Free";
    return `Rs ${amount.toFixed(2)}`;
}

export function eventTypeLabel(type) {
    if (!type) return "Event";
    return type
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
