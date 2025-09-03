import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import { Save, X, UploadCloud, Film, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import './VideoForm.css';

const Notification = ({ message, type }) => {
    if (!message) return null;

    const isSuccess = type === 'success';
    const icon = isSuccess ? <CheckCircle size={20} /> : <AlertTriangle size={20} />;
    const notificationClass = isSuccess ? 'notification-success' : 'notification-error';

    return (
        <div className={`notification-card ${notificationClass}`}>
            <div className="notification-icon">{icon}</div>
            <span>{message}</span>
        </div>
    );
};

const VideoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [video, setVideo] = useState({
        title: '',
        description: '',
        module: '',
        submodule: '',
        duration: '',
        status: 'Draft',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [modules, setModules] = useState([]);
    const [submodules, setSubmodules] = useState([]);
    const [notification, setNotification] = useState({ message: null, type: null });

    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const moduleRecords = await pb.collection('modules').getFullList({ sort: 'title' });
                setModules(moduleRecords);
            } catch (error) {
                console.error("Failed to fetch modules:", error);
            }
        };

        fetchModules();
    }, []);

    useEffect(() => {
        const fetchSubmodules = async (moduleId) => {
            if (!moduleId) {
                setSubmodules([]);
                return;
            }
            try {
                const submoduleRecords = await pb.collection('submodules').getFullList({
                    filter: `module='${moduleId}'`,
                    sort: 'title'
                });
                setSubmodules(submoduleRecords);
            } catch (error) {
                console.error("Failed to fetch submodules:", error);
            }
        };

        if (video.module) {
            fetchSubmodules(video.module);
        }
    }, [video.module]);

    useEffect(() => {
        const fetchVideo = async (videoId) => {
            try {
                const record = await pb.collection('videos').getOne(videoId, { expand: 'submodule' });
                setVideo({
                    title: record.title,
                    description: record.description,
                    module: record.expand?.submodule?.module || '',
                    submodule: record.submodule || '',
                    duration: record.duration,
                    status: record.status,
                });
                if (record.thumbnail) {
                    setThumbnailPreview(pb.getFileUrl(record, record.thumbnail));
                }
            } catch (error) {
                console.error("Failed to fetch video details:", error);
            }
        };

        if (isEditMode) {
            fetchVideo(id);
        }
    }, [id, isEditMode]);

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: null, type: null });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVideo(prev => ({ ...prev, [name]: value }));
        if (name === 'module') {
            setVideo(prev => ({ ...prev, submodule: '' }));
        }
    };

    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            if (setPreview) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', video.title);
        formData.append('description', video.description);
        formData.append('submodule', video.submodule);
        formData.append('duration', video.duration);
        formData.append('status', video.status);
        
        if (videoFile) formData.append('file', videoFile);
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

        try {
            if (isEditMode) {
                await pb.collection('videos').update(id, formData);
            } else {
                await pb.collection('videos').create(formData);
            }
            setNotification({ message: 'Video saved successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/admin-dashboard/videos');
            }, 1500);

        } catch (error) {
            console.error("Failed to save video:", error);
            setNotification({ message: 'Failed to save video. Please try again.', type: 'error' });
        }
    };

    return (
        <div className="video-form-container">
            <Notification message={notification.message} type={notification.type} />
            <form onSubmit={handleSubmit}>
                 <div className="form-header">
                    <div>
                        <h1>{isEditMode ? 'Edit Video' : 'Upload New Video'}</h1>
                        <p>Add a new video lesson and attach it to a module and submodule.</p>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <Save size={18} className="btn-icon" />
                        {isEditMode ? 'Save Changes' : 'Save Video'}
                    </button>
                </div>

                <div className="form-section">
                    <h2>Video Information</h2>
                    <div className="form-field">
                        <label htmlFor="title">Video Title <span className="required">*</span></label>
                        <input type="text" name="title" id="title" className="bg-white" value={video.title} onChange={handleChange} placeholder='e.g., "Setup JDK & IDE"' required />
                    </div>
                    <div className="form-field">
                        <label htmlFor="description">Description</label>
                        <textarea name="description" id="description" value={video.description} onChange={handleChange} placeholder='e.g., "This video explains how to install JDK and configure IntelliJ IDE."'></textarea>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-field">
                            <label htmlFor="module">Select Module <span className="required">*</span></label>
                            <select name="module" id="module" value={video.module} onChange={handleChange} required>
                                <option value="" disabled>Select a module</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="submodule">Select Submodule <span className="required">*</span></label>
                            <select name="submodule" id="submodule" value={video.submodule} onChange={handleChange} required disabled={!video.module}>
                                <option value="" disabled>Select a submodule</option>
                                {submodules.map(sm => (
                                    <option key={sm.id} value={sm.id}>{sm.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="duration">Duration</label>
                            <input type="text" name="duration" id="duration" className='bg-white' value={video.duration} onChange={handleChange} placeholder="e.g., 08:15" />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="form-section">
                        <h2>Upload Section</h2>
                        <div className="form-field">
                            <label>Video File <span className="required">*</span></label>
                            <div className="upload-field" onClick={() => videoInputRef.current.click()}>
                                <UploadCloud size={40} className="upload-icon" />
                                <p>Click to browse or drag & drop</p>
                                <span>Accepted formats: .mp4, .mov, .avi, .mkv</span>
                                <input type="file" name="videoFile" ref={videoInputRef} onChange={(e) => handleFileChange(e, setVideoFile)} accept=".mp4,.mov,.avi,.mkv" style={{ display: 'none' }} {...(!isEditMode && { required: true })} />
                            </div>
                        </div>
                        {videoFile && (
                            <div className="preview-section">
                                <div className="thumbnail-preview"><Film className="placeholder-icon" size={40} /></div>
                                <div className='file-info'>
                                    <p>{videoFile.name}</p>
                                    <span>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h2>Thumbnail & Settings</h2>
                        <div className="form-field">
                            <label>Thumbnail</label>
                            <div className="upload-field" onClick={() => thumbnailInputRef.current.click()}>
                                <UploadCloud size={40} className="upload-icon" />
                                <p>Click to browse or drag & drop</p>
                                <span>Accepted formats: .jpg, .png</span>
                                <input type="file" name="thumbnailFile" ref={thumbnailInputRef} onChange={(e) => handleFileChange(e, setThumbnailFile, setThumbnailPreview)} accept=".jpg,.jpeg,.png" style={{ display: 'none' }} />
                            </div>
                        </div>
                        {(thumbnailPreview || thumbnailFile) && (
                            <div className="preview-section">
                                <div className="thumbnail-preview">
                                    {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail Preview" /> : <ImageIcon className="placeholder-icon" size={40} />}
                                </div>
                                <div className='file-info'>
                                    <p>{thumbnailFile ? thumbnailFile.name : "Current Thumbnail"}</p>
                                    {thumbnailFile && <span>{(thumbnailFile.size / 1024).toFixed(2)} KB</span>}
                                </div>
                            </div>
                        )}
                         <div className="form-field" style={{marginTop: '1.5rem'}}>
                            <label htmlFor="status">Status <span className="required">*</span></label>
                            <select name="status" id="status" value={video.status} onChange={handleChange}>
                                <option value="Draft">Draft</option>
                                <option value="Active">Active</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin-dashboard/videos')} className="btn btn-secondary">
                        <X size={18} className="btn-icon" />
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <Save size={18} className="btn-icon" />
                        {isEditMode ? 'Save Changes' : 'Save Video'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoForm;
