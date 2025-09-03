import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './NoteDetailPage.css';
import { 
    ArrowLeft,
    Book, 
    User, 
    Calendar, 
    Tag, 
    Download, 
    Eye, 
    CheckCircle, 
    Star, 
    Bookmark, 
    MessageSquare,
    Paperclip
} from 'lucide-react';

const NoteDetailPage = () => {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                setLoading(true);
                const record = await pb.collection('notes').getOne(noteId, {
                    expand: 'module,submodule'
                });
                setNote(record);
            } catch (err) {
                setError('Failed to fetch note details.');
                console.error("Fetch Note Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [noteId]);

    const getFileUrl = (record, filename) => {
        return pb.files.getUrl(record, filename);
    };

    const handleStatusToggle = async () => {
        if (!note) return;
        const newStatus = note.status === 'Completed' ? 'In Progress' : 'Completed';
        try {
            const updatedNote = await pb.collection('notes').update(noteId, { status: newStatus });
            setNote(updatedNote);
        } catch (err) {
            console.error("Status Update Error:", err);
        }
    };

    if (loading) {
        return <div className="note-detail-loading">Loading note...</div>;
    }

    if (error) {
        return <div className="note-detail-error">{error}</div>;
    }

    return (
        <div className="note-detail-page">
            <header className="note-detail-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={20} />
                    Back to Notes
                </button>
                <h1 className="note-title">{note?.title}</h1>
                <p className="note-breadcrumb">
                    {note?.expand?.module && <Link to={`/dashboard/modules/${note.expand.module.id}`}>{note.expand.module.title}</Link>}
                    {note?.expand?.submodule && <span> → {note.expand.submodule.title}</span>}
                </p>
            </header>

            <section className="note-info-block">
                <div className="info-item"><strong>Description:</strong> {note?.description || 'No description available.'}</div>
                <div className="info-item"><User size={16}/> <strong>Author:</strong> {note?.author || 'Admin'}</div>
                <div className="info-item"><Calendar size={16}/> <strong>Upload Date:</strong> {new Date(note?.created).toLocaleDateString()}</div>
                <div className="info-item"><Tag size={16}/> <strong>Status:</strong> <span className={`status-tag status-${note?.status?.toLowerCase().replace(' ', '-')}`}>{note?.status}</span></div>
            </section>

            <section className="note-content-area card">
                <h3><Paperclip/> Attached File</h3>
                {note?.file ? (
                    <div className="file-actions">
                        <a href={getFileUrl(note, note.file)} target="_blank" rel="noopener noreferrer" className="action-btn view-btn">
                            <Eye size={18}/> View Online
                        </a>
                        <a href={getFileUrl(note, note.file)} download className="action-btn download-btn">
                            <Download size={18}/> Download Note
                        </a>
                    </div>
                ) : (
                    <p>No file attached to this note.</p>
                )}
            </section>

            <section className="user-actions-area card">
                <h3>Actions</h3>
                <div className="action-buttons">
                    <button onClick={handleStatusToggle} className="action-btn">
                        <CheckCircle size={18}/> Mark as {note?.status === 'Completed' ? 'In Progress' : 'Completed'}
                    </button>
                    <button className="action-btn"><Star size={18}/> Save to My Notes</button>
                    <button className="action-btn"><Bookmark size={18}/> Add to Module Tracker</button>
                </div>
            </section>

            <section className="discussion-area card">
                 <h3><MessageSquare/> Discussion</h3>
                <div className="discussion-placeholder">
                    <p>Discussion forum coming soon!</p>
                </div>
            </section>
        </div>
    );
};

export default NoteDetailPage;
