import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './NoteDetailPage.css'; // Import the new CSS
import { FileText, Calendar, User, Download, Trash2, Save, Edit, CheckCircle } from 'lucide-react';

const NoteDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [module, setModule] = useState(null);
    const [uploader, setUploader] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchNoteData = async () => {
            try {
                const noteRecord = await pb.collection('notes').getOne(id, { expand: 'module,uploaded_by', signal });
                setNote(noteRecord);
                setFormData({ title: noteRecord.title, description: noteRecord.description });

                if (noteRecord.expand.module) {
                    setModule(noteRecord.expand.module);
                }
                if (noteRecord.expand.uploaded_by) {
                    setUploader(noteRecord.expand.uploaded_by);
                }

            } catch (err) {
                if (!err.isAbort) {
                    console.error("Failed to fetch note details:", err);
                    setError('Note not found or an error occurred.');
                }
            }
            if (!signal.aborted) {
                setLoading(false);
            }
        };

        fetchNoteData();

        return () => {
            abortController.abort();
        };
    }, [id]);

    const handleUpdate = async () => {
        try {
            await pb.collection('notes').update(id, { title: formData.title, description: formData.description });
            setNote(prev => ({ ...prev, ...formData }));
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update note:", err);
            setError('Failed to save changes. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note permanently?')) {
            try {
                await pb.collection('notes').delete(id);
                navigate('/admin-dashboard/notes');
            } catch (err) {
                console.error("Failed to delete note:", err);
                setError('Failed to delete note. It might be linked to other records.');
            }
        }
    };

    if (loading) return <div className="note-detail-container"><p>Loading note details...</p></div>;
    if (error) return <div className="note-detail-container"><p className="text-red-500">{error}</p></div>;
    if (!note) return null;

    const getFileUrl = () => pb.files.getURL(note, note.file);

    return (
        <div className="note-detail-container">
            <div className="note-detail-header">
                <h1>Note Details</h1>
                <p>View and manage this uploaded note.</p>
                <nav className="breadcrumb-nav">
                    <Link to="/admin-dashboard/notes">Notes</Link>
                    <span>&rarr;</span>
                    <span>{note.title}</span>
                </nav>
            </div>

            <div className="note-detail-grid">
                <div className="note-main-content">
                    {isEditing ? (
                        <>
                            <div className="detail-group">
                                <label>Note Title</label>
                                <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="detail-group">
                                <label>Description</label>
                                <textarea className="form-textarea" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="4"></textarea>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="detail-group">
                                <label>Note Title</label>
                                <p className="detail-value">{note.title}</p>
                            </div>
                            <div className="detail-group">
                                <label>Description</label>
                                <p className="detail-value">{note.description || 'No description provided.'}</p>
                            </div>
                        </>
                    )}
                    
                    <div className="detail-group">
                        <label>Module Linked</label>
                        <p className="detail-value">{module ? module.title : 'Not assigned'}</p>
                    </div>

                    <div className="detail-group">
                        <label>Uploaded File</label>
                        <div className="file-info detail-value">
                            <span className="file-name"><FileText size={18} style={{ marginRight: '8px' }}/>{note.file || 'No file uploaded'}</span>
                            <div>
                                <button className="btn-secondary-form" style={{marginRight:"10px"}} onClick={() => window.open(getFileUrl(), '_blank')}>Download</button>
                                <button className="btn-secondary-form">Replace</button>
                            </div>
                        </div>
                    </div>

                    <div className="note-actions">
                        {isEditing ? (
                            <button className="btn-primary-form" onClick={handleUpdate}><Save size={18}/> Save Changes</button>
                        ) : (
                            <button className="btn-primary-form" onClick={() => setIsEditing(true)}><Edit size={18}/> Edit</button>
                        )}
                        <button className="btn-danger-form" onClick={handleDelete}><Trash2 size={18}/> Delete Note</button>
                    </div>

                </div>

                <aside className="note-meta-sidebar">
                    <h3>Meta Information</h3>
                    <div className="meta-group">
                        <div className="meta-item">
                            <span className="meta-label"><User size={16}/> Uploaded By:</span>
                            <span className="meta-value">{uploader ? uploader.name : 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label"><Calendar size={16}/> Upload Date:</span>
                            <span className="meta-value">{new Date(note.created).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label"><Calendar size={16}/> Last Updated:</span>
                            <span className="meta-value">{new Date(note.updated).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label"><CheckCircle size={16}/> Status:</span>
                            <span className="meta-value">{note.status}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default NoteDetailPage;
