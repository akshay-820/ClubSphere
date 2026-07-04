import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import api from "../lib/api";
import {
    Users,
    ArrowLeft,
    CheckCircle,
    Tag,
    FileText,
    DollarSign,
    Link as LinkIcon,
    ChevronRight,
    Zap,
    Palette,
    Trophy,
    BookOpen,
    HelpCircle,
} from "lucide-react";

const CATEGORIES = [
    {
        value: "technical",
        label: "Technical",
        icon: Zap,
        desc: "Coding, robotics, engineering",
        gradient: "from-blue-500/20 to-blue-600/5",
        border: "border-blue-500/30",
        active: "bg-blue-500/20 border-blue-500/50 text-blue-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-blue-500/30 hover:text-blue-400",
        iconColor: "text-blue-400",
        dot: "bg-blue-500",
    },
    {
        value: "cultural",
        label: "Cultural",
        icon: Palette,
        desc: "Dance, drama, traditions",
        gradient: "from-purple-500/20 to-purple-600/5",
        border: "border-purple-500/30",
        active: "bg-purple-500/20 border-purple-500/50 text-purple-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-purple-500/30 hover:text-purple-400",
        iconColor: "text-purple-400",
        dot: "bg-purple-500",
    },
    {
        value: "sports",
        label: "Sports",
        icon: Trophy,
        desc: "Athletics, fitness, teams",
        gradient: "from-green-500/20 to-green-600/5",
        border: "border-green-500/30",
        active: "bg-green-500/20 border-green-500/50 text-green-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-green-500/30 hover:text-green-400",
        iconColor: "text-green-400",
        dot: "bg-green-500",
    },
    {
        value: "literary",
        label: "Literary",
        icon: BookOpen,
        desc: "Research, debates, quizzes",
        gradient: "from-amber-500/20 to-amber-600/5",
        border: "border-amber-500/30",
        active: "bg-amber-500/20 border-amber-500/50 text-amber-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-amber-500/30 hover:text-amber-400",
        iconColor: "text-amber-400",
        dot: "bg-amber-500",
    },
    {
        value: "other",
        label: "Other",
        icon: HelpCircle,
        desc: "Anything else",
        gradient: "from-slate-500/20 to-slate-600/5",
        border: "border-slate-500/30",
        active: "bg-slate-500/20 border-slate-500/50 text-slate-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-slate-500/30 hover:text-slate-400",
        iconColor: "text-slate-400",
        dot: "bg-slate-500",
    },
];

