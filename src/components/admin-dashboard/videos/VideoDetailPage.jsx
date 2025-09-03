import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import { Edit, Trash2, Power, PowerOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import './VideoDetailPage.css'; // Import the new CSS

const VideoDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);

    const fetchVideo = async (videoId) => {
        try {
            const record = await pb.collection('videos').getOne(videoId, {
                expand: 'module',
            });
            setVideo(record);
        } catch (error) {
            console.error("Failed to fetch video details:", error);
            // Optionally navigate to a not-found page or show an error message
        }
    };

    useEffect(() => {
        if (id) {
            fetchVideo(id);
        }
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
            try {
                await pb.collection('videos').delete(id);
                navigate('/admin-dashboard/videos');
            } catch (error) {
                console.error("Failed to delete video:", error);
                alert("Failed to delete video. Please try again.");
            }
        }
    };

    const handlePublishToggle = async () => {
        if (!video) return;
        try {
            const newStatus = video.status === 'Active' ? 'Draft' : 'Active';
            const updatedVideo = await pb.collection('videos').update(id, { status: newStatus });
            setVideo(prev => ({ ...prev, status: updatedVideo.status })); // Update state locally
        } catch (error) {
            console.error("Failed to toggle publish status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    if (!video) {
        return <div className="video-detail-container">Loading...</div>;
    }

    const videoUrl = video.file ? pb.getFileUrl(video, video.file) : null;
    const thumbnailUrl = video.thumbnail ? pb.getFileUrl(video, video.thumbnail) : null;
    const isPublished = video.status === 'Active';

    return (
        <div className="video-detail-container">
            <div className="detail-header">
                 <div className="detail-header-title">
                    <Link to="/admin-dashboard/videos" className="btn back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1>{video.title}</h1>
                </div>
                <div className="header-actions">
                    <Link to={`/admin-dashboard/videos/edit/${id}`} className="btn btn-secondary">
                        <Edit size={18} className="btn-icon" />
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-danger">
                        <Trash2 size={18} className="btn-icon" />
                        Delete
                    </button>
                    <button onClick={handlePublishToggle} className={`btn ${isPublished ? 'btn-warning' : 'btn-success'}`}>
                        {isPublished ? (
                            <><PowerOff size={18} className="btn-icon" /> Unpublish</>
                        ) : (
                            <><Power size={18} className="btn-icon" /> Publish</>
                        )}
                    </button>
                </div>
            </div>

            <div className="detail-layout">
                {/* Left Side: Player and Thumbnail */}
                <div className="video-player-section">
                    {videoUrl ? (
                        <video controls controlsList="nodownload">
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="video-placeholder">No video file uploaded.</div>
                    )}
                    {/* {thumbnailUrl && (
                        <div className="thumbnail-preview-detail">
                            <img src={thumbnailUrl} alt={`${video.title} thumbnail`} />
                        </div>
                    )} */}
                </div>

                {/* Right Side: Information */}
                <div className="video-info-section">
                    <h2>Video Information</h2>
                    <div className="info-item">
                        <label>Title</label>
                        <p>{video.title}</p>
                    </div>
                    <div className="info-item">
                        <label>Description</label>
                        <p className="description">{video.description || 'No description provided.'}</p>
                    </div>
                    <div className="info-item">
                        <label>Module Linked</label>
                        <p>{video.expand?.module?.title || 'Not linked to any module.'}</p>
                    </div>
                    <div className="info-item">
                        <label>Duration</label>
                        <p>{video.duration || 'N/A'}</p>
                    </div>
                     <div className="info-item">
                        <label>Status</label>
                        <p>
                            <span className={`status-badge ${isPublished ? 'active' : 'draft'}`}>
                                {isPublished ? 
                                    <CheckCircle size={14} className="status-badge-icon" /> : 
                                    <XCircle size={14} className="status-badge-icon" />
                                }
                                {video.status}
                            </span>
                        </p>
                    </div>
                    <div className="info-item">
                        <label>Uploaded At</label>
                        <p>{new Date(video.created).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;
