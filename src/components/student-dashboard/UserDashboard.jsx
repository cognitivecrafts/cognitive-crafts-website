import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../../lib/pocketbase';
import './UserDashboard.css';
import { 
    Award, 
    Book, 
    Video, 
    FileText, 
    User as UserIcon, 
    Settings, 
    LogOut, 
    Zap, 
    ClipboardCheck, 
    MessageSquare, 
    TrendingUp, 
    Star, 
    ChevronRight, 
    ArrowRight,
    Megaphone
} from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="stat-icon" style={{ backgroundColor: color }}>{icon}</div>
        <div className="stat-info">
            <p>{label}</p>
            <span>{value}</span>
        </div>
    </div>
);

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(pb.authStore.model);
    const [stats, setStats] = useState({ modules: 0, videos: 0, notes: 0, completedModules: 0 });
    const [recentModules, setRecentModules] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [modulesData, videosData, notesData, submodulesData, announcementsData] = await Promise.all([
                    pb.collection('modules').getFullList({ sort: '-created', expand: 'submodules' }),
                    pb.collection('videos').getFullList({ filter: 'status = "Active"' }),
                    pb.collection('notes').getFullList({ filter: `status = "Active"` }),
                    pb.collection('submodules').getFullList(),
                    pb.collection('announcements').getFullList({ sort: '-created', filter: 'status = "Published"', perPage: 4 })
                ]);

                const completedSubmodules = submodulesData.filter(sm => sm.status === 'Completed').length;
                const totalSubmodules = submodulesData.length;
                const progress = totalSubmodules > 0 ? (completedSubmodules / totalSubmodules) * 100 : 0;
                setOverallProgress(progress);
                
                const completedModulesCount = modulesData.filter(module => {
                    const moduleSubmodules = module.expand?.submodules || [];
                    if (moduleSubmodules.length === 0) return false;
                    return moduleSubmodules.every(sm => submodulesData.find(s => s.id === sm.id)?.status === 'Completed');
                }).length;

                setStats({ 
                    modules: modulesData.length, 
                    videos: videosData.length, 
                    notes: notesData.length,
                    completedModules: completedModulesCount
                });
                
                setRecentModules(modulesData.slice(0, 3));
                setAnnouncements(announcementsData);

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError("Could not load dashboard data. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };

        if (pb.authStore.isValid) {
            fetchData();
        }

        const unsub = pb.authStore.onChange(() => {
            setUser(pb.authStore.model);
        });

        return () => unsub();
    }, []);

    const handleLogout = () => {
        pb.authStore.clear();
        navigate('/login');
    };
    
    const handleNavigate = (path) => {
        navigate(path);
    };

    if (loading) {
        return <div className="user-dashboard-loading"><p>Loading your dashboard...</p></div>;
    }

    if (error) {
        return <div className="user-dashboard-error"><p>{error}</p></div>;
    }

    return (
        <div className="user-dashboard">
            <header className="dashboard-header">
                 <div className="welcome-message">
                    <h1>Welcome back, {user?.name || 'Student'}!</h1>
                    <p>Let's continue your learning journey and make progress today.</p>
                </div>
                <div className="header-actions">
                    <div className="profile-dropdown">
                        <UserIcon size={24} className="profile-icon" />
                        <div className="dropdown-content">
                            <Link to="/profile"><UserIcon size={16} /> My Profile</Link>
                            <Link to="/settings"><Settings size={16} /> Settings</Link>
                            <button onClick={handleLogout}><LogOut size={16} /> Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="progress-snapshot-bar card">
                <div className="progress-text">
                    You’ve completed <strong>{Math.round(overallProgress)}%</strong> of your active courses
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${overallProgress}%` }}></div>
                </div>
                <button className="continue-learning-btn" onClick={() => navigate('/dashboard/modules')}>
                    Continue Learning <ArrowRight size={16}/>
                </button>
            </section>

            <section className="stats-overview">
                <StatCard icon={<Book size={20} />} label="Total Modules" value={stats.modules} color="#3b82f6" />
                <StatCard icon={<Video size={20} />} label="Total Videos" value={stats.videos} color="#10b981" />
                <StatCard icon={<FileText size={20} />} label="Notes Available" value={stats.notes} color="#f97316" />
                <StatCard icon={<Award size={20} />} label="Completed Modules" value={stats.completedModules} color="#8b5cf6" />
            </section>

            <main className="dashboard-main-content">
                <div className="dashboard-left">
                    <section className="recent-modules-section">
                        <div className="section-header">
                            <h3><TrendingUp /> Continue Learning</h3>
                            <Link to="/dashboard/modules" className="view-all-link">View All <ArrowRight size={16}/></Link>
                        </div>
                        <div className="modules-grid">
                            {recentModules.map(module => (
                                <div key={module.id} className="module-card-compact" onClick={() => navigate(`/dashboard/modules/${module.id}`)}>
                                    <div className="module-card-icon">
                                        <Book size={24} />
                                    </div>
                                    <div className="module-card-info">
                                        <h4>{module.title}</h4>
                                        <p>{module.expand?.submodules?.length || 0} Submodules</p>
                                    </div>
                                    <ChevronRight className="module-card-arrow"/>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                
                <div className="dashboard-right">
                    <section className="announcements-section card">
                        <h3><Megaphone /> Announcements</h3>
                        <ul className="announcements-list">
                            {announcements.length > 0 ? (
                                announcements.map(item => (
                                    <li key={item.id}>
                                        <p className="announcement-text">{item.title}</p>
                                        <span className="announcement-date">
                                            {new Date(item.created).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <p className="no-announcements">No recent announcements.</p>
                            )}
                        </ul>
                    </section>
                    <section className="quick-access-section card">
                        <h3><Zap /> Quick Access</h3>
                        <div className="quick-buttons-grid">
                            <button onClick={() => handleNavigate('/dashboard/modules')}><Book size={20} /><span>Modules</span></button>
                            <button onClick={() => handleNavigate('/dashboard/videos')}><Video size={20} /><span>Video Library</span></button>
                            <button onClick={() => handleNavigate('/dashboard/notes')}><FileText size={20} /><span>Notes Library</span></button>
                            <button onClick={() => handleNavigate('/dashboard/assignments')}><ClipboardCheck size={20} /><span>Assignments</span></button>
                            <button onClick={() => handleNavigate('/dashboard/community')}><MessageSquare size={20} /><span>Community</span></button>
                            <button onClick={() => handleNavigate('/profile')}><Star size={20} /><span>My Progress</span></button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
