import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import api from "../lib/api";
import {
    ArrowLeft,
    Megaphone,
    Users,
    FileText,
    Save,
    Info,
    AlertTriangle,
} from "lucide-react";

const POST_TYPES = [
    { value: "announcement", label: "Announcement", icon: Megaphone },
    { value: "recruitment", label: "Recruitment", icon: Users },
    { value: "general", label: "General", icon: FileText },
];

export default function EditPostPage() {
    const { id: clubId, postId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [type, setType] = useState("general");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/posts/${postId}`);
                const post = res.data.post;
                setType(post.type || "general");
                setTitle(post.title || "");
                setContent(post.content || "");
            } catch (err) {
                setFetchError(
                    err.response?.data?.error || "Failed to load post",
                );
            } finally {
                setLoading(false);
            }
        };

        if (postId) fetchPost();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setSubmitError("Title and content are required.");
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);
            await api.patch(`/clubs/${clubId}/posts/${postId}`, {
                type,
                title: title.trim(),
                content: content.trim(),
            });
            navigate(`/clubs/${clubId}?tab=posts`, { replace: true });
        } catch (err) {
            setSubmitError(
                err.response?.data?.error || "Failed to update post.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <PageMeta title="Edit Post | ClubSphere" />
                <div className="flex items-center justify-center h-64">
                    <Spinner className="w-8 h-8 text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (fetchError) {
        return (
            <DashboardLayout>
                <PageMeta title="Edit Post | ClubSphere" />
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-[#8888aa] hover:text-white transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <ErrorAlert message={fetchError} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageMeta title="Edit Post | ClubSphere" />

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg text-[#8888aa] hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[#f0f0ff]">
                            Edit Post
                        </h1>
                        <p className="text-sm text-[#555577]">
                            Update the post details below
                        </p>
                    </div>
                </div>

                {/* Media notice */}
                <div className="flex items-start gap-3 p-4 mb-6 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-400 mb-0.5">
                            Media can't be edited here
                        </p>
                        <p className="text-xs text-[#8888aa] leading-relaxed">
                            To change the images or attachments on this post,
                            please delete it and create a new one with the
                            updated media.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Post type */}
                    <div>
                        <label className="block text-sm font-medium text-[#8888aa] mb-3">
                            Post Type
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {POST_TYPES.map((t) => {
                                const Icon = t.icon;
                                const isActive = type === t.value;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setType(t.value)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            isActive
                                                ? "border-blue-500 bg-blue-500/15 text-blue-400"
                                                : "border-[#1e1e3a] bg-transparent text-[#8888aa] hover:border-[#2a2a4a] hover:text-white"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="edit-title"
                            className="block text-sm font-medium text-[#8888aa] mb-2"
                        >
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="edit-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            className="input-field text-sm"
                        />
                        <div className="mt-1 text-right text-xs text-[#555577]">
                            {title.length}/200
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label
                            htmlFor="edit-content"
                            className="block text-sm font-medium text-[#8888aa] mb-2"
                        >
                            Content <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="edit-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="input-field text-sm resize-none"
                        />
                    </div>

                    {/* Error */}
                    {submitError && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            {submitError}
                        </div>
                    )}

                    {/* Actions */}
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
                            disabled={
                                submitting ||
                                !title.trim() ||
                                !content.trim()
                            }
                            className="btn-primary flex-1 justify-center"
                        >
                            {submitting ? (
                                <Spinner className="w-4 h-4 text-white" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
