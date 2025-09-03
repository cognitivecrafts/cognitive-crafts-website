import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './StudentAssignmentsPage.css';
import { Target, Search, BookOpen, Calendar, Hash, CheckCircle, Clock, XCircle, ChevronRight, AlertCircle, FileText, BarChart } from 'lucide-react';

const StudentAssignmentsPage = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const userId = pb.authStore.model.id;

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                // 1. Fetch all assignments, expanding module and submodule info
                const allAssignments = await pb.collection('assignments').getFullList({
                    sort: '-created',
                    expand: 'module_id,submodule_id'
                });

                // 2. Fetch all submissions for the current student
                const studentSubmissions = await pb.collection('assignments_submisson').getFullList({
                    filter: `student_id = '${userId}'`
                });
                
                // 3. Create a map for quick lookup of submissions by assignment ID
                const submissionsMap = new Map(studentSubmissions.map(sub => [sub.assignment_id, sub]));

                // 4. Determine the status of each assignment
                const assignmentsWithStatus = allAssignments.map(assignment => {
                    const submission = submissionsMap.get(assignment.id);
                    let status = '';
                    let score = null;

                    if (submission) {
                        if (submission.status === 'Submitted' || submission.status === 'Late') {
                            status = 'Completed';
                            score = submission.score;
                        } else {
                            status = 'In Progress';
                        }
                    } else {
                        if (new Date(assignment.due_date) < new Date()) {
                            status = 'Overdue';
                        } else {
                            status = 'Pending';
                        }
                    }
                    return { ...assignment, status, score };
                });

                setAssignments(assignmentsWithStatus);
            } catch (err) {
                console.error("Failed to fetch assignments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [userId]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredAssignments = assignments
        .filter(assignment => {
            if (activeFilter === 'All') return true;
            return assignment.status === activeFilter;
        })
        .filter(assignment =>
            assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    // --- Render Helper Components ---
    
    const renderStatusBadge = (status, score, totalMarks) => {
        switch (status) {
            case 'Completed':
                return <span className="status-badge status-completed"><CheckCircle size={14} color="#22c55e"/> Completed {score && `(${score}/${totalMarks})`}</span>;
            case 'In Progress':
                return <span className="status-badge status-in-progress"><Clock size={14} color="#3b82f6"/> In Progress</span>;
            case 'Overdue':
                return <span className="status-badge status-overdue"><XCircle size={14} color="#ef4444"/> Overdue</span>;
            case 'Pending':
            default:
                return <span className="status-badge status-pending"><AlertCircle size={14} color="#f97316"/> Pending</span>;
        }
    };

    const AssignmentCard = ({ assignment }) => {
        const isOverdue = assignment.status === 'Overdue';
        const module = assignment.expand?.module_id;
        const submodule = assignment.expand?.submodule_id;

        return (
            <div className="assignment-card">
                <div className="card-header">
                   <h3><FileText size={18} color="#4a5568"/> {assignment.title}</h3>
                </div>
                <div className="card-body">
                    <p className="card-breadcrumb">
                        <BookOpen size={16} color="#4a5568"/> 
                        {module?.title || 'Module'} <ChevronRight size={16} color="#4a5568"/> {submodule?.title || 'Submodule'}
                    </p>
                    <div className="card-details">
                        <span className={isOverdue ? 'detail-item due-date-overdue' : 'detail-item'}>
                            <Calendar size={16} color="#4a5568"/> 
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                        <span className="detail-item">
                            <Hash size={16} color="#4a5568"/>
                            Marks: {assignment.marks}
                        </span>
                    </div>
                </div>
                <div className="card-footer">
                    {renderStatusBadge(assignment.status, assignment.score, assignment.marks)}
                    <button onClick={() => navigate(`/dashboard/assignments/${assignment.id}`)} className="btn-view-details">
                        View Details
                    </button>
                </div>
            </div>
        );
    };

    const ProgressSummary = () => {
        const total = assignments.length;
        const completed = assignments.filter(a => a.status === 'Completed').length;
        const pending = assignments.filter(a => a.status === 'Pending').length;
        const overdue = assignments.filter(a => a.status === 'Overdue').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
            <div className="progress-summary-card">
                <h4><BarChart size={20} color="#4a5568" /> Your Progress</h4>
                <div className="progress-stats">
                    <span>Total: {total}</span>
                    <span>Completed: {completed} <CheckCircle size={16} color="#22c55e"/></span>
                    <span>Pending: {pending} <Clock size={16} color="#3b82f6"/></span>
                    <span>Overdue: {overdue} <XCircle size={16} color="#ef4444"/></span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-label">{progress}% Completed</span>
            </div>
        );
    };

    const FilterTabs = () => (
        <div className="filter-tabs">
            {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(filter => (
                 <button 
                    key={filter} 
                    className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                 >
                     {filter}
                 </button>
            ))}
        </div>
    );

    return (
        <div className="student-assignments-page">
            <header className="page-header">
                <h1><Target size={28} color="#e0e0e0" /> Assignments</h1>
                <div className="search-bar">
                    <Search size={20} className="search-icon" color="#4a5568"/>
                    <input 
                        type="text" 
                        placeholder="Search by assignment title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </header>

            <ProgressSummary />
            
            <FilterTabs />

            <main className="assignments-list">
                {loading ? (
                    <p>Loading assignments...</p>
                ) : (
                    filteredAssignments.length > 0 ? (
                        filteredAssignments.map(assignment => (
                            <AssignmentCard key={assignment.id} assignment={assignment} />
                        ))
                    ) : (
                        <p className="no-assignments-message">No assignments found for the current filter.</p>
                    )
                )}
            </main>
        </div>
    );
};

export default StudentAssignmentsPage;
