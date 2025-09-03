import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './SubmoduleDetailPage.css';
import pb from '../../../lib/pocketbase';
import { 
    Home, 
    ChevronRight, 
    BookOpen, 
    Video, 
    Paperclip, 
    ClipboardCheck, 
    MessageSquare, 
    CheckCircle, 
    TrendingUp, 
    Book, 
    PlayCircle, 
    ArrowLeft 
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const getStatusDetails = () => {
        switch (status) {
            case 'Completed':
                return { icon: <CheckCircle size={16} />, className: 'status-completed', text: 'Completed' };
            case 'In Progress':
                return { icon: <TrendingUp size={16} />, className: 'status-in-progress', text: 'In Progress' };
            case 'Pending':
            default:
                return { icon: <Book size={16} />, className: 'status-pending', text: 'Pending' };
        }
    };
    const { icon, className, text } = getStatusDetails();
    return <div className={`status-badge ${className}`}>{icon} {text}</div>;
};

const SubmoduleDetailPage = () => {
    const { id: moduleId, submoduleId } = useParams();
    const navigate = useNavigate();
    
    const [module, setModule] = useState(null);
    const [submodule, setSubmodule] = useState(null);
    const [videos, setVideos] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [notes, setNotes] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!moduleId || !submoduleId) {
            setLoading(false);
            setError("Module or Submodule ID is missing.");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [submoduleRecord, moduleRecord] = await Promise.all([
                    pb.collection('submodules').getOne(submoduleId),
                    pb.collection('modules').getOne(moduleId)
                ]);

                setSubmodule(submoduleRecord);
                setModule(moduleRecord);

                const videoRecords = await pb.collection('videos').getFullList({
                    filter: `submodule = '${submoduleId}' && status = 'Active'`,
                    sort: 'created'
                });
                setVideos(videoRecords);

                const assignmentRecords = await pb.collection('assignments').getFullList({
                    filter: `submodule_id = '${submoduleId}'`
                });
                setAssignments(assignmentRecords);

                const noteRecords = await pb.collection('notes').getFullList({
                    filter: `submodule = '${submoduleId}'`
                });
                setNotes(noteRecords);
                
                if (videoRecords.length > 0) {
                    setActiveVideo(videoRecords[0]);
                }

            } catch (err) {
                setError('Failed to load submodule content. Please go back and try again.');
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [moduleId, submoduleId]);

    const getFileUrl = (record, filename) => {
        if (!record || !filename) return null;
        return pb.getFileUrl(record, filename);
    };

    const handleMarkComplete = async () => {
        if (submodule.status === 'Completed') return;
        try {
            const updatedSubmodule = await pb.collection('submodules').update(submoduleId, { status: 'Completed' });
            setSubmodule(updatedSubmodule);
            alert('Submodule marked as complete!');
        } catch (err) {
            console.error('Failed to update status:', err);
            setError('Could not mark submodule as complete.');
        }
    };
    
    if (loading) return <div className="submodule-detail-page"><p>Loading submodule...</p></div>;
    if (error) return <div className="submodule-detail-page"><p className="error-message">{error}</p></div>;
    if (!submodule || !module) return <div className="submodule-detail-page"><p>Content not found.</p></div>;

    const activeVideoUrl = getFileUrl(activeVideo, activeVideo?.file);

    return (
        <div className="submodule-detail-page">
            <div className="breadcrumb">
                <Link to="/"><Home size={16} /></Link>
                <ChevronRight size={16} />
                <Link to="/dashboard/modules">Modules</Link>
                <ChevronRight size={16} />
                <Link to={`/dashboard/modules/${moduleId}`}>{module.title}</Link>
                <ChevronRight size={16} />
                <span>{submodule.title}</span>
            </div>

            <div className="submodule-header">
                <h1>{submodule.title}</h1>
                <StatusBadge status={submodule.status} />
            </div>

            <div className="submodule-main-content">
                <div className="left-column">
                    {videos.length > 0 && activeVideo ? (
                        <div className="section-card">
                            <h2><Video size={24} /> Video Lesson</h2>
                            <div className="video-player-container">
                                {activeVideoUrl ? (
                                    <video key={activeVideo.id} controls autoPlay muted playsInline>
                                        <source src={activeVideoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className="no-video-placeholder">Video not available</div>
                                )}
                            </div>
                            <div className="active-video-title">
                                <h3>{activeVideo.title}</h3>
                                <p>{activeVideo.description?.substring(0, 100)}...</p>
                            </div>
                            {videos.length > 1 && (
                                <div className="video-playlist">
                                    <h4>Up Next</h4>
                                    {videos.map((video) => {
                                        const thumbnailUrl = getFileUrl(video, video.thumbnail);
                                        return (
                                            <div 
                                                key={video.id} 
                                                className={`playlist-item ${video.id === activeVideo.id ? 'active' : ''}`}
                                                onClick={() => setActiveVideo(video)} >
                                                {thumbnailUrl ? (
                                                    <img src={thumbnailUrl} alt={video.title} className="playlist-thumbnail-small" />
                                                ) : (
                                                    <div className="playlist-thumbnail-placeholder"><PlayCircle size={20} /></div>
                                                )}
                                                <div className="playlist-item-info">
                                                    <p className="playlist-title">{video.title}</p>
                                                    <p className="playlist-duration">{video.duration || 'N/A'} mins</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="section-card">
                            <h2><Video size={24} /> Video Lesson</h2>
                            <p>No videos available for this submodule yet.</p>
                        </div>
                    )}

                    <div className="section-card">
                        <h2><Paperclip size={24} /> Notes & Resources</h2>
                        <div className="resource-list">
                            {notes.length > 0 ? (
                                notes.map(note => (
                                    <a key={note.id} href={pb.files.getURL(note, note.file)} target="_blank" rel="noopener noreferrer">
                                        <BookOpen size={16}/> {note.title}
                                    </a>
                                ))
                            ) : (
                                <p>No resources available yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="section-card">
                        <h2><BookOpen size={20} /> Overview</h2>
                        <div className="overview-content">
                            <p>{submodule.description}</p>
                            <div className="info-item">
                                <label>Estimated Time</label>
                                <p>{submodule.estimated_time || '20 minutes'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h2><ClipboardCheck size={20} /> Assignment</h2>
                        {assignments.length > 0 ? (
                            <div className="assignment-task">
                                {assignments.map(assignment => (
                                    <div key={assignment.id}>
                                        <Link to={`/dashboard/assignments/${assignment.id}`}>{assignment.title}</Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No assignments for this submodule.</p>
                        )}
                        <StatusBadge status={"Submitted"}/>
                    </div>

                    <div className="section-card">
                        <h2><MessageSquare size={20} /> Discussion</h2>
                        <button className="action-btn btn-secondary w-full" onClick={() => alert('Feature coming soon!')}>
                            Ask in Community
                        </button>
                    </div>
                </div>
            </div>

            <footer className="footer-actions">
                <button 
                    className="action-btn btn-primary" 
                    onClick={handleMarkComplete}
                    disabled={submodule.status === 'Completed'}
                >
                    <CheckCircle size={16} />
                    {submodule.status === 'Completed' ? 'Completed' : 'Mark as Complete'}
                </button>
                <button className="action-btn btn-secondary" onClick={() => navigate(`/dashboard/modules/${moduleId}`)}>
                    <ArrowLeft size={16} />
                    Back to Module Details
                </button>
            </footer>
        </div>
    );
};

export default SubmoduleDetailPage;
