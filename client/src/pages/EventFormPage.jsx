import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    Clock,
    ImageIcon,
    Info,
    MapPin,
    Save,
    Send,
    Upload,
    X,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { ErrorAlert } from "../components/ErrorAlert";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { formatDateTimeInput } from "../lib/eventUtils";
import api from "../lib/api";

const INITIAL_FORM = {
    title: "",
    description: "",
    event_type: "workshop",
    start_time: "",
    end_time: "",
    location: "",
    max_participants: "",
    registration_fee: "0",
};

const EVENT_TYPES = [
    "workshop",
    "seminar",
    "competition",
    "fest",
    "meetup",
    "other",
];

const HOURS = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
);
const MINUTES = ["00", "15", "30", "45"];

function splitDateTime(value) {
    if (!value) {
        return { date: "", hour: "09", minute: "00", period: "AM" };
    }

    const [date = "", time = "09:00"] = value.split("T");
    const [hourText = "09", minuteText = "00"] = time.split(":");
    const hour24 = Number(hourText);
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    return {
        date,
        hour: String(hour12).padStart(2, "0"),
        minute: MINUTES.includes(minuteText) ? minuteText : "00",
        period,
    };
}

function joinDateTime({ date, hour, minute, period }) {
    if (!date) return "";
    const hourNumber = Number(hour);
    const hour24 =
        period === "PM"
            ? hourNumber === 12
                ? 12
                : hourNumber + 12
            : hourNumber === 12
              ? 0
              : hourNumber;

    return `${date}T${String(hour24).padStart(2, "0")}:${minute}`;
}

// ---- dd/mm/yyyy <-> yyyy-mm-dd helpers ----

function isoToDisplay(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
}

function displayToIso(display) {
    const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return "";
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
}

function isValidIsoDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return false;
    const date = new Date(iso);
    return (
        date.getFullYear() === y &&
        date.getMonth() + 1 === m &&
        date.getDate() === d
    );
}

// Auto-inserts slashes as the user types digits: 15012026 -> 15/01/2026
function formatDateTyping(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    if (digits.length > 2) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
}

