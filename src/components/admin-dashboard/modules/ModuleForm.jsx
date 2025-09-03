import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, File, Image as ImageIcon } from 'lucide-react';
import './ModuleForm.css'; // Assume CSS is adapted from NoteForm.css

const ModuleForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState(initialData.title || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [category, setCategory] = useState(initialData.category || '');
    const [order, setOrder] = useState(initialData.order || 0);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(initialData.thumbnail || null);
    const [error, setError] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            setError('Title is required.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('order', order);
        
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        try {
            await onSubmit(formData);
            navigate('/admin-dashboard/modules');
        } catch (err) {
            setError(`Failed to ${isEditing ? 'update' : 'create'} module. Please try again.`);
            console.error('Form submission error:', err);
        }
    };

    return (
        <div className="module-form-container">
            <header className="form-header">
                <h1>
                    {isEditing ? 'Edit Module' : 'Add New Module'}
                </h1>
                <div className="form-actions">
                    <button onClick={() => navigate('/admin-dashboard/modules')} className="back-link">
                        <ArrowLeft size={18} />
                        Back to Modules
                    </button>
                    <button onClick={handleSubmit} className="save-button">
                        {isEditing ? 'Save Changes' : 'Create Module'}
                    </button>
                </div>
            </header>

            {error && <p className="error-message">{error}</p>}

            <form className="module-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2>Module Details</h2>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Module Title <span className="required">*</span></label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                placeholder="e.g., Introduction to JavaScript"
                            />
                        </div>
                        <div className="form-field">
                            <label>Category</label>
                            <input 
                                type="text" 
                                value={category} 
                                onChange={e => setCategory(e.target.value)} 
                                placeholder="e.g., Web Development"
                            />
                        </div>
                        <div className="form-field">
                            <label>Order</label>
                            <input 
                                type="number" 
                                value={order} 
                                onChange={e => setOrder(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="form-field" style={{ marginTop: '1.5rem' }}>
                        <label>Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="A brief summary of what this module covers."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Module Thumbnail</h2>
                    <div {...getRootProps({ className: 'upload-field' })}>
                        <input {...getInputProps()} />
                        <Upload size={36} className="upload-icon" />
                        <p>Click to upload or drag and drop</p>
                        <span>PNG, JPG, GIF up to 10MB</span>
                    </div>

                    {thumbnailPreview && (
                        <div className="preview-section">
                            <div className="thumbnail-preview">
                                <img src={thumbnailPreview} alt="Thumbnail preview" />
                            </div>
                            <div className="file-info">
                                <p>{thumbnail ? thumbnail.name : 'Current thumbnail'}</p>
                                {thumbnail && <span>{Math.round(thumbnail.size / 1024)} KB</span>}
                                {!thumbnail && isEditing && <span className='file-info-edit'>Upload a new file to replace this</span>}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ModuleForm;
