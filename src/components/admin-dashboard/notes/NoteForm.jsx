import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import { Save, X, UploadCloud, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import './NoteForm.css';

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

const NoteForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        module: '',      // To manage the parent module dropdown
        submodule: '',  // To store the selected submodule ID
        status: 'Draft',
    });
    const [file, setFile] = useState(null);
    const [modules, setModules] = useState([]);
    const [submodules, setSubmodules] = useState([]);
    const [notification, setNotification] = useState({ message: null, type: null });

    const fileInputRef = useRef(null);

    // Fetch modules on component mount
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

    // Fetch submodules when a module is selected
    useEffect(() => {
        const fetchSubmodules = async (moduleId) => {
            if (!moduleId) {
                setSubmodules([]);
                return;
            }
            try {
                const records = await pb.collection('submodules').getFullList({
                    filter: `module = '${moduleId}'`,
                    sort: 'order',
                });
                setSubmodules(records);
            } catch (error) {
                console.error("Failed to fetch submodules:", error);
                setSubmodules([]);
            }
        };

        fetchSubmodules(formData.module);
    }, [formData.module]);

    // Fetch note data in edit mode
    useEffect(() => {
        const fetchNote = async (noteId) => {
            try {
                const record = await pb.collection('notes').getOne(noteId, { expand: 'submodule' });
                setFormData({
                    title: record.title,
                    description: record.description,
                    submodule: record.submodule || '',
                    status: record.status,
                    module: record.expand?.submodule?.module || '', 
                });
            } catch (error) {
                console.error("Failed to fetch note details:", error);
                setNotification({ message: 'Failed to load note data.', type: 'error' });
            }
        };

        if (isEditMode) {
            fetchNote(id);
        }
    }, [id, isEditMode]);

    // Notification timer
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: null, type: null }), 2000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset submodule when module changes
        if (name === 'module') {
            setFormData(prev => ({ ...prev, submodule: '' }));
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('submodule', formData.submodule);
        data.append('status', formData.status);
        
        if (file) {
            data.append('file', file);
        }

        try {
            if (isEditMode) {
                await pb.collection('notes').update(id, data);
            } else {
                await pb.collection('notes').create(data);
            }
            setNotification({ message: 'Note saved successfully!', type: 'success' });
            setTimeout(() => navigate('/admin-dashboard/notes'), 1500);

        } catch (error) {
            console.error("Failed to save note:", error);
            setNotification({ message: 'Failed to save note. Check all required fields.', type: 'error' });
        }
    };

    return (
        <div className="note-form-container">
            <Notification message={notification.message} type={notification.type} />
            <form onSubmit={handleSubmit}>
                 <div className="form-header">
                    <div>
                        <h1>{isEditMode ? 'Edit Note' : 'Add New Note'}</h1>
                        <p>Attach notes to a module and submodule for students.</p>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <Save size={18} className="btn-icon" />
                        {isEditMode ? 'Save Changes' : 'Save Note'}
                    </button>
                </div>

                <div className="form-section">
                    <h2>Note Information</h2>
                    <div className="form-field">
                        <label htmlFor="title">Title <span className="required">*</span></label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} placeholder='e.g., "Java Fundamentals Cheatsheet"' required />
                    </div>
                    <div className="form-field">
                        <label htmlFor="description">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} placeholder='e.g., "A quick reference for Java syntax and basic concepts."'></textarea>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-field">
                            <label htmlFor="module">Select Module <span className="required">*</span></label>
                            <select name="module" id="module" value={formData.module} onChange={handleChange} required>
                                <option value="" disabled>Select a module</option>
                                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="submodule">Select Submodule <span className="required">*</span></label>
                            <select name="submodule" id="submodule" value={formData.submodule} onChange={handleChange} required disabled={!formData.module}>
                                <option value="" disabled>Select a submodule</option>
                                {submodules.map(sm => <option key={sm.id} value={sm.id}>{sm.title}</option>)}
                            </select>
                        </div>
                         <div className="form-field">
                            <label htmlFor="status">Status <span className="required">*</span></label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange}>
                                <option value="Draft">Draft</option>
                                <option value="Active">Active</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Upload Section</h2>
                    <div className="form-field">
                        <label>Note File <span className="required">*</span></label>
                        <div className="upload-field" onClick={() => fileInputRef.current.click()}>
                            <UploadCloud size={40} className="upload-icon" />
                            <p>Click to browse or drag & drop</p>
                            <span>Accepted formats: .pdf, .docx, .pptx, .txt</span>
                            <input type="file" name="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.pptx,.txt" style={{ display: 'none' }} {...(!isEditMode && { required: true })} />
                        </div>
                    </div>
                    {file && (
                        <div className="preview-section">
                            <div className="thumbnail-preview"><FileText className="placeholder-icon" size={40} /></div>
                            <div className='file-info'>
                                <p>{file.name}</p>
                                <span>{(file.size / 1024).toFixed(2)} KB</span>
                            </div>
                        </div>
                    )}
                     {isEditMode && !file && <p className='file-info-edit'>Leave empty to keep the current file.</p>}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin-dashboard/notes')} className="btn btn-secondary">
                        <X size={18} className="btn-icon" />
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <Save size={18} className="btn-icon" />
                        {isEditMode ? 'Save Changes' : 'Save Note'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NoteForm;
