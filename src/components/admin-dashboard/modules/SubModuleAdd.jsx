import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import './SubModuleAdd.css';

const SubModuleAdd = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams();
    const parentModuleId = moduleId;

    const [parentModule, setParentModule] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState(1);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        const fetchParentModule = async () => {
            if (parentModuleId) {
                try {
                    const moduleRecord = await pb.collection('modules').getOne(parentModuleId);
                    setParentModule(moduleRecord);
                } catch (err) {
                    console.error("Failed to fetch parent module", err);
                    setError("Could not load the parent module. Please go back and try again.");
                }
            } else {
                setError("No parent module specified. Please navigate from the module details page.");
            }
        };
        fetchParentModule();
    }, [parentModuleId]);

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
        setLoading(true);
        setError(null);

        if (!parentModuleId) {
            setError("Cannot create a sub-module without a parent module.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('order', order);
        formData.append('module', parentModuleId);
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        try {
            await pb.collection('submodules').create(formData);
            navigate(`/admin-dashboard/modules`); // Go back to the main modules list
        } catch (err) {
            console.error("Failed to create sub-module:", err);
            setError("Failed to create the sub-module. Please check your inputs and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submodule-add-container">
            <div className="submodule-add-header">
                <h1>Add New Sub Module</h1>
                <div className="breadcrumb">
                    <Link to="/admin-dashboard">Dashboard</Link> &gt; 
                    <Link to="/admin-dashboard/modules">Modules</Link> &gt; 
                    {parentModule ? <Link to={`/admin-dashboard/modules/${parentModuleId}`}>{parentModule.title}</Link> : '...'} &gt; 
                    <span>Add Sub Module</span>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="submodule-add-form">
                <div className="form-group">
                    <label htmlFor="title">Sub Module Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., 'Setup and Introduction'"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add an overview, instructions, and details for this sub-module."
                        rows="6"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="order">Order / Sequence</label>
                    <input
                        id="order"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        min="1"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Thumbnail (Optional)</label>
                    <div className="upload-field" onClick={() => thumbnailInputRef.current.click()}>
                        <UploadCloud size={40} className="upload-icon" />
                        <p>Click to browse or drag & drop</p>
                        <span>Accepted formats: .jpg, .png</span>
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            onChange={(e) => handleFileChange(e, setThumbnail, setThumbnailPreview)}
                            accept=".jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {(thumbnailPreview || thumbnail) && (
                    <div className="preview-section">
                        <div className="thumbnail-preview">
                            {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail Preview" /> : <ImageIcon className="placeholder-icon" size={40} />}
                        </div>
                        <div className='file-info'>
                            <p>{thumbnail ? thumbnail.name : "Current Thumbnail"}</p>
                            {thumbnail && <span>{(thumbnail.size / 1024).toFixed(2)} KB</span>}
                        </div>
                    </div>
                )}

                <div className="form-group-info">
                    <p>You can add resources like videos and notes after creating the sub-module.</p>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Creating...' : 'Create Sub Module'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubModuleAdd;
