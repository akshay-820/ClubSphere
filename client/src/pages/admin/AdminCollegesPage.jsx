import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageMeta } from "../../components/PageMeta";
import { Spinner } from "../../components/Spinner";
import { ErrorAlert } from "../../components/ErrorAlert";
import api from "../../lib/api";
import { Building2, Pencil, Trash2, Check, X, Globe } from "lucide-react";

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

    const fetchColleges = () => {
        setLoading(true);
        api.get("/colleges")
            .then((res) => setColleges(res.data.colleges || []))
            .catch(() => setError("Failed to load colleges."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchColleges();
    }, []);

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

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to permanently delete this college?",
            )
        )
            return;
        try {
            // DELETE /colleges/:id
            await api.delete(`/colleges/${id}`);
            setColleges((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete college.");
        }
    };

    return (
        <DashboardLayout>
            <PageMeta title="Manage Colleges" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#f0f0ff]">
                    Manage Colleges
                </h1>
                <p className="text-sm text-[#8888aa] mt-0.5">
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
                    <Building2 className="w-10 h-10 text-[#555577] mx-auto mb-3" />
                    <p className="text-[#8888aa] text-sm">No colleges yet.</p>
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
                                            <label className="text-xs text-[#555577] mb-1 block">
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
                                            <label className="text-xs text-[#555577] mb-1 block">
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
                                            <label className="text-xs text-[#555577] mb-1 block">
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
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() =>
                                                handleSave(college.id)
                                            }
                                            disabled={saving}
                                            className="btn-primary text-xs py-1.5 px-4 text-white"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="btn-ghost text-xs py-1.5 px-4"
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
                                            className="w-10 h-10 rounded-lg object-contain bg-white/5 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="w-5 h-5 text-blue-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#f0f0ff] text-sm">
                                            {college.name}
                                        </p>
                                        {college.email_domain && (
                                            <p className="text-xs text-[#555577] flex items-center gap-1 mt-0.5">
                                                <Globe className="w-3 h-3" />
                                                {college.email_domain}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(college)}
                                            className="p-1.5 rounded-lg text-[#555577] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(college.id)
                                            }
                                            className="p-1.5 rounded-lg text-[#555577] hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
        </DashboardLayout>
    );
}
