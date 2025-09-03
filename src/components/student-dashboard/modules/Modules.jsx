import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Modules.css';
import pb from '../../../lib/pocketbase';
import { Book, Search, Filter, CheckCircle, TrendingUp, Clock, AlertTriangle, Star, BarChart2 } from 'lucide-react';

const STATUS_COLORS = {
    'Completed': '#28a745',   // Green
    'In Progress': '#007bff', // Blue
    'Not Started': '#6c757d'  // Grey
};

const Modules = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchModules = async () => {
            try {
                // Fetch all modules and expand the submodules relation
                const records = await pb.collection('modules').getFullList({
                    sort: 'order',
                    expand: 'submodules(module)', // Correctly expand submodules
                });
                setModules(records);
            } catch (err) {
                console.error("Failed to fetch modules:", err);
                setError("Could not load modules. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);
    
    const processedModules = useMemo(() => {
        return modules.map(module => {
            const submodules = module.expand?.['submodules(module)'] || [];
            const totalSubmodules = submodules.length;
            if (totalSubmodules === 0) {
                return { ...module, progress: 0, status: 'Not Started', completedCount: 0, totalSubmodules: 0 };
            }

            const completedCount = submodules.filter(sm => sm.status === 'Completed').length;
            const inProgressCount = submodules.filter(sm => sm.status === 'In Progress').length;
            const progress = (completedCount / totalSubmodules) * 100;

            let status = 'Not Started';
            if (progress === 100) {
                status = 'Completed';
            } else if (progress > 0 || inProgressCount > 0) {
                status = 'In Progress';
            }

            return { ...module, progress, status, completedCount, totalSubmodules };
        });
    }, [modules]);

    const filteredModules = useMemo(() => {
        return processedModules.filter(module => {
            const matchesFilter = activeFilter === 'All' || module.status === activeFilter;
            const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  module.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [processedModules, activeFilter, searchTerm]);

    const summary = useMemo(() => {
        return processedModules.reduce((acc, module) => {
            acc.total++;
            if (module.status === 'Completed') acc.completed++;
            else if (module.status === 'In Progress') acc.inProgress++;
            else acc.notStarted++;
            return acc;
        }, { total: 0, completed: 0, inProgress: 0, notStarted: 0 });
    }, [processedModules]);

    const getModuleCardAction = (module) => {
        switch (module.status) {
            case 'Completed':
                return { text: 'Review Module', icon: <CheckCircle size={16} />, className: 'btn-review' };
            case 'In Progress':
                return { text: 'Continue Module', icon: <TrendingUp size={16} />, className: 'btn-continue' };
            case 'Not Started':
            default:
                return { text: 'Start Module', icon: <Clock size={16} />, className: 'btn-start' };
        }
    };
    
    if (loading) return <div className="loading-state">Loading your learning journey...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="modules-page-container">
            <header className="modules-main-header">
                <div className="title-section">
                    <h1 className="main-title" ><Book size={35} color='#ffffff'></Book>Modules</h1>
                    <p className="subtitle ">Browse and continue your learning journey.</p>
                </div>
            </header>

            <div className="dashboard-summary-section">
                <div className="summary-item total">
                    <BarChart2 size={24} color="#6f42c1" />
                    <span>Total Modules</span>
                    <p>{summary.total}</p>
                </div>
                <div className="summary-item completed">
                    <CheckCircle size={24} color={STATUS_COLORS.Completed} />
                    <span>Completed</span>
                    <p>{summary.completed}</p>
                </div>
                <div className="summary-item in-progress">
                    <TrendingUp size={24} color={STATUS_COLORS['In Progress']} />
                    <span>In Progress</span>
                    <p>{summary.inProgress}</p>
                </div>
                <div className="summary-item not-started">
                    <Clock size={24} color={STATUS_COLORS['Not Started']} />
                    <span>Not Started</span>
                    <p>{summary.notStarted}</p>
                </div>
            </div>

            <div className="controls-and-filters">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by module name or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <Filter size={16} />
                    {['All', 'In Progress', 'Completed', 'Not Started'].map(filter => (
                        <button 
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Highlights Section (optional placeholder) */}
            {/* ... */}
            
            <div className="modules-grid-view">
                {filteredModules.length > 0 ? filteredModules.map(module => {
                    const action = getModuleCardAction(module);
                    const thumbnailUrl = module.thumbnail ? pb.files.getURL(module, module.thumbnail) : null;

                    return (
                        <div key={module.id} className="module-card">
                            {thumbnailUrl && <img src={thumbnailUrl} alt={module.title} className="module-thumbnail" />}
                            <div className="module-card-content">
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: STATUS_COLORS[module.status] }}
                                >
                                    {module.status}
                                </span>
                                <h3 className="module-title">
                                    <Book size={18} /> {module.title}
                                </h3>
                                <p className="module-description">{module.description}</p>
                                
                                {module.status !== 'Not Started' && (
                                    <div className="progress-section">
                                        <div className="progress-bar-container">
                                            <div className="progress-bar" style={{ width: `${module.progress}%`, backgroundColor: STATUS_COLORS[module.status] }}></div>
                                        </div>
                                        <span className="progress-text">{Math.round(module.progress)}% Complete</span>
                                    </div>
                                )}
                                
                                <p className="module-meta">
                                    <span>Submodules: {module.completedCount}/{module.totalSubmodules}</span>
                                    {module.estimated_time && <span>~{module.estimated_time}</span>}
                                </p>

                                <Link to={`/dashboard/modules/${module.id}`} className={`btn-module-action ${action.className}`}>
                                    {action.icon} {action.text}
                                </Link>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="no-results-found">
                        <p>No modules found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modules;