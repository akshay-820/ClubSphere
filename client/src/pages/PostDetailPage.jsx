import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { PostMediaCarousel } from "../components/PostMediaCarousel";
import api from "../lib/api";
import {
    ArrowLeft,
    Megaphone,
    Users,
    FileText,
    Clock,
    Building2,
} from "lucide-react";

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
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

const TYPE_META = {
    announcement: {
        label: "Announcement",
        icon: Megaphone,
        cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    recruitment: {
        label: "Recruitment",
        icon: Users,
        cls: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    general: {
        label: "General",
        icon: FileText,
        cls: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    },
};

export default function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/posts/${id}`);
                setPost(res.data.post);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load post");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPost();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <PageMeta title="Loading Post... | ClubSphere" />
                <div className="flex items-center justify-center h-64">
                    <Spinner className="w-8 h-8 text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !post) {
        return (
            <DashboardLayout>
                <PageMeta title="Post Not Found | ClubSphere" />
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-[#8888aa] hover:text-white transition-colors mb-6 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <ErrorAlert message={error || "Post not found"} />
                </div>
            </DashboardLayout>
        );
    }

    const meta = TYPE_META[post.type] || TYPE_META.general;
    const TypeIcon = meta.icon;
    const mediaUrls = Array.isArray(post.media_urls) ? post.media_urls : [];

    return (
        <DashboardLayout>
            <PageMeta title={`${post.title} | ClubSphere`} />

            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-[#8888aa] hover:text-white transition-colors mb-6 text-sm font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>

                {/* Card */}
                <div className="bg-[#11111d] border border-[#252546] rounded-2xl p-6 md:p-8">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                        <button
                            onClick={() => navigate(`/clubs/${post.club_id}`)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#8888aa] hover:text-blue-400 transition-colors"
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            {post.club_name}
                        </button>

                        <span className="text-[#2a2a4a]">•</span>

                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.cls}`}
                        >
                            <TypeIcon className="w-3 h-3" />
                            {meta.label}
                        </span>

                        <span className="text-[#2a2a4a]">•</span>

                        <span className="flex items-center gap-1 text-xs text-[#555577]">
                            <Clock className="w-3 h-3" />
                            {relativeTime(post.created_at)}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl md:text-2xl font-semibold text-[#f0f0ff] leading-tight mb-4">
                        {post.title}
                    </h1>

                    {/* Content */}
                    <p className="text-[15px] text-[#b2b2ce] leading-relaxed whitespace-pre-line">
                        {post.content}
                    </p>

                    {/* Media */}
                    {mediaUrls.length > 0 && (
                        <div className="mt-4">
                            <PostMediaCarousel mediaUrls={mediaUrls} />
                        </div>
                    )}
                </div>

                {/* Full date */}
                <p className="text-xs text-[#555577] text-center mt-4">
                    Posted on{" "}
                    {new Date(post.created_at).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </DashboardLayout>
    );
}