function DateTimePickerField({ id, label, value, onChange, required }) {
    const parts = splitDateTime(value);

    const [dateText, setDateText] = useState(() => isoToDisplay(parts.date));
    const [dateError, setDateError] = useState(false);
    const [prevIsoDate, setPrevIsoDate] = useState(parts.date);

    // Keep the text field in sync if the parent value changes externally
    // (e.g. loading an event in edit mode). Adjusting state during render
    // (instead of in an effect) avoids the extra cascading render pass
    // that calling setState synchronously inside an effect would cause.
    if (parts.date !== prevIsoDate) {
        setPrevIsoDate(parts.date);
        setDateText(isoToDisplay(parts.date));
        setDateError(false);
    }

    const update = (patch) => {
        onChange(joinDateTime({ ...parts, ...patch }));
    };

    const handleDateTextChange = (e) => {
        const formatted = formatDateTyping(e.target.value);
        setDateText(formatted);

        if (formatted.length < 10) {
            setDateError(false);
            return;
        }

        const iso = displayToIso(formatted);
        if (iso && isValidIsoDate(iso)) {
            setDateError(false);
            update({ date: iso });
        } else {
            setDateError(true);
        }
    };

    const handleDateBlur = () => {
        if (dateText && dateText.length < 10) {
            setDateError(true);
        }
    };

    return (
        <div className="rounded-xl border border-[#1e1e3a] bg-[#11111d] p-4">
            <label
                htmlFor={`${id}-date`}
                className="mb-2 block text-sm font-medium text-[#8888aa]"
            >
                {label} {required && <span className="text-red-400">*</span>}
            </label>

            {/* Date row */}
            <div className="mb-1 relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555577]" />
                <input
                    id={`${id}-date`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={10}
                    placeholder="dd/mm/yyyy"
                    value={dateText}
                    onChange={handleDateTextChange}
                    onBlur={handleDateBlur}
                    style={{ paddingLeft: "2.75rem" }}
                    className={`input-field w-full text-sm ${
                        dateError ? "border-red-500/60" : ""
                    }`}
                />
            </div>
            <p
                className={`mb-3 text-xs ${
                    dateError ? "text-red-400" : "text-[#555577]"
                }`}
            >
                {dateError
                    ? "Enter a valid date in DD/MM/YYYY format."
                    : "Format: DD/MM/YYYY"}
            </p>

            {/* Time row */}
            <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#666688]">
                    <Clock className="h-3.5 w-3.5" />
                    Time
                </span>
                <div className="grid grid-cols-3 gap-2">
                    <select
                        value={parts.hour}
                        onChange={(e) => update({ hour: e.target.value })}
                        className="input-field h-11 text-center text-sm"
                        aria-label={`${label} hour`}
                    >
                        {HOURS.map((hour) => (
                            <option key={hour} value={hour}>
                                {hour}
                            </option>
                        ))}
                    </select>
                    <select
                        value={parts.minute}
                        onChange={(e) => update({ minute: e.target.value })}
                        className="input-field h-11 text-center text-sm"
                        aria-label={`${label} minute`}
                    >
                        {MINUTES.map((minute) => (
                            <option key={minute} value={minute}>
                                {minute}
                            </option>
                        ))}
                    </select>
                    <select
                        value={parts.period}
                        onChange={(e) => update({ period: e.target.value })}
                        className="input-field h-11 text-center text-sm"
                        aria-label={`${label} AM or PM`}
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default function EventFormPage({ mode = "create" }) {
    const { id: clubId, eventId } = useParams();
    const navigate = useNavigate();
    const isEdit = mode === "edit";

    const [club, setClub] = useState(null);
    const [userRoleInClub, setUserRoleInClub] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const canManageEvents =
        userRoleInClub === "president" || userRoleInClub === "admin";

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setFetchError(null);

                if (!clubId || clubId === "create") {
                    setFetchError("Open a club before creating an event.");
                    return;
                }

                const clubRes = await api.get(`/clubs/${clubId}`);
                setClub(clubRes.data.club);
                setUserRoleInClub(clubRes.data.userRoleInClub);

                if (isEdit) {
                    const eventRes = await api.get(`/events/${eventId}`);
                    const event = eventRes.data.event;
                    setForm({
                        title: event.title || "",
                        description: event.description || "",
                        event_type: event.event_type || "workshop",
                        start_time: formatDateTimeInput(event.start_time),
                        end_time: formatDateTimeInput(event.end_time),
                        location: event.location || "",
                        max_participants: event.max_participants || "",
                        registration_fee: String(event.registration_fee ?? 0),
                    });
                    setBannerPreview(event.banner_url || "");
                }
            } catch (err) {
                setFetchError(
                    err.response?.data?.error ||
                        `Failed to load ${isEdit ? "event" : "club"} details`,
                );
            } finally {
                setLoading(false);
            }
        };

        if (clubId) load();
    }, [clubId, eventId, isEdit]);

    useEffect(() => {
        return () => {
            if (bannerPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [bannerPreview]);

    const validationError = useMemo(() => {
        if (!form.title.trim()) return "Event title is required.";
        if (!form.description.trim()) return "Description is required.";
        if (!form.event_type.trim()) return "Event type is required.";
        if (!form.start_time) return "Start time is required.";
        if (!form.end_time) return "End time is required.";
        if (!form.location.trim()) return "Venue is required.";
        if (new Date(form.start_time) >= new Date(form.end_time)) {
            return "End time must be after start time.";
        }
        if (!isEdit && !bannerFile) return "Event banner is required.";
        if (
            form.max_participants &&
            (!Number.isInteger(Number(form.max_participants)) ||
                Number(form.max_participants) <= 0)
        ) {
            return "Maximum participants must be a positive whole number.";
        }
        if (
            form.registration_fee === "" ||
            !Number.isFinite(Number(form.registration_fee)) ||
            Number(form.registration_fee) < 0
        ) {
            return "Registration fee must be zero or more.";
        }
        return "";
    }, [bannerFile, form, isEdit]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleNumberChange = (field) => (e) => {
        let value = e.target.value;
        if (value.length > 1 && value.startsWith("0") && value[1] !== ".") {
            value = value.replace(/^0+/, "");
        }
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const selectOnFocus = (e) => e.target.select();

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        if (bannerPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const clearBanner = () => {
        if (bannerPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerFile(null);
        setBannerPreview("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validationError) {
            setSubmitError(validationError);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (key === "max_participants" && value === "") return;
                formData.append(key, value);
            });
            if (bannerFile) {
                formData.append("banner", bannerFile);
            }

            if (isEdit) {
                await api.patch(
                    `/clubs/${clubId}/events/${eventId}`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                );
            } else {
                await api.post(`/clubs/${clubId}/events`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate(`/clubs/${clubId}?tab=events`, { replace: true });
        } catch (err) {
            setSubmitError(
                err.response?.data?.error ||
                    `Failed to ${isEdit ? "update" : "create"} event.`,
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <PageMeta
                    title={`${isEdit ? "Edit" : "Create"} Event | ClubSphere`}
                />
                <div className="flex h-64 items-center justify-center">
                    <Spinner className="h-8 w-8 text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (fetchError) {
        return (
            <DashboardLayout>
                <PageMeta
                    title={`${isEdit ? "Edit" : "Create"} Event | ClubSphere`}
                />
                <div className="mx-auto max-w-2xl">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-[#8888aa] transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <ErrorAlert message={fetchError} />
                </div>
            </DashboardLayout>
        );
    }

    if (!canManageEvents) {
        return (
            <DashboardLayout>
                <PageMeta title="Forbidden | ClubSphere" />
                <div className="mx-auto max-w-2xl">
                    <ErrorAlert message="You do not have permission to manage events for this club." />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageMeta
                title={`${isEdit ? "Edit" : "Create"} Event | ClubSphere`}
            />

            <div className="mx-auto max-w-2xl">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-lg p-2 text-[#8888aa] transition-all hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[#f0f0ff]">
                            {isEdit ? "Edit Event" : "Create Event"}
                        </h1>
                        <p className="text-sm text-[#555577]">
                            {club?.name
                                ? `${club.name} event management`
                                : "Event management"}
                        </p>
                    </div>
                </div>

                {isEdit && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div>
                            <p className="mb-0.5 text-sm font-medium text-amber-400">
                                Editing an active event
                            </p>
                            <p className="text-xs leading-relaxed text-[#8888aa]">
                                Changes are visible to everyone viewing this
                                event. Use cancel from the club Events tab for
                                destructive changes.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#8888aa]">
                            Event Banner{" "}
                            {!isEdit && <span className="text-red-400">*</span>}
                        </label>
                        <input
                            id="event-banner"
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className="hidden"
                        />

                        {bannerPreview ? (
                            <div className="group relative overflow-hidden rounded-xl border border-[#252546] bg-black">
                                <img
                                    src={bannerPreview}
                                    alt="Event banner preview"
                                    className="h-64 w-full object-cover"
                                />
                                <div className="absolute right-3 top-3 flex gap-2">
                                    <label
                                        htmlFor="event-banner"
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur transition hover:bg-blue-600"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </label>
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={clearBanner}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur transition hover:bg-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="event-banner"
                                className="flex h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2a4a] bg-[#11111d] text-[#77779b] transition hover:border-blue-500/60 hover:bg-blue-500/5 hover:text-blue-400"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                                    <ImageIcon className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium">
                                    Upload event banner
                                </span>
                            </label>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="event-title"
                            className="mb-2 block text-sm font-medium text-[#8888aa]"
                        >
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="event-title"
                            value={form.title}
                            onChange={handleChange("title")}
                            maxLength={100}
                            className="input-field text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="event-description"
                            className="mb-2 block text-sm font-medium text-[#8888aa]"
                        >
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="event-description"
                            value={form.description}
                            onChange={handleChange("description")}
                            rows={7}
                            className="input-field resize-none text-sm"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#8888aa]">
                                Event Type{" "}
                                <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={form.event_type}
                                onChange={handleChange("event_type")}
                                className="input-field text-sm"
                            >
                                {EVENT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() +
                                            type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="event-location"
                                className="mb-2 block text-sm font-medium text-[#8888aa]"
                            >
                                Venue <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555577]" />
                                <input
                                    id="event-location"
                                    value={form.location}
                                    onChange={handleChange("location")}
                                    style={{ paddingLeft: "2.75rem" }}
                                    className="input-field w-full text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <DateTimePickerField
                            id="event-start"
                            label="Start Time"
                            value={form.start_time}
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,
                                    start_time: value,
                                }))
                            }
                            required
                        />

                        <DateTimePickerField
                            id="event-end"
                            label="End Time"
                            value={form.end_time}
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,
                                    end_time: value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="event-max"
                                className="mb-2 block text-sm font-medium text-[#8888aa]"
                            >
                                Maximum Participants
                            </label>
                            <input
                                id="event-max"
                                type="number"
                                min="1"
                                step="1"
                                value={form.max_participants}
                                onChange={handleNumberChange(
                                    "max_participants",
                                )}
                                onFocus={selectOnFocus}
                                placeholder="No limit"
                                className="input-field text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="event-fee"
                                className="mb-2 block text-sm font-medium text-[#8888aa]"
                            >
                                Registration Fee{" "}
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="event-fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.registration_fee}
                                onChange={handleNumberChange(
                                    "registration_fee",
                                )}
                                onFocus={selectOnFocus}
                                className="input-field text-sm"
                            />
                        </div>
                    </div>

                    {submitError && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            {submitError}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1 justify-center"
                        >
                            {submitting ? (
                                <Spinner className="h-4 w-4 text-white" />
                            ) : isEdit ? (
                                <Save className="h-4 w-4" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {submitting
                                ? "Saving..."
                                : isEdit
                                  ? "Save Changes"
                                  : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
