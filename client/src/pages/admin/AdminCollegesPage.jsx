import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageMeta } from "../../components/PageMeta";
import { Spinner } from "../../components/Spinner";
import { ErrorAlert } from "../../components/ErrorAlert";
import api from "../../lib/api";
import {
    Building2,
    Pencil,
    Trash2,
    Check,
    X,
    Globe,
    AlertTriangle,
} from "lucide-react";

export default function AdminCollegesPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email_domain: "",
        logo_url: "",
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const fetchColleges = useCallback(() => {
        setLoading(true);
        setError(""); // clear any stale error from a previous failed fetch
        api.get("/colleges")
            .then((res) => setColleges(res.data.colleges || []))
            .catch(() => setError("Failed to load colleges."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        queueMicrotask(fetchColleges);
    }, [fetchColleges]);

    const startEdit = (college) => {
        setEditingId(college.id);
        setEditForm({
            name: college.name,
            email_domain: college.email_domain || "",
            logo_url: college.logo_url || "",
        });
        setSaveError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setSaveError("");
    };

    const handleSave = async (id) => {
        setSaving(true);
        setSaveError("");
        try {
            // PATCH /colleges/:id — allowed fields: name, email_domain, logo_url
            const res = await api.patch(`/colleges/${id}`, editForm);
            setColleges((prev) =>
                prev.map((c) => (c.id === id ? res.data.college : c)),
            );
            setEditingId(null);
        } catch (err) {
            setSaveError(
                err.response?.data?.error || "Failed to update college.",
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (college) => {
        setDeleteError("");
        setDeleteTarget(college);
    };

    const closeDeleteModal = () => {
        if (deleting) return; // don't allow closing mid-request
        setDeleteTarget(null);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError("");
        try {
            // DELETE /colleges/:id
            await api.delete(`/colleges/${deleteTarget.id}`);
            setColleges((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(
                err.response?.data?.error || "Failed to delete college.",
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <PageMeta title="Manage Colleges" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                    Manage Colleges
                </h1>
                <p className="text-sm text-text-secondary mt-0.5">
                    Edit or remove colleges registered on ClubSphere.
                </p>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}
            <ErrorAlert message={error} />

            {!loading && colleges.length === 0 && !error && (
                <div className="text-center py-20">
                    <Building2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">
                        No colleges yet.
                    </p>
                </div>
            )}

            {!loading && colleges.length > 0 && (
                <div className="space-y-3">
                    {colleges.map((college) => (
                        <div key={college.id} className="card p-5">
                            {editingId === college.id ? (
                                <div className="space-y-3">
                                    <ErrorAlert message={saveError} />
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-text-muted mb-1 block">
                                                Name
                                            </label>
                                            <input
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({
                                                        ...f,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="input-field text-sm"
                                                placeholder="College name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted mb-1 block">
                                                Email Domain
                                            </label>
                                            <input
                                                value={editForm.email_domain}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({
                                                        ...f,
                                                        email_domain:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="input-field text-sm"
                                                placeholder="college.ac.in"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs text-text-muted mb-1 block">
                                                Logo URL
                                            </label>
                                            <input
                                                value={editForm.logo_url}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({
                                                        ...f,
                                                        logo_url:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="input-field text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    {/* Save / Cancel — restyled for clearer visual hierarchy */}
                                    <div className="flex gap-2.5 pt-1">
                                        <button
                                            onClick={() =>
                                                handleSave(college.id)
                                            }
                                            disabled={saving}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-green-500 text-white shadow-sm shadow-green-500/20 hover:bg-green-400 hover:shadow-green-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {saving ? (
                                                <Spinner size="xs" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#2a2a4a] text-text-secondary hover:border-[#3a3a5a] hover:bg-white/5 hover:text-text-primary active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    {college.logo_url ? (
                                        <img
                                            src={college.logo_url}
                                            alt={college.name}
                                            className="w-10 h-10 rounded-lg object-contain bg-white/5 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Building2 className="w-5 h-5 text-blue-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-text-primary text-sm">
                                            {college.name}
                                        </p>
                                        {college.email_domain && (
                                            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                                <Globe className="w-3 h-3" />
                                                {college.email_domain}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(college)}
                                            className="p-1.5 rounded-lg text-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                openDeleteModal(college)
                                            }
                                            className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation modal — sits in front of the whole page */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={closeDeleteModal}
                >
                    <div
                        className="card w-full max-w-sm p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-text-primary text-sm">
                                    Delete college?
                                </p>
                                <p className="text-sm text-text-secondary mt-1">
                                    Are you sure you want to delete{" "}
                                    <span className="text-text-primary font-medium">
                                        {deleteTarget.name}
                                    </span>
                                    ? This can't be undone.
                                </p>
                            </div>
                        </div>

                        <ErrorAlert message={deleteError} />

                        <div className="flex gap-2.5 mt-4">
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-400 hover:shadow-red-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {deleting ? (
                                    <Spinner size="xs" />
                                ) : (
                                    <Check className="w-3.5 h-3.5" />
                                )}
                                {deleting ? "Deleting..." : "Yes, delete"}
                            </button>
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#2a2a4a] text-text-secondary hover:border-[#3a3a5a] hover:bg-white/5 hover:text-text-primary active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
