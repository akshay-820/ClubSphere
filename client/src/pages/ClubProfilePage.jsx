import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageMeta } from '../components/PageMeta';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { 
  ArrowLeft, 
  Pencil, 
  MoreVertical, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Users 
} from 'lucide-react';

export default function ClubProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/clubs/${id}`);
        setClub(res.data.club);
      } catch (err) {
        console.error('Error fetching club details:', err);
        setError(err.response?.data?.error || 'Failed to load club details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClubDetails();
    }
  }, [id]);

  const tabs = ['Overview', 'Members', 'Events', 'Posts', 'Gallery', 'About'];

  // To match the design's category badge
  const renderCategoryBadge = (category) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {category || 'General'}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageMeta title="Loading Club..." />
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-8 h-8 text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !club) {
    return (
      <DashboardLayout>
        <PageMeta title="Error" />
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          <ErrorAlert message={error || 'Club not found'} />
          <button 
            onClick={() => navigate('/clubs')}
            className="mt-4 text-blue-500 hover:underline inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clubs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';
  const isCollegeAdmin = user?.role === 'college_admin';
  // If the user created the club or is an admin of the college
  const canEdit = isSuperAdmin || isCollegeAdmin || club.created_by === user?.id;

  return (
    <DashboardLayout>
      <PageMeta title={`${club.name} | ClubSphere`} />
      
      <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 text-white">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/clubs')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Clubs
          </button>

          <div className="flex items-center gap-3">
            {canEdit && (
              <button 
                onClick={() => navigate(`/clubs/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1F26] hover:bg-[#252932] border border-gray-700/50 rounded-lg text-sm font-medium transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Club Profile
              </button>
            )}
            <button className="p-2 bg-[#1C1F26] hover:bg-[#252932] border border-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner Section */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E2336] via-[#16192B] to-[#12141D] border border-gray-800/50 p-6 md:p-10 mb-8">
          {/* Decorative background elements (optional, to mimic the network nodes) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.15), transparent 40%)' }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Logo */}
            <div className="shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-gray-800 shadow-xl">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {club.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {club.name}
                </h1>
                {renderCategoryBadge(club.category)}
              </div>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl">
                {club.description || 'No description provided for this club.'}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{club.college_name || 'College not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Est. Jan 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{club.total_members || 0} Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-800 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-blue-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area (Empty for now based on instructions) */}
        <div className="py-4">
          <p className="text-gray-500 italic">Content for {activeTab} will go here.</p>
        </div>

      </div>
    </DashboardLayout>
  );
}
