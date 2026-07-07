import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { ImageUploader } from "../components/ImageUploader";
import api from "../lib/api";
import {
    Users,
    ArrowLeft,
    Save,
    Tag,
    FileText,
    DollarSign,
    Image as ImageIcon,
    Clock,
    UserCheck,
    ToggleLeft,
    ToggleRight,
    CheckCircle,
    Zap,
    Palette,
    Trophy,
    BookOpen,
    HelpCircle,
    Unlock,
    Lock,
    ClipboardCheck,
} from "lucide-react";

const CATEGORIES = [
    {
        value: "technical",
        label: "Technical",
        icon: Zap,
        desc: "Coding, robotics, engineering",
        active: "bg-blue-500/20 border-blue-500/50 text-blue-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-blue-500/30 hover:text-blue-400",
        iconColor: "text-blue-400",
        dot: "bg-blue-500",
        gradient: "from-blue-500/20 to-blue-600/5",
        badge: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    },
    {
        value: "cultural",
        label: "Cultural",
        icon: Palette,
        desc: "Dance, drama, traditions",
        active: "bg-purple-500/20 border-purple-500/50 text-purple-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-purple-500/30 hover:text-purple-400",
        iconColor: "text-purple-400",
        dot: "bg-purple-500",
        gradient: "from-purple-500/20 to-purple-600/5",
        badge: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    },
    {
        value: "sports",
        label: "Sports",
        icon: Trophy,
        desc: "Athletics, fitness, teams",
        active: "bg-green-500/20 border-green-500/50 text-green-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-green-500/30 hover:text-green-400",
        iconColor: "text-green-400",
        dot: "bg-green-500",
        gradient: "from-green-500/20 to-green-600/5",
        badge: "bg-green-500/15 text-green-300 border-green-500/20",
    },
    {
        value: "literary",
        label: "Literary",
        icon: BookOpen,
        desc: "Research, debates, quizzes",
        active: "bg-amber-500/20 border-amber-500/50 text-amber-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-amber-500/30 hover:text-amber-400",
        iconColor: "text-amber-400",
        dot: "bg-amber-500",
        gradient: "from-amber-500/20 to-amber-600/5",
        badge: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    },
    {
        value: "other",
        label: "Other",
        icon: HelpCircle,
        desc: "Anything else",
        active: "bg-slate-500/20 border-slate-500/50 text-slate-300",
        inactive:
            "border-[#2a2a4a] text-[#555577] hover:border-slate-500/30 hover:text-slate-400",
        iconColor: "text-slate-400",
        dot: "bg-slate-500",
        gradient: "from-slate-500/20 to-slate-600/5",
        badge: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    },
];

const REG_TYPES = [
    {
        value: "open",
        label: "Open",
        desc: "Anyone can join instantly, no approval needed",
        icon: Unlock,
        active: "bg-green-500/15 border-green-500/50 text-green-300",
        inactive:
            "border-[#2a2a4a] text-[#8888aa] hover:border-green-500/30 hover:text-green-400",
        iconColor: "text-green-400",
        dot: "bg-green-500",
    },
    {
        value: "approval",
        label: "Approval Required",
        desc: "Admin reviews and approves each join request",
        icon: ClipboardCheck,
        active: "bg-amber-500/15 border-amber-500/50 text-amber-300",
        inactive:
            "border-[#2a2a4a] text-[#8888aa] hover:border-amber-500/30 hover:text-amber-400",
        iconColor: "text-amber-400",
        dot: "bg-amber-500",
    },
    {
        value: "invite",
        label: "Invite Only",
        desc: "Only members you invite can join",
        icon: Lock,
        active: "bg-rose-500/15 border-rose-500/50 text-rose-300",
        inactive:
            "border-[#2a2a4a] text-[#8888aa] hover:border-rose-500/30 hover:text-rose-400",
        iconColor: "text-rose-400",
        dot: "bg-rose-500",
    },
];

