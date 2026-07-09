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
  Users,
  Search,
  Plus,
  X,
  Trash2
} from 'lucide-react';

export default function ClubProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [club, setClub] = useState(null);
  const [userRoleInClub, setUserRoleInClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Members Tab State
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Search Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Dropdown Menu State
  const [showMenu, setShowMenu] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });

  // Success Message State
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/clubs/${id}`);
        setClub(res.data.club);
        setUserRoleInClub(res.data.userRoleInClub);
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

  useEffect(() => {
    if (activeTab === 'Members' && id) {
      fetchMembers();
    }
  }, [activeTab, id]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await api.get(`/clubs/${id}/members`);
      setMembers(res.data.members || []);
      if (res.data.userRoleInClub) {
        setUserRoleInClub(res.data.userRoleInClub);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/clubs/${id}/search-users?name=${searchQuery}`);
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("Error searching users", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, id]);

  const tabs = ['Overview', 'Members', 'Events', 'Posts', 'Gallery', 'About'];

  const renderCategoryBadge = (category) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {category || 'General'}
      </span>
    );
  };

  const handleDeleteClub = () => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to delete this club?",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/clubs/${id}`);
          navigate('/clubs');
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to delete club');
        }
      }
    });
  };

  const handleAddMember = async (userToAdd) => {
    try {
      await api.post(`/clubs/${id}/members`, { userId: userToAdd.id });
      // Close the modal
      setShowSearchModal(false);
      setSearchQuery('');
      setSearchResults([]);
      
      // Ensure we are on Members tab and refresh list
      if (activeTab !== 'Members') {
        setActiveTab('Members');
      } else {
        fetchMembers();
      }
      
      // Show success message
      setSuccessMessage(`${userToAdd.name} added successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = (userId) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to remove this member?",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/clubs/${id}/members`, { data: { userId } });
          fetchMembers();
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to remove member');
        }
      }
    });
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

  const isCollegeAdmin = user?.role === 'college_admin';
  const isPresident = userRoleInClub === 'president';
  const isAdmin = userRoleInClub === 'admin';

  const canEditClub = isPresident || isAdmin || isCollegeAdmin;
  const canDeleteClub = isPresident || isCollegeAdmin;
  const canManageMembers = isPresident || isAdmin;
  const canSeeDropdown = canEditClub || canDeleteClub || canManageMembers;

  return (
    <DashboardLayout>
      <PageMeta title={`${club.name} | ClubSphere`} />
      
      <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 text-white relative">
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
            {canSeeDropdown && (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                  className="p-2 bg-[#1C1F26] hover:bg-[#252932] border border-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white focus:outline-none"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1C1F26] border border-gray-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                    {canEditClub && (
                      <button
                        onClick={() => navigate(`/clubs/${id}/edit`)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#252932] hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                    {canManageMembers && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowSearchModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#252932] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Members
                      </button>
                    )}
                    {canDeleteClub && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDeleteClub();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Club
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Banner Section */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E2336] via-[#16192B] to-[#12141D] border border-gray-800/50 p-6 md:p-10 mb-8">
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
        <div className="flex items-center justify-between border-b border-gray-800 mb-8">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
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
        </div>

        {/* Tab Content Area */}
        <div className="py-4">
          {activeTab === 'Overview' && (
            <p className="text-gray-500 italic">Content for {activeTab} will go here.</p>
          )}
          {activeTab === 'Members' && (
            <div className="space-y-4">
              {loadingMembers ? (
                <div className="flex justify-center p-8">
                  <Spinner className="w-8 h-8 text-blue-500" />
                </div>
              ) : members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-[#1C1F26] border border-gray-800 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-medium text-white truncate">{member.name}</h3>
                          <p className="text-xs text-gray-400 truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-md capitalize">
                          {member.role || 'Member'}
                        </span>
                        {canManageMembers && member.role !== 'president' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No members found.
                </div>
              )}
            </div>
          )}
          {['Events', 'Posts', 'Gallery', 'About'].includes(activeTab) && (
             <p className="text-gray-500 italic">Content for {activeTab} will go here.</p>
          )}
        </div>

      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12141D] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Add Members</h2>
              <button 
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name..."
                  className="w-full bg-[#1C1F26] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                {isSearching ? (
                   <div className="flex justify-center p-4">
                     <Spinner className="w-6 h-6 text-blue-500" />
                   </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-[#1C1F26] rounded-xl border border-gray-800/50">
                      <div className="flex items-center gap-3 min-w-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium text-sm shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm text-white truncate">{user.name}</h3>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(user)}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center text-sm text-gray-500 p-4">
                    No users found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 p-4">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12141D] border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Confirm Action</h3>
            <p className="text-gray-300 text-sm mb-6">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification (MacBook style) */}
      {successMessage && (
        <div className="fixed top-6 right-4 z-[70] flex items-center gap-3 bg-[#1C1F26] border border-gray-700 shadow-2xl rounded-xl px-4 py-3 min-w-[280px] max-w-sm animate-toast-enter">
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
