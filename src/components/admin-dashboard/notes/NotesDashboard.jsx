import React, { useState, useEffect } from 'react';
import pb from '../../../lib/pocketbase';
import { Link } from 'react-router-dom';
import { Plus, FileText, BookCopy, Clock, CheckCircle, XCircle, Trash2, Edit, Eye, Power, PowerOff } from 'lucide-react';
import './NotesDashboard.css';

const NotesDashboard = () => {
    const [notes, setNotes] = useState([]);
    const [stats, setStats] = useState({
        totalNotes: 0,
        modulesWithNotes: 0,
        recentlyAdded: 'N/A',
    });

    const fetchNotesData = async () => {
        try {
            const notesRecords = await pb.collection('notes').getFullList({
                sort: '-created',
                expand: 'module',
            });

            setNotes(notesRecords);

            // Calculate Stats
            const modules = new Set(notesRecords.filter(n => n.module).map(n => n.module));
            setStats({
                totalNotes: notesRecords.length,
                modulesWithNotes: modules.size,
                recentlyAdded: notesRecords.length > 0 ? notesRecords[0].title : 'N/A',
            });

        } catch (error) {
            console.error("Failed to fetch notes data:", error);
        }
    };

    useEffect(() => {
        fetchNotesData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await pb.collection('notes').delete(id);
                fetchNotesData(); // Refresh data
            } catch (error) {
                console.error("Failed to delete note:", error);
            }
        }
    };

    const handlePublishToggle = async (note) => {
        try {
            const newStatus = note.status === 'Active' ? 'Draft' : 'Active';
            await pb.collection('notes').update(note.id, { status: newStatus });
            fetchNotesData(); // Refresh data
        } catch (error) {
            console.error("Failed to toggle publish status:", error);
        }
    };

    const getFileType = (filename) => {
        if (typeof filename !== 'string' || !filename) {
            return 'N/A';
        }
        const extension = filename.split('.').pop();
        return extension ? extension.toUpperCase() : 'N/A';
    };

    return (
        <div className="notes-container container mx-auto p-4">
            {/* Header */}
            <div className="notes-header flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Notes Management</h1>
                <Link to="/admin-dashboard/notes/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
                    <Plus size={20} className="mr-2"/> Upload Notes
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="notes-stats-card">
                    <h2><FileText size={16} className="mr-2"/> Total Notes Uploaded</h2>
                    <p>{stats.totalNotes}</p>
                </div>
                <div className="notes-stats-card">
                    <h2><BookCopy size={16} className="mr-2"/> Modules with Notes</h2>
                    <p>{stats.modulesWithNotes}</p>
                </div>
                <div className="notes-stats-card">
                    <h2><Clock size={16} className="mr-2"/> Recently Added</h2>
                    <p className="text-lg truncate">{stats.recentlyAdded}</p>
                </div>
            </div>

            {/* Notes Table */}
            <div className="notes-table-container">
                <table className="notes-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Module</th>
                            <th>File Type</th>
                            <th>Upload Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.map(note => (
                            <tr key={note.id}>
                                <td>{note.title}</td>
                                <td>{note.expand?.module?.title || 'N/A'}</td>
                                <td>{getFileType(note.file)}</td>
                                <td>{new Date(note.created).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-badge-notes ${note.status === 'Active' ? 'active' : 'draft'}`}>
                                        {note.status === 'Active' ? <CheckCircle size={14} className="icon"/> : <XCircle size={14} className="icon"/>}
                                        {note.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Link to={`/admin-dashboard/notes/${note.id}`} title="View"><Eye size={20}/></Link>
                                        <Link to={`/admin-dashboard/notes/edit/${note.id}`} title="Edit"><Edit size={20}/></Link>
                                        <button onClick={() => handleDelete(note.id)} className="delete-btn" title="Delete"><Trash2 size={20}/></button>
                                        <button onClick={() => handlePublishToggle(note)} className="publish-btn" title={note.status === 'Active' ? 'Unpublish' : 'Publish'}>
                                            {note.status === 'Active' ? <PowerOff size={20}/> : <Power size={20}/>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NotesDashboard;