export default function RequestClubPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        logo_url: "",
        membership_fee: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const set = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));
    const setCategory = (val) => setForm((f) => ({ ...f, category: val }));

    const selectedCat = CATEGORIES.find((c) => c.value === form.category);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/club-requests", {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                category: form.category,
                logo_url: form.logo_url.trim() || undefined,
                membership_fee:
                    form.membership_fee !== ""
                        ? parseFloat(form.membership_fee)
                        : undefined,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    const MAX_DESC_WORDS = 150;

    const countWords = (str) => {
        const trimmed = str.trim();
        return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        const words = value.trim() === "" ? [] : value.trim().split(/\s+/);
        if (words.length <= MAX_DESC_WORDS) {
            setForm((f) => ({ ...f, description: value }));
        } else {
            setForm((f) => ({
                ...f,
                description: words.slice(0, MAX_DESC_WORDS).join(" "),
            }));
        }
    };

    if (success) {
        return (
            <DashboardLayout>
                <PageMeta title="Club Request Submitted" />
                <div className="max-w-lg mx-auto text-center py-20">
                    {/* Success glow */}
                    <div className="relative inline-flex mb-8">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl scale-150" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-[#f0f0ff] mb-3">
                        Request submitted!
                    </h1>
                    <p className="text-[#8888aa] mb-2">
                        Your request to create{" "}
                        <span className="text-[#f0f0ff] font-semibold">
                            {form.name}
                        </span>{" "}
                        has been sent.
                    </p>
                    <p className="text-sm text-[#555577] mb-10">
                        A college admin will review your request and either
                        approve or reject it. You'll be notified once a decision
                        is made.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => navigate("/clubs")}
                            className="btn-primary text-sm px-6 py-2.5 text-white"
                        >
                            <Users className="w-4 h-4" />
                            Back to Clubs
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setForm({
                                    name: "",
                                    description: "",
                                    category: "",
                                    logo_url: "",
                                    membership_fee: "",
                                });
                            }}
                            className="btn-ghost text-sm px-6 py-2.5"
                        >
                            Submit another request
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageMeta title="Request a Club" />

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Back */}
            <button
                onClick={() => navigate("/clubs")}
                className="flex items-center gap-1.5 text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Clubs
            </button>

            <div className="max-w-2xl mx-auto">
                {/* Hero header */}
                <div className="relative overflow-hidden rounded-2xl border border-[#1e1e3a] mb-8 p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-purple-600/5 to-transparent pointer-events-none" />
                    <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-purple-600/8 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/10">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#f0f0ff]">
                                Request a Club
                            </h1>
                            <p className="text-sm text-[#8888aa] mt-1 leading-relaxed">
                                Fill in the details below. A college admin will
                                review and approve your request.
                            </p>
                        </div>
                    </div>

                    {/* Step indicator */}
                    <div className="relative mt-6 flex items-center gap-2 text-xs text-[#555577]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-semibold text-[10px]">
                                1
                            </span>
                            Fill details
                        </div>
                        <ChevronRight className="w-3 h-3" />
                        <div className="flex items-center gap-1.5 opacity-50">
                            <span className="w-5 h-5 rounded-full bg-white/5 border border-[#2a2a4a] flex items-center justify-center font-semibold text-[10px]">
                                2
                            </span>
                            Admin review
                        </div>
                        <ChevronRight className="w-3 h-3 opacity-50" />
                        <div className="flex items-center gap-1.5 opacity-50">
                            <span className="w-5 h-5 rounded-full bg-white/5 border border-[#2a2a4a] flex items-center justify-center font-semibold text-[10px]">
                                3
                            </span>
                            Club created
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <ErrorAlert message={error} />

                    {/* Club Name */}
                    <div className="card p-6">
                        <label
                            htmlFor="club-name"
                            className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                        >
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            Club Name
                            <span className="text-red-400 text-xs ml-auto font-normal">
                                Required
                            </span>
                        </label>
                        <input
                            id="club-name"
                            type="text"
                            required
                            value={form.name}
                            onChange={set("name")}
                            className="input-field text-base"
                            placeholder="e.g. Robotics Club, Photography Society..."
                            maxLength={100}
                        />
                        <p className="text-xs text-[#555577] mt-2">
                            Choose a clear, descriptive name for your club.
                        </p>
                    </div>

                    {/* Category */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Tag className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <span className="text-sm font-semibold text-[#f0f0ff]">
                                Category
                            </span>
                            <span className="text-red-400 text-xs ml-auto font-normal">
                                Required
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = form.category === cat.value;
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border transition-all duration-150 text-left ${
                                            isSelected
                                                ? cat.active
                                                : cat.inactive
                                        }`}
                                    >
                                        {isSelected && (
                                            <div
                                                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cat.dot}`}
                                            />
                                        )}
                                        <Icon
                                            className={`w-4 h-4 ${isSelected ? "" : cat.iconColor}`}
                                        />
                                        <span className="text-xs font-semibold leading-none">
                                            {cat.label}
                                        </span>
                                        <span className="text-[10px] opacity-60 leading-none">
                                            {cat.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Hidden required field */}
                        <input
                            type="text"
                            required
                            value={form.category}
                            readOnly
                            className="sr-only"
                            aria-hidden="true"
                            tabIndex={-1}
                        />
                    </div>

                    {/* Description */}
                    <div className="card p-6">
                        <label
                            htmlFor="club-desc"
                            className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                        >
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                            Description
                            <span className="text-[#555577] text-xs ml-auto font-normal">
                                Optional
                            </span>
                        </label>
                        <textarea
                            id="club-desc"
                            rows={4}
                            value={form.description}
                            onChange={handleDescriptionChange}
                            className="input-field resize-none leading-relaxed"
                            placeholder="Tell us what this club is about. What will members do? What's the vision? Why should this club exist on campus?"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-[#555577]">
                                A great description increases your chances of
                                approval.
                            </p>
                            <span className="text-xs text-[#555577]">
                                {countWords(form.description)}/{MAX_DESC_WORDS}{" "}
                                words
                            </span>
                        </div>
                    </div>

                    {/* Logo URL + Membership Fee */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Logo URL */}
                        <div className="card p-6">
                            <label
                                htmlFor="club-logo"
                                className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                            >
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                Logo URL
                                <span className="text-[#555577] text-xs ml-auto font-normal">
                                    Optional
                                </span>
                            </label>
                            <input
                                id="club-logo"
                                type="url"
                                value={form.logo_url}
                                onChange={set("logo_url")}
                                className="input-field"
                                placeholder="https://..."
                            />
                            {/* Live preview */}
                            <div className="mt-3 flex items-center gap-3">
                                {form.logo_url ? (
                                    <img
                                        src={form.logo_url}
                                        alt="Logo preview"
                                        className="w-10 h-10 rounded-lg object-contain bg-white/5 border border-[#1e1e3a] p-1"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-dashed border-[#2a2a4a] flex items-center justify-center">
                                        <Users className="w-4 h-4 text-[#333355]" />
                                    </div>
                                )}
                                <span className="text-xs text-[#555577]">
                                    {form.logo_url
                                        ? "Logo preview"
                                        : "Paste a URL to preview"}
                                </span>
                            </div>
                        </div>

                        {/* Membership Fee */}
                        {/* Membership Fee */}
                        <div className="card p-6">
                            <label
                                htmlFor="club-fee"
                                className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                            >
                                <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <DollarSign className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                Membership Fee
                                <span className="text-[#555577] text-xs ml-auto font-normal">
                                    Optional
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8888aa] font-semibold pointer-events-none z-10">
                                    ₹
                                </span>
                                <input
                                    id="club-fee"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.membership_fee}
                                    onChange={set("membership_fee")}
                                    style={{ paddingLeft: "1.85rem" }}
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-xs text-[#555577] mt-2.5">
                                {form.membership_fee === "" ||
                                form.membership_fee === "0"
                                    ? "✓ Free membership"
                                    : `₹${form.membership_fee} per member`}
                            </p>
                        </div>
                    </div>

                    {/* Preview card */}
                    {(form.name || form.category) && (
                        <div
                            className={`card p-5 bg-gradient-to-br ${selectedCat?.gradient || "from-[#1a1a2e]/60 to-transparent"} border ${selectedCat?.border || "border-[#2a2a4a]"} transition-all duration-300`}
                        >
                            <p className="text-[10px] font-semibold text-[#555577] uppercase tracking-widest mb-3">
                                Preview
                            </p>
                            <div className="flex items-center gap-3">
                                {form.logo_url ? (
                                    <img
                                        src={form.logo_url}
                                        alt="preview"
                                        className="w-10 h-10 rounded-lg object-contain bg-white/5 border border-white/10 p-1 flex-shrink-0"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div
                                        className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 ${selectedCat?.iconColor || "text-[#555577]"}`}
                                    >
                                        {selectedCat ? (
                                            <selectedCat.icon className="w-5 h-5" />
                                        ) : (
                                            <Users className="w-5 h-5" />
                                        )}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-[#f0f0ff] text-sm">
                                        {form.name || "Club Name"}
                                    </p>
                                    {form.category && (
                                        <span
                                            className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${selectedCat?.active || ""}`}
                                        >
                                            <Tag className="w-2.5 h-2.5" />
                                            {selectedCat?.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {form.description && (
                                <p className="text-xs text-[#8888aa] mt-3 line-clamp-2 leading-relaxed">
                                    {form.description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center gap-4 pb-4">
                        <button
                            type="submit"
                            disabled={
                                loading || !form.name.trim() || !form.category
                            }
                            className="btn-primary text-sm py-3 px-8 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="xs" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Submit Request
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/clubs")}
                            className="btn-ghost text-sm py-3 px-6"
                        >
                            Cancel
                        </button>
                        {(!form.name.trim() || !form.category) && (
                            <p className="text-xs text-[#555577]">
                                {!form.name.trim()
                                    ? "Club name is required"
                                    : "Please select a category"}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
