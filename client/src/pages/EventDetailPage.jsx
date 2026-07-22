import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    IndianRupee,
    MapPin,
    Ticket,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { ErrorAlert } from "../components/ErrorAlert";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import {
    EventMetaPill,
    EventStatusBadge,
    EventTypeBadge,
} from "../components/EventCard";
import { formatEventDateTime, formatFee } from "../lib/eventUtils";
import api from "../lib/api";

const loadRazorpayCheckout = () => {
    if (window.Razorpay) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById("razorpay-checkout-js");
        if (existingScript) {
            existingScript.addEventListener("load", resolve, { once: true });
            existingScript.addEventListener("error", reject, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.id = "razorpay-checkout-js";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () =>
            reject(new Error("Unable to load Razorpay checkout"));
        document.body.appendChild(script);
    });
};

export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [userRoleInClub, setUserRoleInClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [registrationError, setRegistrationError] = useState("");
    const [registering, setRegistering] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const canManageEvents =
        userRoleInClub === "president" || userRoleInClub === "admin";

    const fetchEvent = useCallback(async () => {
        const res = await api.get(`/events/${id}`);
        const eventData = res.data.event;
        setEvent(eventData);
        setIsRegistered(Boolean(res.data.isRegistered));

        let role = null;
        if (eventData?.club_id) {
            const clubRes = await api.get(`/clubs/${eventData.club_id}`);
            role = clubRes.data.userRoleInClub;
            setUserRoleInClub(role);
        }

        return { eventData, role };
    }, [id]);

    const fetchRegistrations = useCallback(async () => {
        try {
            setLoadingRegistrations(true);
            setRegistrationError("");
            const res = await api.get(`/events/${id}/registrations`);
            setRegistrations(res.data.registrations || []);
        } catch (err) {
            setRegistrationError(
                err.response?.data?.error || "Failed to load registrations",
            );
        } finally {
            setLoadingRegistrations(false);
        }
    }, [id]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const loaded = await fetchEvent();
                if (loaded.role === "president" || loaded.role === "admin") {
                    await fetchRegistrations();
                }
            } catch (err) {
                setError(
                    err.response?.data?.error || "Failed to load event details",
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) load();
    }, [fetchEvent, fetchRegistrations, id]);

    const canRegister = useMemo(() => {
        if (!event || isRegistered) return false;
        if (event.status !== "scheduled") return false;
        return new Date(event.start_time) > new Date();
    }, [event, isRegistered]);

    const handleRegister = async () => {
        try {
            setRegistering(true);
            setRegisterError("");

            const orderRes = await api.post("/payments/create-order", {
                purpose: "event_fee",
                eventId: id,
            });
            const order = orderRes.data;

            await loadRazorpayCheckout();

            const razorpay = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "ClubSphere",
                description: `${event.title} registration`,
                order_id: order.orderId,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#2563eb",
                },
                handler: async (response) => {
                    try {
                        await api.post("/payments/verify", {
                            paymentId: order.paymentId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        setIsRegistered(true);
                        setSuccessMessage(
                            "Payment successful. You are registered.",
                        );
                        await fetchEvent();
                        if (canManageEvents) fetchRegistrations();
                    } catch (err) {
                        setRegisterError(
                            err.response?.data?.error ||
                                "Payment succeeded, but verification failed. We will retry through webhook.",
                        );
                    } finally {
                        setRegistering(false);
                    }
                },
                modal: {
                    ondismiss: () => setRegistering(false),
                },
            });

            razorpay.on("payment.failed", (response) => {
                setRegisterError(
                    response.error?.description ||
                        "Payment failed. Please try again.",
                );
                setRegistering(false);
            });

            razorpay.open();
        } catch (err) {
            setRegisterError(
                err.response?.data?.error ||
                    err.message ||
                    "Unable to register for event",
            );
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <PageMeta title="Loading Event... | ClubSphere" />
                <div className="flex h-64 items-center justify-center">
                    <Spinner className="h-8 w-8 text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !event) {
        return (
            <DashboardLayout>
                <PageMeta title="Event Not Found | ClubSphere" />
                <div className="mx-auto max-w-4xl">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8888aa] transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <ErrorAlert message={error || "Event not found"} />
                </div>
            </DashboardLayout>
        );
    }

    const fee = Number(event.registration_fee || 0);

    return (
        <DashboardLayout>
            <PageMeta title={`${event.title} | ClubSphere`} />

            <div className="mx-auto max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8888aa] transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <article className="overflow-hidden rounded-2xl border border-[#252546] bg-[#11111d]">
                    <div className="relative h-72 bg-[#08080d] md:h-96">
                        {event.banner_url ? (
                            <img
                                src={event.banner_url}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-[#151526]">
                                <CalendarDays className="h-12 w-12 text-[#555577]" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#11111d] via-black/25 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="mb-3 flex flex-wrap gap-2">
                                <EventStatusBadge status={event.status} />
                                <EventTypeBadge type={event.event_type} />
                            </div>
                            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[#f0f0ff] md:text-4xl">
                                {event.title}
                            </h1>
                        </div>
                    </div>

                    <div className="grid gap-8 p-5 md:grid-cols-[1fr_300px] md:p-8">
                        <div className="space-y-8">
                            <section>
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#555577]">
                                    About
                                </h2>
                                <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#b2b2ce]">
                                    {event.description ||
                                        "No description has been added for this event."}
                                </p>
                            </section>

                            {canManageEvents && (
                                <section className="rounded-2xl border border-[#252546] bg-[#0d0d17] p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-base font-semibold text-[#f0f0ff]">
                                                Registrations
                                            </h2>
                                            <p className="text-xs text-[#555577]">
                                                Confirmed users for this event
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
                                            {registrations.length}
                                        </span>
                                    </div>

                                    {loadingRegistrations && (
                                        <div className="flex justify-center py-8">
                                            <Spinner className="h-6 w-6 text-blue-500" />
                                        </div>
                                    )}

                                    {!loadingRegistrations &&
                                        registrationError && (
                                            <ErrorAlert
                                                message={registrationError}
                                            />
                                        )}

                                    {!loadingRegistrations &&
                                        !registrationError &&
                                        registrations.length === 0 && (
                                            <div className="py-8 text-center text-sm text-[#555577]">
                                                No registrations yet.
                                            </div>
                                        )}

                                    {!loadingRegistrations &&
                                        !registrationError &&
                                        registrations.length > 0 && (
                                            <div className="space-y-3">
                                                {registrations.map((reg) => (
                                                    <div
                                                        key={`${reg.email}-${reg.registered_at}`}
                                                        className="flex items-center gap-3 rounded-xl border border-[#1e1e3a] bg-[#11111d] p-3"
                                                    >
                                                        {reg.avatar_url ? (
                                                            <img
                                                                src={
                                                                    reg.avatar_url
                                                                }
                                                                alt={reg.name}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-400">
                                                                {reg.name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                    "U"}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold text-[#f0f0ff]">
                                                                {reg.name}
                                                            </p>
                                                            <p className="truncate text-xs text-[#555577]">
                                                                {reg.email}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-[#555577]">
                                                            {new Date(
                                                                reg.registered_at,
                                                            ).toLocaleDateString(
                                                                "en-IN",
                                                                {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </section>
                            )}
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-2xl border border-[#252546] bg-[#0d0d17] p-5">
                                <div className="space-y-4">
                                    <EventMetaPill icon={Building2}>
                                        {event.club_name}
                                    </EventMetaPill>
                                    <EventMetaPill icon={CalendarDays}>
                                        {formatEventDateTime(
                                            event.start_time,
                                            event.end_time,
                                        )}
                                    </EventMetaPill>
                                    <EventMetaPill icon={MapPin}>
                                        {event.location || "Venue TBA"}
                                    </EventMetaPill>
                                    <EventMetaPill icon={IndianRupee}>
                                        {formatFee(event.registration_fee)}
                                    </EventMetaPill>
                                    <EventMetaPill icon={Users}>
                                        {event.max_participants
                                            ? `${event.max_participants} maximum participants`
                                            : "No participant limit"}
                                    </EventMetaPill>
                                </div>
                            </div>

                            {isRegistered ? (
                                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-300">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Registered
                                    </div>
                                    <p className="mt-1 text-sm text-green-200/80">
                                        You are confirmed for this event.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={!canRegister || registering}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-blue-200"
                                >
                                    {registering ? (
                                        <Spinner className="h-4 w-4 text-white" />
                                    ) : fee > 0 ? (
                                        <CreditCard className="h-4 w-4" />
                                    ) : (
                                        <Ticket className="h-4 w-4" />
                                    )}
                                    {registering
                                        ? "Opening..."
                                        : canRegister
                                          ? fee > 0
                                              ? `Register for ${formatFee(fee)}`
                                              : "Register for free"
                                          : "Registration closed"}
                                </button>
                            )}

                            {registerError && (
                                <p className="text-sm text-red-400">
                                    {registerError}
                                </p>
                            )}
                        </aside>
                    </div>
                </article>
            </div>

            {successMessage && (
                <div className="fixed right-4 top-6 z-[70] flex min-w-[280px] max-w-sm items-center gap-3 rounded-xl border border-gray-700 bg-[#1C1F26] px-4 py-3 shadow-2xl">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                        <UserCheck className="h-3.5 w-3.5 text-green-400" />
                    </div>
                    <p className="flex-1 text-sm font-medium text-white">
                        {successMessage}
                    </p>
                    <button
                        onClick={() => setSuccessMessage("")}
                        className="text-gray-400 transition-colors hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
