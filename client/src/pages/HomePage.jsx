import { Link } from "react-router-dom";
import {
    ArrowRight,
    Users,
    Building2,
    BookOpen,
    Rocket,
    Zap,
} from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import logo from "../assets/logo.png";

const features = [
    {
        icon: Building2,
        title: "College Communities",
        desc: "Connect with students from your college and beyond. Find your tribe within a verified campus network.",
        color: "from-blue-500/20 to-blue-600/5",
        iconColor: "text-blue-400",
    },
    {
        icon: Users,
        title: "Student Clubs",
        desc: "Discover, join, or start clubs that match your passion — from robotics to literature to entrepreneurship.",
        color: "from-purple-500/20 to-purple-600/5",
        iconColor: "text-purple-400",
    },
    {
        icon: BookOpen,
        title: "Events & Activities",
        desc: "Stay in the loop with workshops, hackathons, open mics, and every event that matters on campus.",
        color: "from-cyan-500/20 to-cyan-600/5",
        iconColor: "text-cyan-400",
    },
];

const stats = [
    { value: "50+", label: "Colleges" },
    { value: "300+", label: "Clubs" },
    { value: "10k+", label: "Students" },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0ff] flex flex-col animate-page-enter">
            <PageMeta title="Home" />

            {/* Ambient glow blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 border-b border-[#1e1e3a]/60 glass">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="ClubSphere"
                            className="h-9 w-9 object-contain"
                        />
                        <span className="font-bold text-xl gradient-text">
                            ClubSphere
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-[#8888aa] hover:text-[#f0f0ff] transition-colors px-4 py-2"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary text-sm py-2 px-5"
                        >
                            Join Now
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
                    <Zap className="w-3 h-3" />
                    The hub for college club life
                </div>

                {/* Logo icon large */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl scale-150" />
                    <img
                        src={logo}
                        alt="ClubSphere"
                        className="relative w-28 h-28 object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5 max-w-3xl">
                    Your college.{" "}
                    <span className="gradient-text">Your clubs.</span>
                    <br />
                    Your community.
                </h1>

                <p className="text-lg text-[#8888aa] max-w-2xl mb-10 leading-relaxed">
                    ClubSphere brings every college club, event, and student
                    community onto one platform. Discover what&apos;s happening
                    on campus, join clubs that excite you, and build something
                    that lasts.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        to="/register"
                        className="btn-primary text-base px-8 py-3 text-white"
                    >
                        Join Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="btn-ghost text-base px-8 py-3">
                        Already have an account?
                    </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10 mt-16">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-3xl font-bold gradient-text">
                                {s.value}
                            </p>
                            <p className="text-sm text-[#555577] mt-1">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 py-20 px-6 border-t border-[#1e1e3a]/60">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">
                            Everything campus life needs
                        </h2>
                        <p className="text-[#8888aa] max-w-xl mx-auto">
                            One platform for students, clubs, and colleges to
                            connect, collaborate, and grow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className={`card p-6 bg-gradient-to-br ${f.color} border-[#1e1e3a]`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${f.iconColor}`}
                                >
                                    <f.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-[#f0f0ff] mb-2">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-[#8888aa] leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="relative z-10 py-16 px-6 text-center border-t border-[#1e1e3a]/60">
                <Rocket className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-3">
                    Ready to find your people?
                </h2>
                <p className="text-[#8888aa] mb-7 text-sm">
                    Join thousands of students already on ClubSphere.
                </p>
                <Link
                    to="/register"
                    className="btn-primary text-sm px-7 py-2.5 text-white"
                >
                    Get started for free
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[#1e1e3a]/60 py-6 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#555577]">
                    <div className="flex items-center gap-2">
                        <img
                            src={logo}
                            alt=""
                            className="h-5 w-5 object-contain opacity-60"
                        />
                        <span>
                            &copy; {new Date().getFullYear()} ClubSphere
                        </span>
                    </div>
                    <p>Built for students, by students.</p>
                </div>
            </footer>
        </div>
    );
}
