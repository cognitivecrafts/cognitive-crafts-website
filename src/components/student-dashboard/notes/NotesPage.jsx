import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './NotesPage.css';
import pb from '../../../lib/pocketbase';
import { Book, Search, Filter, Download, ArrowRight, User, Calendar, Tag } from 'lucide-react';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [modules, setModules] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModuleFilter, setActiveModuleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotesAndModules = async () => {
            try {
                setLoading(true);
                const [notesData, modulesData] = await Promise.all([
                    pb.collection('notes').getFullList({
                        filter: 'status = "Active"',
                        expand: 'module,submodule',
                        sort: '-created'
                    }),
                    pb.collection('modules').getFullList({ sort: 'order' })
                ]);
                setNotes(notesData);
                setModules(modulesData);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Could not load notes at this time. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotesAndModules();
    }, []);

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => {
                if (activeModuleFilter !== 'all' && note.expand?.module?.id !== activeModuleFilter) {
                    return false;
                }
                if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
                return true;
            });
    }, [notes, searchTerm, activeModuleFilter]);
    
    const getFileUrl = (record, filename) => {
        if (!record || !filename) return '#';
        // Assuming single file for simplicity, update if multiple files are handled
        const file = Array.isArray(filename) ? filename[0] : filename;
        return pb.getFileUrl(record, file);
    };


    if (loading) {
        return <div className="notes-page-container"><p>Loading notes...</p></div>;
    }

    if (error) {
        return <div className="notes-page-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="notes-page-container">
            <header className="notes-header">
                <div className="title-section">
                    <Book size={40} className="header-icon"/>
                    <div>
                        <h1>Notes</h1>
                        <p>Your central hub for all course materials and notes.</p>
                    </div>
                </div>
                <div className="actions-section">
                    <div className="search-bar">
                        <Search size={18} className="search-icon"/>
                        <input 
                            type="text" 
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdown">
                        <Filter size={18} className="filter-icon" />
                        <select 
                            value={activeModuleFilter} 
                            onChange={(e) => setActiveModuleFilter(e.target.value)}
                        >
                            <option value="all">All Modules</option>
                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            <main className="notes-grid">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map(note => (
                        <div key={note.id} className="note-card">
                            <div className="note-card-header">
                                <h3>{note.title}</h3>
                            </div>
                            <div className="note-card-body">
                                <p className="description">{note.description?.substring(0, 100)}...</p>
                                <div className="meta-info">
                                    <span title="Module">
                                        <Book size={14}/> 
                                        {note.expand?.module?.title || 'N/A'}
                                        {note.expand?.submodule && ` → ${note.expand?.submodule?.title}`}
                                    </span>
                                    <span title="Author">
                                        <User size={14}/> 
                                        By {note.author || 'Admin'}
                                    </span>
                                    <span title="Upload Date">
                                        <Calendar size={14}/> 
                                        {new Date(note.created).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="note-card-footer">
                                <a 
                                    href={getFileUrl(note, note.file)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="action-btn download-btn"
                                    download
                                >
                                    <Download size={16}/> Download
                                </a>
                                <Link to={`/dashboard/notes/${note.id}`} className="action-btn view-btn">
                                    View Detail <ArrowRight size={16}/>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-notes-found">
                        <h3>No Notes Found</h3>
                        <p>There are no notes matching your current filters. Try a different search or filter.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotesPage;