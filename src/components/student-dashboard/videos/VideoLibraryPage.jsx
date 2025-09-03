import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './VideoLibraryPage.css';
import pb from '../../../lib/pocketbase';
import { 
    Video, 
    Search, 
    Book, 
    Layers, 
    Clock, 
    User, 
    Calendar, 
    ThumbsUp, 
    MessageSquare, 
    FolderPlus, 
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Eye
} from 'lucide-react';

const WatchedBadge = () => (
    <div className="status-badge status-completed">
        <Eye size={16} /> Watched
    </div>
);

const VideoDetails = ({ video, onWatchToggle }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    if (!video) return null;

    const toggleDescription = () => setIsDescriptionExpanded(!isDescriptionExpanded);

    const description = video.description || 'No description available.';
    const isLongDescription = description.length > 200;

    return (
        <section className="video-details-section">
            <div className="video-title-header">
                <h2>{video.title}</h2>
                {video.watched && <WatchedBadge />}
            </div>
            
            <div className="video-meta-info">
                <div className="meta-item"><Clock size={16}/> {video.duration || 'N/A'} Mins</div>
                <div className="meta-item"><Calendar size={16} /> {new Date(video.created).toLocaleDateString()}</div>
                <div className="meta-item"><User size={16} /> By {video.author || 'Admin'}</div> 
            </div>

            <div className="video-actions">
                <button className="action-btn" onClick={() => alert('Liked!')}><ThumbsUp size={18}/> Like</button>
                <button className="action-btn" onClick={() => alert('Comments coming soon!')}><MessageSquare size={18}/> Comment</button>
                <button className="action-btn" onClick={() => alert('Added to playlist!')}><FolderPlus size={18}/> Save</button>
                <button className={`action-btn primary ${video.watched ? 'watched' : ''}`} onClick={() => onWatchToggle(video)}>
                    <CheckCircle size={18}/> {video.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
                </button>
            </div>

            <div className="video-description">
                <h4>Description</h4>
                <p>
                    {isLongDescription && !isDescriptionExpanded 
                        ? `${description.substring(0, 200)}...` 
                        : description}
                </p>
                {isLongDescription && (
                    <button onClick={toggleDescription} className="show-more-btn">
                        {isDescriptionExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16} />}
                        {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                    </button>
                )}
            </div>
        </section>
    );
};

const VideoLibraryPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [videos, setVideos] = useState([]);
    const [modules, setModules] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [activeFilter, setActiveFilter] = useState({ type: 'all', id: '' });
    const [sortOption, setSortOption] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [videoRecords, moduleRecords] = await Promise.all([
                    pb.collection('videos').getFullList({
                        filter: 'status = "Active"',
                        sort: '-created',
                        expand: 'module,submodule'
                    }),
                    pb.collection('modules').getFullList({ sort: 'order' })
                ]);
                
                setVideos(videoRecords);
                setModules(moduleRecords);

                if (videoRecords.length > 0) {
                    const videoId = searchParams.get('video');
                    const initialVideo = videoId 
                        ? videoRecords.find(v => v.id === videoId)
                        : videoRecords[0];
                    setActiveVideo(initialVideo || videoRecords[0]);
                } else {
                    setActiveVideo(null);
                }

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Could not load the video library.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleWatched = async (videoToUpdate) => {
        try {
            const newWatchedStatus = !videoToUpdate.watched;
            const updatedVideo = await pb.collection('videos').update(videoToUpdate.id, { watched: newWatchedStatus });

            // Update local state
            setActiveVideo(updatedVideo);
            setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));

        } catch (err) {
            console.error("Failed to update watched status:", err);
            alert("Could not update the video status. Please try again.");
        }
    };

    const filteredAndSortedVideos = useMemo(() => {
        let filtered = videos;

        if (activeFilter.type === 'module') {
            filtered = videos.filter(v => v.expand?.submodule?.module === activeFilter.id);
        }

        if (searchTerm) {
            filtered = filtered.filter(v => 
                v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (v.author && v.author.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return [...filtered].sort((a, b) => {
            switch (sortOption) {
                case 'popular': return (b.views || 0) - (a.views || 0);
                case 'duration': return (b.duration || 0) - (a.duration || 0);
                case 'newest':
                default: return new Date(b.created) - new Date(a.created);
            }
        });
    }, [videos, searchTerm, activeFilter, sortOption]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSearchParams(e.target.value ? { search: e.target.value } : {});
    };

    const getFileUrl = (record, filename) => {
        if (!record || !filename) return null;
        return pb.getFileUrl(record, filename);
    }

    if (loading) return <div className="video-library-page"><p>Loading Video Library...</p></div>;
    if (error) return <div className="video-library-page"><p className="error-message">{error}</p></div>;

    const activeVideoUrl = getFileUrl(activeVideo, activeVideo?.file);

    return (
        <div className="video-library-page">
            <header className="library-header">
                <h1><Video /> Video Library</h1>
                <div className="search-and-sort">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by title, description, author..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="sort-options">
                        <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="popular">Popular</option>
                            <option value="duration">Duration</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="library-content">
                <aside className="left-sidebar">
                    <div className="filter-group">
                        <h3><Book /> Modules</h3>
                        <ul className="filter-list">
                            <li onClick={() => setActiveFilter({ type: 'all' })} className={activeFilter.type === 'all' ? 'active' : ''}>
                                <Layers size={16} /> All Videos
                            </li>
                            {modules.map(module => (
                                <li 
                                    key={module.id} 
                                    onClick={() => setActiveFilter({ type: 'module', id: module.id })}
                                    className={activeFilter.id === module.id ? 'active' : ''}
                                >
                                    <Book size={16}/> {module.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <div className="video-main-area">
                    {activeVideo ? (
                        <>
                            <section className="video-player-section">
                                <div className="video-player-container">
                                    {activeVideoUrl ? (
                                        <video key={activeVideo.id} controls autoPlay muted playsInline width="100%" height="100%">
                                            <source src={activeVideoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div className="no-video-placeholder">Video file could not be loaded.</div>
                                    )}
                                </div>
                            </section>

                            <VideoDetails video={activeVideo} onWatchToggle={handleToggleWatched} />
                        </>
                    ) : (
                        <div className="no-videos-message">
                            <h3>No Videos Available</h3>
                            <p>There are currently no active videos in the library. Please check back later or contact an administrator if you believe this is an error.</p>
                        </div>
                    )}
                </div>

                <aside className="right-sidebar">
                    <h3><Layers /> Playlist</h3>
                    <div className="video-playlist">
                        {filteredAndSortedVideos.map(video => {
                            const thumbnailUrl = getFileUrl(video, video.thumbnail) || 'https://via.placeholder.com/120x68.png?text=No+Preview';

                            return (
                                <div 
                                    key={video.id}
                                    className={`video-playlist-item ${activeVideo?.id === video.id ? 'active' : ''}`}
                                    onClick={() => setActiveVideo(video)} >
                                    <img 
                                        src={thumbnailUrl} 
                                        alt={video.title}
                                        className="playlist-thumbnail" 
                                    />
                                    <div className="playlist-video-info">
                                        <h4>{video.title}</h4>
                                        <p>{video.duration || 'N/A'} Mins</p>
                                        {video.watched && <span className="playlist-watched-badge">Watched</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default VideoLibraryPage;
