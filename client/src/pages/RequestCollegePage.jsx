import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { ErrorAlert } from "../components/ErrorAlert";
import api from "../lib/api";
import {
    Building2,
    CheckCircle2,
    ArrowLeft,
    Globe,
    Image,
    Send,
    Clock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const STEPS = [
    {
        icon: Send,
        label: "You submit",
        desc: "College details go to our review team",
    },
    {
        icon: ShieldCheck,
        label: "We verify",
        desc: "We confirm the domain and details are legit",
    },
    {
        icon: Clock,
        label: "It goes live",
        desc: "Once approved, students on that domain can join",
    },
];

export default function RequestCollegePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        college_name: "",
        email_domain: "",
        logo_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const set = (key) => (e) => {
        if (key === "logo_url") setLogoError(false);
        setForm((f) => ({ ...f, [key]: e.target.value }));
    };

    const domainValid = useMemo(() => {
        if (!form.email_domain) return null;
        return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(form.email_domain.trim());
    }, [form.email_domain]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // POST /college-requests
            await api.post("/college-requests", {
                college_name: form.college_name.trim(),
                email_domain: form.email_domain.trim(),
                logo_url: form.logo_url.trim(),
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <DashboardLayout>
                <PageMeta title="Request College" />
                <div className="max-w-xl mx-auto pt-8">
                    <div className="card p-8 text-center relative overflow-hidden">
                        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-72 h-72 bg-green-500/10 rounded-full blur-[90px] pointer-events-none" />

                        <div className="relative w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>

                        <h2 className="text-xl font-bold text-[#f0f0ff] mb-2">
                            Request submitted
                        </h2>
                        <p className="text-sm text-[#8888aa] max-w-sm mx-auto mb-6 leading-relaxed">
                            <span className="text-[#cfcfee] font-medium">
                                {form.college_name}
                            </span>{" "}
                            is in the queue for review. Check back later to see
                            if it's been approved.
                        </p>

                        <div className="border border-[#1e1e3a] rounded-xl divide-y divide-[#1e1e3a] text-left mb-7">
                            {STEPS.map((step, i) => {
                                const Icon = step.icon;
                                const isFirst = i === 0;
                                return (
                                    <div
                                        key={step.label}
                                        className="flex items-start gap-3 p-3.5"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                                isFirst
                                                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                                    : "bg-white/5 border-[#1e1e3a] text-[#8888aa]"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="pt-0.5">
                                            <p
                                                className={`text-sm font-medium ${isFirst ? "text-[#f0f0ff]" : "text-[#cfcfee]"}`}
                                            >
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-[#666688] mt-0.5">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => navigate("/feed")}
                            className="btn-primary px-6 py-2.5 text-white shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                        >
                            Return to feed
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageMeta title="Request College" />

            <div className="max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Hero card */}
                <div className="relative overflow-hidden rounded-2xl border border-[#1e1e3a] mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-transparent pointer-events-none" />
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-xl">
                            <Building2 className="w-10 h-10 text-blue-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">
                                Request a new college
                            </h1>
                            <p className="text-sm text-[#8888aa] max-w-lg leading-relaxed">
                                Don't see your campus on ClubSphere yet? Add its
                                details below. Once our team approves it,
                                students with a matching email domain can join
                                and start clubs right away.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
                    {/* Form */}
                    <div className="card p-6">
                        <h2 className="text-base font-semibold text-[#f0f0ff] mb-6">
                            College information
                        </h2>

                        <ErrorAlert message={error} />

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 mt-4"
                        >
                            <div>
                                <label
                                    htmlFor="cname"
                                    className="block text-sm font-medium text-[#8888aa] mb-2 flex items-center gap-1.5"
                                >
                                    <Building2 className="w-4 h-4" /> College
                                    name
                                </label>
                                <input
                                    id="cname"
                                    type="text"
                                    required
                                    value={form.college_name}
                                    onChange={set("college_name")}
                                    placeholder="e.g. Indian Institute of Technology Delhi"
                                    className="input-field py-2.5"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="edomain"
                                    className="block text-sm font-medium text-[#8888aa] mb-2 flex items-center gap-1.5"
                                >
                                    <Globe className="w-4 h-4" /> Email domain
                                </label>
                                <div className="relative">
                                    <input
                                        id="edomain"
                                        type="text"
                                        required
                                        value={form.email_domain}
                                        onChange={set("email_domain")}
                                        placeholder="e.g. iitd.ac.in"
                                        className={`input-field py-2.5 pr-9 ${
                                            domainValid === false
                                                ? "border-red-500/40 focus:border-red-500/60"
                                                : ""
                                        }`}
                                    />
                                    {domainValid !== null && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {domainValid ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <span className="block w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center">
                                                    !
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                                <p
                                    className={`text-xs mt-1.5 ${domainValid === false ? "text-red-400" : "text-[#555577]"}`}
                                >
                                    {domainValid === false
                                        ? "That doesn't look like a valid domain — try something like college.ac.in"
                                        : "Institutional email domain, without the @."}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="logo"
                                    className="block text-sm font-medium text-[#8888aa] mb-2 flex items-center gap-1.5"
                                >
                                    <Image className="w-4 h-4" /> Logo URL
                                </label>
                                <input
                                    id="logo"
                                    type="url"
                                    required
                                    value={form.logo_url}
                                    onChange={set("logo_url")}
                                    placeholder="https://example.com/logo.png"
                                    className="input-field py-2.5"
                                />
                                <p className="text-xs text-[#555577] mt-1.5">
                                    A direct link to a square logo image works
                                    best — preview it on the right.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[#1e1e3a] flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary py-2.5 px-6 text-white text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60"
                                >
                                    <Send className="w-4 h-4" />
                                    {loading
                                        ? "Submitting request..."
                                        : "Submit request"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Live preview */}
                    <div className="lg:sticky lg:top-6 space-y-4">
                        <div className="card p-5">
                            <p className="text-xs font-medium text-[#666688] uppercase tracking-wide mb-4 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> How it'll
                                appear
                            </p>

                            <div className="rounded-xl border border-[#1e1e3a] bg-white/[0.02] p-4 flex items-center gap-3">
                                <div className="w-11 h-11 rounded-lg bg-white/5 border border-[#1e1e3a] flex items-center justify-center overflow-hidden shrink-0">
                                    {form.logo_url && !logoError ? (
                                        <img
                                            src={form.logo_url}
                                            alt="Logo preview"
                                            className="w-full h-full object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-[#555577]" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#f0f0ff] truncate">
                                        {form.college_name ||
                                            "Your college name"}
                                    </p>
                                    <p className="text-xs text-[#666688] truncate">
                                        {form.email_domain
                                            ? `@${form.email_domain}`
                                            : "domain.ac.in"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-400/90">
                                <Clock className="w-3.5 h-3.5" />
                                Pending approval after submission
                            </div>
                        </div>

                        <div className="card p-5">
                            <p className="text-xs font-medium text-[#666688] uppercase tracking-wide mb-3">
                                What happens next
                            </p>
                            <div className="space-y-3">
                                {STEPS.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <div
                                            key={step.label}
                                            className="flex items-start gap-2.5"
                                        >
                                            <Icon className="w-3.5 h-3.5 text-[#555577] mt-0.5 shrink-0" />
                                            <p className="text-xs text-[#8888aa] leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
