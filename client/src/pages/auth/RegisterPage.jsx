import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { PageMeta } from "../../components/PageMeta";
import { PasswordInput } from "../../components/PasswordInput";
import { ErrorAlert } from "../../components/ErrorAlert";
import { Spinner } from "../../components/Spinner";
import logo from "../../assets/logo.png";

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        college_id: "",
    });
    const [colleges, setColleges] = useState([]);
    const [collegesLoading, setCollegesLoading] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch colleges for dropdown — GET /colleges is public
    useEffect(() => {
        api.get("/colleges")
            .then((res) => {
                // Backend returns { colleges: [...] }
                setColleges(res.data.colleges || []);
            })
            .catch(() => setColleges([]))
            .finally(() => setCollegesLoading(false));
    }, []);

    const set = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // POST /auth/register — backend fields: name, email, password, college_id (optional)
            const payload = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
            };
            if (form.college_id) payload.college_id = form.college_id;

            await api.post("/auth/register", payload);
            // Navigate to verify page carrying email via state
            navigate("/verify-otp", {
                state: { email: payload.email },
                replace: true,
            });
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                "Registration failed. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex animate-page-enter">
            <PageMeta title="Create Account" />

            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#10101a] to-[#0a0a0f] items-center justify-center overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
                <div className="relative text-center px-12">
                    <img
                        src={logo}
                        alt="ClubSphere"
                        className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-2xl"
                    />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Join ClubSphere
                    </h2>
                    <p className="text-[#8888aa] text-sm leading-relaxed max-w-xs mx-auto">
                        Create your account to discover college clubs, connect
                        with communities, and make the most of campus life.
                    </p>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <img
                            src={logo}
                            alt="ClubSphere"
                            className="h-8 w-8 object-contain"
                        />
                        <span className="font-bold gradient-text text-lg">
                            ClubSphere
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-[#f0f0ff] mb-1">
                        Create account
                    </h1>
                    <p className="text-sm text-[#8888aa] mb-7">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>

                    <ErrorAlert message={error} />

                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-[#8888aa] mb-1.5"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                autoComplete="name"
                                value={form.name}
                                onChange={set("name")}
                                placeholder="John Doe"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="reg-email"
                                className="block text-sm font-medium text-[#8888aa] mb-1.5"
                            >
                                Email
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={set("email")}
                                placeholder="you@college.edu"
                                className="input-field"
                            />
                            <p className="text-xs text-[#555577] mt-1.5">
                                Please register with your college email to
                                interact and join clubs.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="college"
                                className="block text-sm font-medium text-[#8888aa] mb-1.5"
                            >
                                College
                                <span className="text-[#555577] ml-1">
                                    (optional)
                                </span>
                            </label>
                            {collegesLoading ? (
                                <div className="flex items-center gap-2 h-10 px-3">
                                    <Spinner size="sm" />
                                    <span className="text-xs text-[#555577]">
                                        Loading colleges...
                                    </span>
                                </div>
                            ) : (
                                <select
                                    id="college"
                                    value={form.college_id}
                                    onChange={set("college_id")}
                                    className="input-field"
                                >
                                    <option value="">
                                        Select your college
                                    </option>
                                    {colleges.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <PasswordInput
                            id="reg-password"
                            label="Password"
                            value={form.password}
                            onChange={set("password")}
                            placeholder="Create a strong password"
                            required
                            autoComplete="new-password"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center text-white"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#8888aa]">
                        <p>
                            If you don't find your College, don't worry - you
                            can{" "}
                            <Link
                                to="/request-college"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Request your College
                            </Link>{" "}
                            , and then sign in using your College mail once the
                            request is approved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
