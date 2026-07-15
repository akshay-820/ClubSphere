import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import api from "../lib/api";
import {
    ArrowLeft,
    Megaphone,
    Users,
    FileText,
    ImageIcon,
    X,
    Send,
    Info,
    Plus,
    Upload,
} from "lucide-react";

const POST_TYPES = [
    {
        value: "announcement",
        label: "Announcement",
        icon: Megaphone,
        desc: "Official notices or updates",
        cls: "border-blue-500/30 bg-blue-500/5 text-blue-400",
        activeCls: "border-blue-500 bg-blue-500/15 text-blue-400",
    },
    {
        value: "recruitment",
        label: "Recruitment",
        icon: Users,
        desc: "Open roles or applications",
        cls: "border-green-500/30 bg-green-500/5 text-green-400",
        activeCls: "border-green-500 bg-green-500/15 text-green-400",
    },
    {
        value: "general",
        label: "General",
        icon: FileText,
        desc: "Everything else",
        cls: "border-gray-500/30 bg-gray-500/5 text-gray-400",
        activeCls: "border-gray-500 bg-gray-500/15 text-gray-400",
    },
];

export default function CreatePostPage() {
    const { id: clubId } = useParams();
    const navigate = useNavigate();

    const [type, setType] = useState("general");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files).filter((file) =>
            file.type.startsWith("image/"),
        );
        const newFiles = [...mediaFiles, ...files].slice(0, 6); // max 6
        setMediaFiles(newFiles);
        setMediaPreviews((previousPreviews) => {
            previousPreviews.forEach((url) => URL.revokeObjectURL(url));
            return newFiles.map((file) => URL.createObjectURL(file));
        });
        e.target.value = "";
    };

    const removeMedia = (index) => {
        const updated = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(updated);
        setMediaPreviews((previousPreviews) => {
            URL.revokeObjectURL(previousPreviews[index]);
            return previousPreviews.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError("Title and content are required.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const formData = new FormData();
            formData.append("type", type);
            formData.append("title", title.trim());
            formData.append("content", content.trim());
            mediaFiles.forEach((file) => formData.append("media", file));

            await api.post(`/clubs/${clubId}/posts`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
            navigate(`/clubs/${clubId}?tab=posts`, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create post.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <PageMeta title="Create Post | ClubSphere" />

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
                            Create Post
                        </h1>
                        <p className="text-sm text-[#555577]">
                            Share an update with your college community
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Post type selector */}
                    <div>
                        <label className="block text-sm font-medium text-[#8888aa] mb-3">
                            Post Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {POST_TYPES.map((t) => {
                                const Icon = t.icon;
                                const isActive = type === t.value;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setType(t.value)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                                            isActive ? t.activeCls : `${t.cls} hover:opacity-80`
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-semibold">
                                            {t.label}
                                        </span>
                                        <span className="text-[10px] text-[#555577] leading-tight">
                                            {t.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="post-title"
                            className="block text-sm font-medium text-[#8888aa] mb-2"
                        >
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="post-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Write a clear, descriptive title..."
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
                            htmlFor="post-content"
                            className="block text-sm font-medium text-[#8888aa] mb-2"
                        >
                            Content <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="post-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's the update? Be as detailed as you want..."
                            rows={7}
                            className="input-field text-sm resize-none"
                        />
                    </div>

                    {/* Media upload */}
                    <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <label className="block text-sm font-medium text-[#8888aa]">
                                Media{" "}
                                <span className="text-[#555577] font-normal">
                                    (optional)
                                </span>
                            </label>
                            <span className="text-xs text-[#555577]">
                                {mediaFiles.length}/6 images
                            </span>
                        </div>

                        <input
                            id="media-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMediaChange}
                            className="hidden"
                        />

                        {/* Previews */}
                        {mediaPreviews.length > 0 && (
                            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {mediaPreviews.map((url, i) => (
                                    <div
                                        key={i}
                                        className="group relative overflow-hidden rounded-xl border border-[#252546] bg-black"
                                    >
                                        <div className="flex h-56 items-center justify-center">
                                            <img
                                                src={url}
                                                alt={`preview-${i + 1}`}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                                            {i + 1}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(i)}
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white opacity-100 backdrop-blur transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                                            aria-label={`Remove image ${i + 1}`}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                            <p className="truncate text-xs text-white/80">
                                                {mediaFiles[i]?.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {mediaFiles.length < 6 && (
                                    <label
                                        htmlFor="media-upload"
                                        className="flex h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2a4a] bg-[#11111d] text-[#77779b] transition hover:border-blue-500/60 hover:bg-blue-500/5 hover:text-blue-400"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Add more images
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {mediaFiles.length === 0 && (
                            <label
                                htmlFor="media-upload"
                                className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#2a2a4a] bg-[#11111d] p-6 text-center text-[#77779b] transition hover:border-blue-500/60 hover:bg-blue-500/5 hover:text-blue-400"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#dadaf0]">
                                        Add images to your post
                                    </p>
                                    <p className="mt-1 text-xs text-[#555577]">
                                        Select up to 6 images. Previews keep the full image visible.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400">
                                    <ImageIcon className="h-4 w-4" />
                                    Choose images
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            {error}
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
                            disabled={submitting || !title.trim() || !content.trim()}
                            className="btn-primary flex-1 justify-center"
                        >
                            {submitting ? (
                                <Spinner className="w-4 h-4 text-white" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {submitting ? "Publishing…" : "Publish Post"}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
