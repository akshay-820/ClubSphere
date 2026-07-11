import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Tag,
    DollarSign,
    UserCheck,
    Clock,
    X,
    AlertTriangle,
} from "lucide-react";

const CATEGORY_COLORS = {
    technical: {
        gradient: "from-blue-500/15 to-blue-600/5",
        border: "border-blue-500/20",
        badge: "bg-blue-500/15 text-blue-300 border-blue-500/20",
        icon: "text-blue-400",
    },
    cultural: {
        gradient: "from-purple-500/15 to-purple-600/5",
        border: "border-purple-500/20",
        badge: "bg-purple-500/15 text-purple-300 border-purple-500/20",
        icon: "text-purple-400",
    },
    sports: {
        gradient: "from-green-500/15 to-green-600/5",
        border: "border-green-500/20",
        badge: "bg-green-500/15 text-green-300 border-green-500/20",
        icon: "text-green-400",
    },
    social: {
        gradient: "from-cyan-500/15 to-cyan-600/5",
        border: "border-cyan-500/20",
        badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
        icon: "text-cyan-400",
    },
    academic: {
        gradient: "from-amber-500/15 to-amber-600/5",
        border: "border-amber-500/20",
        badge: "bg-amber-500/15 text-amber-300 border-amber-500/20",
        icon: "text-amber-400",
    },
    arts: {
        gradient: "from-pink-500/15 to-pink-600/5",
        border: "border-pink-500/20",
        badge: "bg-pink-500/15 text-pink-300 border-pink-500/20",
        icon: "text-pink-400",
    },
    default: {
        gradient: "from-[#1a1a2e]/60 to-transparent",
        border: "border-[#2a2a4a]",
        badge: "bg-white/5 text-[#8888aa] border-[#2a2a4a]",
        icon: "text-[#8888aa]",
    },
};

function getCategoryStyle(category) {
    const key = category?.toLowerCase();
    return CATEGORY_COLORS[key] || CATEGORY_COLORS.default;
}

// Club Card
function ClubCard({ club, canManage, onEdit, onDelete }) {
    const navigate = useNavigate();
    const style = getCategoryStyle(club.category);
    return (
        <div
            onClick={() => navigate(`/clubs/${club.id}`)}
            className={`card p-5 bg-gradient-to-br ${style.gradient} border ${style.border} transition-all duration-200 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-4 cursor-pointer`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {club.logo_url ? (
                        <img
                            src={club.logo_url}
                            alt={club.name}
                            className="w-12 h-12 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
                        />
                    ) : (
                        <div
                            className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${style.icon}`}
                        >
                            <Users className="w-6 h-6" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#f0f0ff] text-sm leading-tight truncate">
                        {club.name}
                    </h3>
                    {club.category && (
                        <span
                            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${style.badge}`}
                        >
                            <Tag className="w-2.5 h-2.5" />
                            {club.category}
                        </span>
                    )}
                </div>

                {canManage && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(club);
                            }}
                            className="p-1.5 rounded-lg text-[#555577] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Edit club"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(club);
                            }}
                            className="p-1.5 rounded-lg text-[#555577] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete club"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {club.description && (
                <p className="text-xs text-[#8888aa] leading-relaxed line-clamp-3">
                    {club.description}
                </p>
            )}

            <div className="flex flex-wrap gap-2 text-[10px] text-[#555577]">
                {club.membership_fee != null && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                        <DollarSign className="w-2.5 h-2.5" />
                        {club.membership_fee === 0
                            ? "Free"
                            : `Rs. ${club.membership_fee}`}
                    </span>
                )}
                {club.membership_duration_days && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                        <Clock className="w-2.5 h-2.5" />
                        {club.membership_duration_days}d membership
                    </span>
                )}
                {club.registration_type && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                        <UserCheck className="w-2.5 h-2.5" />
                        {club.registration_type}
                    </span>
                )}
                {club.accepting_members != null && (
                    <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${club.accepting_members ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${club.accepting_members ? "bg-green-400" : "bg-red-400"}`}
                        />
                        {club.accepting_members
                            ? "Accepting members"
                            : "Closed"}
                    </span>
                )}
            </div>
        </div>
    );
}

// Delete Confirm Modal portalled to body so it covers the full viewport
function DeleteModal({ target, deleting, deleteError, onConfirm, onClose }) {
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
                backgroundColor: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)",
            }}
            onClick={onClose}
        >
            <div
                className="card w-full max-w-sm p-6 shadow-2xl border border-[#2a2a4a]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <p className="font-bold text-[#f0f0ff] text-base">
                        Delete club?
                    </p>
                    <p className="text-sm text-[#8888aa] mt-2 leading-relaxed">
                        Are you sure you want to permanently delete{" "}
                        <span className="text-[#f0f0ff] font-semibold">
                            {target.name}
                        </span>
                        ? This cannot be undone.
                    </p>
                </div>

                <ErrorAlert message={deleteError} />

                <div className="flex gap-2.5">
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {deleting ? (
                            <Spinner size="xs" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        {deleting ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg border border-[#2a2a4a] text-[#8888aa] hover:border-[#3a3a5a] hover:bg-white/5 hover:text-[#f0f0ff] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

// Main Clubs Page
export default function ClubsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const canManage =
        user?.role === "college_admin" || user?.role === "super_admin";

    const fetchClubs = useCallback(() => {
        setLoading(true);
        setError("");
        api.get("/clubs")
            .then((res) => setClubs(res.data.clubs || []))
            .catch((err) =>
                setError(err.response?.data?.error || "Failed to load clubs."),
            )
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        queueMicrotask(fetchClubs);
    }, [fetchClubs]);

    const openDeleteModal = (club) => {
        setDeleteError("");
        setDeleteTarget(club);
    };

    const closeDeleteModal = () => {
        if (deleting) return;
        setDeleteTarget(null);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await api.delete(`/clubs/${deleteTarget.id}`);
            setClubs((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(
                err.response?.data?.error || "Failed to delete club.",
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <PageMeta title="Clubs" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0ff]">Clubs</h1>
                    <p className="text-sm text-[#8888aa] mt-0.5">
                        Explore all clubs in your college
                    </p>
                </div>
                <button
                    id="request-club-btn"
                    onClick={() => navigate("/clubs/request")}
                    className="btn-primary text-sm py-2 px-4 text-white"
                >
                    <Plus className="w-4 h-4" />
                    Request Club
                </button>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}

            <ErrorAlert message={error} />

            {!loading && clubs.length === 0 && !error && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-[#f0f0ff] font-medium mb-1">
                        No clubs yet
                    </p>
                    <p className="text-[#8888aa] text-sm mb-5">
                        Be the first to request a club for your college!
                    </p>
                    <button
                        onClick={() => navigate("/clubs/request")}
                        className="btn-primary text-sm py-2 px-5 text-white"
                    >
                        <Plus className="w-4 h-4" />
                        Request a Club
                    </button>
                </div>
            )}

            {!loading && clubs.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clubs.map((club) => (
                        <ClubCard
                            key={club.id}
                            club={club}
                            canManage={canManage}
                            onEdit={(c) => navigate(`/clubs/${c.id}/edit`)}
                            onDelete={openDeleteModal}
                        />
                    ))}
                </div>
            )}

            {deleteTarget && (
                <DeleteModal
                    target={deleteTarget}
                    deleting={deleting}
                    deleteError={deleteError}
                    onConfirm={confirmDelete}
                    onClose={closeDeleteModal}
                />
            )}
        </DashboardLayout>
    );
}