export default function EditClubPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [form, setForm] = useState(null);

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get("/clubs")
            .then((res) => {
                const found = (res.data.clubs || []).find((c) => c.id === id);
                if (!found) {
                    setFetchError("Club not found.");
                    return;
                }
                setForm({
                    name: found.name || "",
                    description: found.description || "",
                    category: found.category || "",
                    // logo_url is stored for the live preview; actual upload uses logoFile
                    logo_url: found.logo_url || "",
                    membership_fee:
                        found.membership_fee != null
                            ? String(found.membership_fee)
                            : "",
                    accepting_members: found.accepting_members ?? true,
                    registration_type: found.registration_type || "",
                    membership_duration_days:
                        found.membership_duration_days != null
                            ? String(found.membership_duration_days)
                            : "",
                });
            })
            .catch(() => setFetchError("Failed to load club details."))
            .finally(() => setFetchLoading(false));
    }, [id]);

    const set = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));
    const setCategory = (val) => setForm((f) => ({ ...f, category: val }));
    const setRegType = (val) =>
        setForm((f) => ({ ...f, registration_type: val }));
    const toggleAccepting = () =>
        setForm((f) => ({ ...f, accepting_members: !f.accepting_members }));

    const handleLogoSelect = (file) => {
        setLogoFile(file);
        if (file) {
            const blobUrl = URL.createObjectURL(file);
            setLogoPreview(blobUrl);
            // Update live preview hero immediately
            setForm((f) => ({ ...f, logo_url: blobUrl }));
        } else {
            setLogoPreview(null);
        }
    };

    const selectedCat = CATEGORIES.find((c) => c.value === form?.category);
    const selectedReg = REG_TYPES.find(
        (r) => r.value === form?.registration_type,
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveError("");
        setSaved(false);
        setSaving(true);
        try {
            if (logoFile) {
                setUploading(true);
                const fd = new FormData();
                if (form.name.trim()) fd.append("name", form.name.trim());
                if (form.description.trim()) fd.append("description", form.description.trim());
                if (form.category) fd.append("category", form.category);
                if (form.membership_fee !== "") fd.append("membership_fee", String(parseFloat(form.membership_fee)));
                fd.append("accepting_members", String(form.accepting_members));
                if (form.registration_type) fd.append("registration_type", form.registration_type);
                if (form.membership_duration_days !== "") fd.append("membership_duration_days", String(parseInt(form.membership_duration_days)));
                fd.append("logo", logoFile);

                const res = await api.patch(`/clubs/${id}`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setUploading(false);
                // Update logo_url in form with the returned Cloudinary URL
                setForm((f) => ({ ...f, logo_url: res.data.club?.logo_url || f.logo_url }));
                setLogoFile(null);
                setLogoPreview(null);
            } else {
                const payload = {
                    name: form.name.trim() || undefined,
                    description: form.description.trim() || undefined,
                    category: form.category || undefined,
                    membership_fee:
                        form.membership_fee !== ""
                            ? parseFloat(form.membership_fee)
                            : undefined,
                    accepting_members: form.accepting_members,
                    registration_type: form.registration_type || undefined,
                    membership_duration_days:
                        form.membership_duration_days !== ""
                            ? parseInt(form.membership_duration_days)
                            : undefined,
                };
                await api.patch(`/clubs/${id}`, payload);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setUploading(false);
            setSaveError(err.response?.data?.error || "Failed to update club.");
        } finally {
            setSaving(false);
        }
    };

    if (fetchLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-32">
                    <Spinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (fetchError || !form) {
        return (
            <DashboardLayout>
                <button
                    onClick={() => navigate("/clubs")}
                    className="flex items-center gap-1.5 text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Clubs
                </button>
                <ErrorAlert message={fetchError || "Club not found."} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageMeta title={`Edit Club`} />

            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            <button
                onClick={() => navigate("/clubs")}
                className="flex items-center gap-1.5 text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Clubs
            </button>

            <div className="max-w-2xl mx-auto">
                {/* Live preview hero */}
                <div
                    className={`relative overflow-hidden rounded-2xl border mb-8 p-8 bg-gradient-to-br ${selectedCat ? selectedCat.gradient : "from-[#1a1a2e]/60 to-transparent"} border-[#2a2a4a]`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-blue-600/8 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative flex items-center gap-5">
                        {form.logo_url ? (
                            <img
                                src={form.logo_url}
                                alt="logo"
                                className="w-16 h-16 rounded-2xl object-contain bg-white/5 border border-white/10 p-1.5 flex-shrink-0 shadow-lg"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                        ) : (
                            <div
                                className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg ${selectedCat ? selectedCat.iconColor : "text-[#555577]"}`}
                            >
                                {selectedCat ? (
                                    <selectedCat.icon className="w-8 h-8" />
                                ) : (
                                    <Users className="w-8 h-8" />
                                )}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-[#f0f0ff] truncate">
                                {form.name || "Club Name"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {form.category && (
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${selectedCat ? selectedCat.badge : "bg-white/5 text-[#8888aa] border-[#2a2a4a]"}`}
                                    >
                                        <Tag className="w-3 h-3" />
                                        {selectedCat
                                            ? selectedCat.label
                                            : form.category}
                                    </span>
                                )}
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${form.accepting_members ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${form.accepting_members ? "bg-green-400" : "bg-red-400"}`}
                                    />
                                    {form.accepting_members
                                        ? "Accepting members"
                                        : "Closed"}
                                </span>
                                {selectedReg && (
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium bg-white/5 border-[#2a2a4a] ${selectedReg.iconColor}`}
                                    >
                                        <selectedReg.icon className="w-3 h-3" />
                                        {selectedReg.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <ErrorAlert message={saveError} />

                    {/* Name */}
                    <div className="card p-6">
                        <label
                            htmlFor="edit-name"
                            className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                        >
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            Club Name
                        </label>
                        <input
                            id="edit-name"
                            type="text"
                            value={form.name}
                            onChange={set("name")}
                            className="input-field text-base"
                            placeholder="Club name"
                            maxLength={100}
                        />
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
                                        className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border transition-all duration-150 text-left ${isSelected ? cat.active : cat.inactive}`}
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
                    </div>

                    {/* Description */}
                    <div className="card p-6">
                        <label
                            htmlFor="edit-desc"
                            className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                        >
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                            Description
                        </label>
                        <textarea
                            id="edit-desc"
                            rows={4}
                            value={form.description}
                            onChange={(e) => {
                                const value = e.target.value;
                                const words =
                                    value.trim() === ""
                                        ? []
                                        : value.trim().split(/\s+/);
                                if (words.length <= 150) {
                                    setForm((f) => ({
                                        ...f,
                                        description: value,
                                    }));
                                } else {
                                    setForm((f) => ({
                                        ...f,
                                        description: words
                                            .slice(0, 150)
                                            .join(" "),
                                    }));
                                }
                            }}
                            className="input-field resize-none leading-relaxed"
                            placeholder="What is this club about?"
                        />
                        <div className="flex justify-end mt-1.5">
                            <span className="text-xs text-[#555577]">
                                {form.description.trim() === ""
                                    ? 0
                                    : form.description.trim().split(/\s+/)
                                          .length}
                                /150 words
                            </span>
                        </div>
                    </div>

                    {/* Logo + Fee */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="card p-6">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                Club Logo
                            </div>
                            <ImageUploader
                                currentUrl={logoFile ? null : (form.logo_url || null)}
                                onFileSelect={handleLogoSelect}
                                shape="square"
                                label="Drag & drop or click to upload club logo"
                                uploading={uploading}
                            />
                            {logoFile && (
                                <p className="mt-2 text-xs text-amber-300 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                    Logo ready — save to upload.
                                </p>
                            )}
                        </div>

                        <div className="card p-6">
                            <label
                                htmlFor="edit-fee"
                                className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                            >
                                <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <DollarSign className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                Membership Fee
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8888aa] font-semibold pointer-events-none z-10">
                                    ₹
                                </span>
                                <input
                                    id="edit-fee"
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

                    {/* Registration Type */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold text-[#f0f0ff]">
                                Registration Type
                            </span>
                            <span className="text-[#555577] text-xs ml-auto font-normal">
                                How people join this club
                            </span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {REG_TYPES.map((rt) => {
                                const Icon = rt.icon;
                                const isSelected =
                                    form.registration_type === rt.value;
                                return (
                                    <button
                                        key={rt.value}
                                        type="button"
                                        onClick={() => setRegType(rt.value)}
                                        className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-150 text-left ${isSelected ? rt.active : rt.inactive}`}
                                    >
                                        {isSelected && (
                                            <div
                                                className={`absolute top-3 right-3 w-2 h-2 rounded-full ${rt.dot}`}
                                            />
                                        )}
                                        <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/10" : "bg-white/5"}`}
                                        >
                                            <Icon
                                                className={`w-4.5 h-4.5 ${isSelected ? "" : rt.iconColor}`}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold leading-none">
                                            {rt.label}
                                        </span>
                                        <span className="text-[11px] opacity-70 leading-snug">
                                            {rt.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Duration + Accepting toggle */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="card p-6">
                            <label
                                htmlFor="edit-duration"
                                className="flex items-center gap-2 text-sm font-semibold text-[#f0f0ff] mb-4"
                            >
                                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                                </div>
                                Membership Duration
                            </label>
                            <div className="relative">
                                <input
                                    id="edit-duration"
                                    type="number"
                                    min="1"
                                    value={form.membership_duration_days}
                                    onChange={set("membership_duration_days")}
                                    style={{ paddingRight: "3.25rem" }}
                                    className="input-field"
                                    placeholder="365"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#555577] font-medium pointer-events-none">
                                    days
                                </span>
                            </div>
                            <p className="text-xs text-[#555577] mt-2">
                                {form.membership_duration_days
                                    ? `≈ ${Math.round(form.membership_duration_days / 30)} months`
                                    : "Duration of membership"}
                            </p>
                        </div>

                        <div className="card p-6 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-teal-400" />
                                </div>
                                <span className="text-sm font-semibold text-[#f0f0ff]">
                                    Accepting Members
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={toggleAccepting}
                                className={`flex items-center justify-between w-full p-3.5 rounded-xl border transition-all duration-200 ${form.accepting_members ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}
                            >
                                <div>
                                    <p className="text-sm font-semibold">
                                        {form.accepting_members
                                            ? "Open for applications"
                                            : "Closed"}
                                    </p>
                                    <p className="text-xs opacity-60 mt-0.5">
                                        {form.accepting_members
                                            ? "New members can apply"
                                            : "No new members"}
                                    </p>
                                </div>
                                {form.accepting_members ? (
                                    <ToggleRight className="w-7 h-7 flex-shrink-0" />
                                ) : (
                                    <ToggleLeft className="w-7 h-7 flex-shrink-0" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4 py-2">
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="btn-primary text-sm py-3 px-8 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Spinner size="xs" /> Uploading...
                                </>
                            ) : saving ? (
                                <>
                                    <Spinner size="xs" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
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
                        {saved && (
                            <span className="flex items-center gap-1.5 text-sm text-green-400">
                                <CheckCircle className="w-4 h-4" /> Saved!
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
