import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ModuleDetailPage.css';
import pb from '../../../lib/pocketbase'; // Adjust path
import {
    ArrowLeft,
    BookOpen, 
    CheckCircle, 
    TrendingUp, 
    Book, 
    PlayCircle, 
    Download, 
    Video, 
    MessageSquare, 
    ClipboardCheck
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const getStatusDetails = () => {
        switch (status) {
            case 'Completed':
                return { icon: <CheckCircle size={16} />, className: 'status-completed' };
            case 'In Progress':
                return { icon: <TrendingUp size={16} />, className: 'status-in-progress' };
            case 'Pending':
            default:
                return { icon: <Book size={16} />, className: 'status-pending' };
        }
    };
    const { icon, className } = getStatusDetails();
    return <div className={`status-badge ${className}`}>{icon} {status}</div>;
};

const SubmoduleItem = ({ submodule, moduleId, onStatusChange }) => {
    const navigate = useNavigate();

    const handleAction = () => {
        if (submodule.status === 'Pending') {
            onStatusChange(submodule.id, 'In Progress');
        }
        navigate(`/dashboard/modules/${moduleId}/${submodule.id}`);
    };

    const getActionDetails = () => {
        switch (submodule.status) {
            case 'Completed':
                return { text: 'Review', icon: <CheckCircle size={16} />, className: 'btn-secondary' };
            case 'In Progress':
                return { text: 'Continue', icon: <PlayCircle size={16} />, className: 'btn-primary' };
            case 'Pending':
            default:
                return { text: 'Start', icon: <PlayCircle size={16} />, className: 'btn-primary' };
        }
    }

    const { text, icon, className } = getActionDetails();

    return (
        <div className="submodule-item">
            <div className="submodule-info">
                <h4>{submodule.title}</h4>
                <p>{submodule.description}</p>
            </div>
            <div className="submodule-actions">
                <StatusBadge status={submodule.status || 'Pending'} />
                <button className={`action-btn ${className}`} onClick={handleAction}>{icon} {text}</button>
            </div>
        </div>
    );
};

const ModuleDetailPage = () => {
    const { id: moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [submodules, setSubmodules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchModuleData = async () => {
        try {
            setLoading(true);
            
            const moduleRecord = await pb.collection('modules').getOne(moduleId);
            const thumbnailUrl = moduleRecord.thumbnail
                ? `${pb.baseUrl}/api/files/modules/${moduleId}/${moduleRecord.thumbnail}`
                : 'https://via.placeholder.com/800x200.png?text=Module+Banner';
            
            setModule({ ...moduleRecord, thumbnail: thumbnailUrl });

            const submoduleRecords = await pb.collection('submodules').getFullList({
                filter: `module = '${moduleId}'`,
                sort: 'order'
            });
            setSubmodules(submoduleRecords);

        } catch (err) {
            setError('Failed to load module details. Please try again.');
            console.error("Error fetching module data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModuleData();
    }, [moduleId]);

    const handleSubmoduleStatusChange = async (submoduleId, newStatus) => {
        try {
            setSubmodules(prevSubmodules => 
                prevSubmodules.map(sub => 
                    sub.id === submoduleId ? { ...sub, status: newStatus } : sub
                )
            );
            await pb.collection('submodules').update(submoduleId, { status: newStatus });
        } catch (err) {
            console.error("Failed to update submodule status:", err);
            setError('Could not update submodule status. Please refresh.');
            fetchModuleData(); 
        }
    };

    const handleMarkModuleComplete = async () => {
        try {
            await pb.collection('modules').update(moduleId, { status: 'Completed' });
            setModule(prev => ({...prev, status: 'Completed'}));
            alert('Congratulations! You have completed this module.');
        } catch (err) {
            console.error("Failed to mark module as complete:", err);
            setError('Could not mark module as complete. Please try again.');
        }
    };

    const handleGoToDiscussion = () => {
        alert("Community discussion forums are coming soon!");
    };

    const overallProgress = submodules.length > 0 
        ? (submodules.filter(s => s.status === 'Completed').length / submodules.length) * 100
        : 0;

    const derivedModuleStatus = module?.status === 'Completed' 
        ? 'Completed' 
        : (overallProgress === 100 ? 'Completed' : (overallProgress > 0 ? 'In Progress' : 'Pending'));


    if (loading) {
        return <div className="module-detail-page"><p>Loading details...</p></div>;
    }

    if (error) {
        return <div className="module-detail-page"><p className="error-message">{error}</p></div>;
    }

    if (!module) {
        return <div className="module-detail-page"><p>Module not found.</p></div>; 
    }

    return (
        <div className="module-detail-page">
            <header className="page-header">
                <Link to="/dashboard/modules" className="back-link"><ArrowLeft size={18} /> Back to All Modules</Link>
                <div className="module-main-header">
                    <h1>{String(module.order).padStart(2, '0')}: {module.title}</h1>
                </div>
            </header>

            <img src={module.thumbnail} alt={`${module.title} Banner`} className="module-banner" />
            <p className="module-short-description">{module.description}</p>

            <div className="module-progress-status">
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${overallProgress}%` }}></div>
                </div>
                <span className="progress-text">{Math.round(overallProgress)}% Completed</span>
                <StatusBadge status={derivedModuleStatus} />
            </div>

            <div className="module-body">
                <div className="left-column">
                    <div className="section-card">
                        <h2><BookOpen size={24} className="inline-block mr-2" /> Submodules</h2>
                        <div className="submodule-list">
                            {submodules.length > 0 ? (
                                submodules.map(sub => 
                                    <SubmoduleItem 
                                        key={sub.id} 
                                        submodule={sub} 
                                        moduleId={moduleId}
                                        onStatusChange={handleSubmoduleStatusChange} 
                                    />
                                )
                            ) : (
                                <p>No submodules have been added to this module yet.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="section-card">
                         <h2><Download size={24} className="inline-block mr-2" /> Notes & Resources</h2>
                         <p>No resources available yet.</p>
                    </div>
                    <div className="section-card">
                         <h2><Video size={24} className="inline-block mr-2" /> Videos</h2>
                         <p>No videos available yet.</p>
                    </div>
                    <div className="section-card">
                         <h2><ClipboardCheck size={24} className="inline-block mr-2" /> Assignments</h2>
                         <p>No assignments available yet.</p>
                    </div>
                </div>

                <div className="right-column">
                    <div className="section-card">
                        <h2>📑 Module Info</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Module No.</label>
                                <p>{String(module.order).padStart(2, '0')}</p>
                            </div>
                            <div className="info-item">
                                <label>Category</label>
                                <p>{module.category || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Estimated Time</label>
                                <p>6 Hours</p> 
                            </div>
                            <div className="info-item">
                                <label>Last Updated</label>
                                <p>{new Date(module.updated).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="section-card">
                        <h2><MessageSquare size={20} className="inline-block mr-2"/> Community</h2>
                        <p>Have questions? Ask the community!</p>
                        <button className="action-btn btn-secondary mt-2" onClick={handleGoToDiscussion}>Go to Discussion</button>
                    </div>
                </div>
            </div>

            <footer className="footer-actions">
                 <button 
                    className="action-btn btn-primary"
                    onClick={handleMarkModuleComplete}
                    disabled={derivedModuleStatus !== 'Completed' || module.status === 'Completed'}
                 >
                    {module.status === 'Completed' ? 'Module Completed' : 'Mark as Complete'}
                </button>
                 <Link to="/dashboard/modules" className="action-btn btn-secondary">Back to All Modules</Link>
            </footer>
        </div>
    );
};

export default ModuleDetailPage;
