import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { PostMediaCarousel } from "../components/PostMediaCarousel";
import api from "../lib/api";
import {
    Newspaper,
    Megaphone,
    Users,
    FileText,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────────────────

function relativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

const TYPE_META = {
    announcement: {
        label: "Announcement",
        icon: Megaphone,
        cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dot: "bg-blue-400",
    },
    recruitment: {
        label: "Recruitment",
        icon: Users,
        cls: "bg-green-500/10 text-green-400 border-green-500/20",
        dot: "bg-green-400",
    },
    general: {
        label: "General",
        icon: FileText,
        cls: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        dot: "bg-gray-400",
    },
};

// ── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const meta = TYPE_META[post.type] || TYPE_META.general;
    const TypeIcon = meta.icon;

    const CHAR_LIMIT = 280;
    const isTruncatable = post.content.length > CHAR_LIMIT;
    const displayContent =
        !expanded && isTruncatable
            ? post.content.slice(0, CHAR_LIMIT)
            : post.content;

    const mediaUrls = Array.isArray(post.media_urls) ? post.media_urls : [];
    const clubInitial = post.club_name?.charAt(0)?.toUpperCase() || "?";

    return (
        <article className="rounded-2xl border border-[#252546] bg-[#11111d] p-5 sm:p-6 transition-colors duration-200 hover:border-[#36365f]">
            {/* Meta row */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <button
                    onClick={() => navigate(`/clubs/${post.club_id}`)}
                    className="flex items-center gap-2 min-w-0 group/club"
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1c1c33] text-[11px] font-semibold text-[#8888aa] group-hover/club:text-[#c9c9ff] group-hover/club:bg-[#22224a] transition-colors">
                        {clubInitial}
                    </span>
                    <span className="truncate text-xs font-semibold text-[#a3a3c2] group-hover/club:text-[#f0f0ff] transition-colors">
                        {post.club_name}
                    </span>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.cls}`}
                    >
                        <TypeIcon className="w-3 h-3" />
                        {meta.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#555577]">
                        <Clock className="w-3 h-3" />
                        {relativeTime(post.created_at)}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h2
                onClick={() => navigate(`/posts/${post.id}`)}
                className="text-base font-semibold text-[#f0f0ff] leading-snug mb-3 cursor-pointer hover:text-[#c9c9ff] transition-colors"
            >
                {post.title}
            </h2>

            {/* Media */}
            {mediaUrls.length > 0 && (
                <div className="mb-3 rounded-xl overflow-hidden">
                    <PostMediaCarousel mediaUrls={mediaUrls} />
                </div>
            )}

            {/* Content */}
            <div className="relative">
                <p className="text-[15px] text-[#b2b2ce] leading-relaxed whitespace-pre-line">
                    {displayContent}
                </p>
                {!expanded && isTruncatable && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#11111d] to-transparent" />
                )}
            </div>

            {isTruncatable && (
                <button
                    onClick={() => setExpanded((e) => !e)}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[#9a9ad9] hover:text-[#c9c9ff] font-medium transition-colors"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Read more
                        </>
                    )}
                </button>
            )}
        </article>
    );
}

// ── PostsPage ─────────────────────────────────────────────────────────────────

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get("/posts");
                setPosts(res.data.posts || []);
            } catch (err) {
                // 403 means user has no college — show friendly empty state
                if (err.response?.status === 403) {
                    setPosts([]);
                } else {
                    setError(
                        err.response?.data?.error || "Failed to load posts",
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <DashboardLayout>
            <PageMeta title="Posts | ClubSphere" />

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                            <Newspaper className="w-5 h-5 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#f0f0ff]">
                            Posts
                        </h1>
                    </div>
                    <p className="text-sm text-[#555577] ml-12">
                        Updates from clubs at your college
                    </p>
                </div>

                {/* States */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Spinner className="w-7 h-7 text-blue-500" />
                    </div>
                )}

                {!loading && error && <ErrorAlert message={error} />}

                {!loading && !error && posts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1a1a2e] border border-[#1e1e3a] flex items-center justify-center">
                            <Newspaper className="w-7 h-7 text-[#555577]" />
                        </div>
                        <h3 className="font-semibold text-[#f0f0ff] mb-2">
                            No posts yet
                        </h3>
                        <p className="text-sm text-[#555577]">
                            Clubs at your college haven't posted anything yet.
                        </p>
                    </div>
                )}

                {!loading && !error && posts.length > 0 && (
                    <div className="space-y-5">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
