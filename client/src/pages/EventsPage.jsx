import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { ErrorAlert } from "../components/ErrorAlert";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { EventCard } from "../components/EventCard";
import api from "../lib/api";

export default function EventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get("/events");
                setEvents(res.data.events || []);
            } catch (err) {
                if (err.response?.status === 403) {
                    setEvents([]);
                } else {
                    setError(
                        err.response?.data?.error || "Failed to load events",
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <DashboardLayout>
            <PageMeta title="Events | ClubSphere" />

            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <div className="mb-1 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                            <CalendarDays className="h-5 w-5 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#f0f0ff]">
                            Events
                        </h1>
                    </div>
                    <p className="ml-12 text-sm text-[#555577]">
                        Events happening across clubs at your college
                    </p>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Spinner className="h-7 w-7 text-blue-500" />
                    </div>
                )}

                {!loading && error && <ErrorAlert message={error} />}

                {!loading && !error && events.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1e1e3a] bg-[#1a1a2e]">
                            <CalendarDays className="h-7 w-7 text-[#555577]" />
                        </div>
                        <h3 className="mb-2 font-semibold text-[#f0f0ff]">
                            No events yet
                        </h3>
                        <p className="text-sm text-[#555577]">
                            Clubs at your college have not scheduled events yet.
                        </p>
                    </div>
                )}

                {!loading && !error && events.length > 0 && (
                    <div className="space-y-5">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onClick={() => navigate(`/events/${event.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
