import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { ErrorAlert } from "../components/ErrorAlert";
import api from "../lib/api";
import { Building2, Globe } from "lucide-react";

export default function CollegesPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/colleges")
            .then((res) => setColleges(res.data.colleges || []))
            .catch(() => setError("Failed to load colleges."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <PageMeta title="Colleges" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0ff]">
                        Colleges
                    </h1>
                    <p className="text-sm text-[#8888aa] mt-0.5">
                        Browse all registered colleges on ClubSphere.
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}

            <ErrorAlert message={error} />

            {!loading && !error && colleges.length === 0 && (
                <div className="text-center py-20">
                    <Building2 className="w-10 h-10 text-[#555577] mx-auto mb-3" />
                    <p className="text-[#8888aa] text-sm">
                        No colleges registered yet.
                    </p>
                </div>
            )}

            {!loading && colleges.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colleges.map((college) => (
                        <div
                            key={college.id}
                            className="card p-5 hover:border-[#2a2a4a] transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {college.logo_url ? (
                                    <img
                                        src={college.logo_url}
                                        alt={college.name}
                                        className="w-10 h-10 rounded-lg object-contain bg-white/5"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-medium text-[#f0f0ff] text-sm truncate">
                                        {college.name}
                                    </p>
                                    {college.email_domain && (
                                        <p className="text-xs text-[#555577] flex items-center gap-1 mt-0.5">
                                            <Globe className="w-3 h-3" />
                                            {college.email_domain}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
