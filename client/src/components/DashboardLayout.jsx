import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FileText, User, LogOut, Shield, Pencil, Layers, Users, Newspaper } from "lucide-react";
import logo from "../assets/logo.png";

export function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const navLink = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5"
        }`;

    return (
        <div className="flex h-screen bg-[#0a0a0f]">
            {/* Sidebar */}
            <aside className="w-60 glass border-r border-[#1e1e3a] flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-[#1e1e3a]">
                    <Link to="/feed" className="flex items-center gap-2.5">
                        <img
                            src={logo}
                            alt="ClubSphere"
                            className="h-8 w-8 object-contain"
                        />
                        <span className="font-bold text-base gradient-text">
                            ClubSphere
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <NavLink to="/feed" className={navLink}>
                        <Layers className="w-4 h-4" />
                        Feed
                    </NavLink>

                    <NavLink to="/posts" className={navLink}>
                        <Newspaper className="w-4 h-4" />
                        Posts
                    </NavLink>

                    <NavLink to="/profile" className={navLink}>
                        <User className="w-4 h-4" />
                        My Profile
                    </NavLink>

                    <NavLink to="/clubs" className={navLink}>
                        <Users className="w-4 h-4" />
                        Clubs
                    </NavLink>

                    {/* Super Admin section */}
                    {user?.role === "super_admin" && (
                        <>
                            <div className="pt-4 pb-1 px-3">
                                <p className="text-[10px] font-semibold text-[#555577] uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Super Admin
                                </p>
                            </div>
                            <NavLink
                                to="/admin/college-requests"
                                className={navLink}
                            >
                                <FileText className="w-4 h-4" />
                                College Requests
                            </NavLink>
                            <NavLink to="/admin/colleges" className={navLink}>
                                <Shield className="w-4 h-4" />
                                Manage Colleges
                            </NavLink>
                        </>
                    )}

                    {/* College Admin section */}
                    {user?.role === "college_admin" && user?.college_id && (
                        <>
                            <div className="pt-4 pb-1 px-3">
                                <p className="text-[10px] font-semibold text-[#555577] uppercase tracking-widest flex items-center gap-1">
                                    <Pencil className="w-3 h-3" />
                                    College Admin
                                </p>
                            </div>
                            <NavLink
                                to={`/colleges/${user.college_id}/edit`}
                                className={navLink}
                            >
                                <Pencil className="w-4 h-4" />
                                Edit College
                            </NavLink>
                            <NavLink to="/college/club-requests" className={navLink}>
                                <FileText className="w-4 h-4" />
                                Club Requests
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* User footer */}
                <div className="p-3 border-t border-[#1e1e3a] space-y-1">
                    {/* Profile card — clickable, links to /profile */}
                    <Link
                        to="/profile"
                        className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-full object-cover border border-white/10 shadow"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow">
                                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            )}
                            {/* Online / verified dot */}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#13131f] ${user?.email_verified ? "bg-green-400" : "bg-yellow-400"}`} />
                        </div>

                        {/* Name + role */}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#f0f0ff] truncate group-hover:text-blue-300 transition-colors">
                                {user?.name}
                            </p>
                            <p className="text-[11px] text-[#555577] truncate">
                                {user?.email}
                            </p>
                        </div>

                        {/* Role badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border flex-shrink-0 ${
                            user?.role === "super_admin"
                                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                : user?.role === "college_admin"
                                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                  : "bg-white/5 border-[#2a2a4a] text-[#555577]"
                        }`}>
                            {user?.role === "super_admin"
                                ? "SA"
                                : user?.role === "college_admin"
                                  ? "CA"
                                  : "Me"}
                        </span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div
                    key={location.pathname}
                    className="max-w-5xl mx-auto p-8 animate-page-enter"
                >
                    {children}
                </div>
            </main>
        </div>
    );
}
