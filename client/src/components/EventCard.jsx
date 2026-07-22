import {
    AlertCircle,
    CalendarDays,
    Clock,
    IndianRupee,
    MapPin,
    Tag,
} from "lucide-react";
import {
    EVENT_STATUS_META,
    EVENT_TYPE_META,
    eventTypeLabel,
    formatEventDateTime,
    formatFee,
} from "../lib/eventUtils";

export function EventStatusBadge({ status }) {
    const meta = EVENT_STATUS_META[status] || {
        ...EVENT_STATUS_META.unknown,
        label: status || "Unknown",
        icon: AlertCircle,
    };
    const Icon = meta.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.cls}`}
        >
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
        </span>
    );
}

export function EventTypeBadge({ type }) {
    const key = String(type || "other").toLowerCase();
    const cls = EVENT_TYPE_META[key] || EVENT_TYPE_META.other;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cls}`}
        >
            <Tag className="w-3.5 h-3.5" />
            {eventTypeLabel(type)}
        </span>
    );
}

export function EventMetaPill({ icon: Icon, children }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-[#8888aa]">
            <Icon className="w-3.5 h-3.5 text-[#555577]" />
            {children}
        </span>
    );
}

export function EventCard({ event, onClick, actions, variant = "feed" }) {
    const hasFee = Number(event.registration_fee || 0) > 0;
    const heightClass = variant === "large" ? "h-56" : "h-52";

    return (
        <article
            onClick={onClick}
            className="group overflow-hidden rounded-2xl border border-[#252546] bg-[#11111d] transition-colors duration-200 hover:border-[#36365f]"
        >
            <div className={`relative bg-[#08080d] ${heightClass}`}>
                {event.banner_url ? (
                    <img
                        src={event.banner_url}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#151526]">
                        <CalendarDays className="h-10 w-10 text-[#555577]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#11111d] via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <EventStatusBadge status={event.status || "scheduled"} />
                    <EventTypeBadge type={event.event_type} />
                </div>
                {actions && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-4 top-4"
                    >
                        {actions}
                    </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-[#f0f0ff] transition-colors group-hover:text-blue-300">
                        {event.title}
                    </h2>
                    {event.club_name && (
                        <p className="mt-1 truncate text-xs font-medium text-[#b2b2ce]">
                            {event.club_name}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <EventMetaPill icon={Clock}>
                        {formatEventDateTime(event.start_time, event.end_time)}
                    </EventMetaPill>
                    <EventMetaPill icon={MapPin}>
                        {event.location || "Venue TBA"}
                    </EventMetaPill>
                    <EventMetaPill icon={IndianRupee}>
                        {hasFee ? formatFee(event.registration_fee) : "Free"}
                    </EventMetaPill>
                </div>
            </div>
        </article>
    );
}
