import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './AssignmentDetail.css';
import {
    ArrowLeft, Edit, Trash2, Upload, FileText, Calendar, Target, 
    BookOpen, ChevronsRight, Search, Circle, CheckCircle, Clock, Users, Folder,
    Paperclip, XCircle, X
} from 'lucide-react';

const GradingModal = ({ submission, assignment, onClose, onGradeUpdate }) => {
    const [score, setScore] = useState(submission?.score || '');
    const [feedback, setFeedback] = useState(submission?.feedback || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = {
                score: score,
                feedback: feedback,
                status: 'Graded'
            };
            await pb.collection('assignments_submisson').update(submission.id, data);
            onGradeUpdate(); // Refresh the data in the parent component
            onClose();
        } catch (error) {
            console.error("Failed to submit grade:", error);
            alert("Failed to submit grade. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!submission) return null;

    const submissionFileUrl = pb.files.getURL(submission, submission.submission_file);

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Grade Submission</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
                </div>
                <div className="modal-body">
                    <p><strong>Student:</strong> {submission.expand?.student_id?.name}</p>
                    <p><strong>Submitted At:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                    <a href={submissionFileUrl} target="_blank" rel="noopener noreferrer" className="submission-link">
                        View Submission File
                    </a>
                    <form onSubmit={handleGradeSubmit}>
                        <div className="form-group">
                            <label htmlFor="score">Score</label>
                            <input 
                                type="number" 
                                id="score"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder={`__ / ${assignment.marks}`}
                                max={assignment.marks}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="feedback">Feedback</label>
                            <textarea 
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide constructive feedback..."></textarea>
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Grade'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const AssignmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState(null);

    const fetchAssignmentData = async () => {
        try {
            setLoading(true);
            const assignmentRecord = await pb.collection('assignments').getOne(id, {
                expand: 'module_id,submodule_id'
            });

            const submissionRecords = await pb.collection('assignments_submisson').getFullList({
                filter: `assignment_id = '${id}'`,
                expand: 'student_id'
            });

            setAssignment(assignmentRecord);
            setSubmissions(submissionRecords);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch assignment data:", err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignmentData();
    }, [id]);

    const openModal = (submission) => {
        setCurrentSubmission(submission);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentSubmission(null);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="status-badge status-active"><Circle size={12} /> Active</span>;
            case 'draft':
                return <span className="status-badge status-draft"><Circle size={12} /> Draft</span>;
            case 'closed':
                return <span className="status-badge status-closed"><Circle size={12} /> Closed</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };
    
    const getSubmissionStatusIcon = (status) => {
        switch (status) {
            case 'Submitted':
                return <CheckCircle size={16} className="status-submitted" />;
            case 'Late':
                return <Clock size={16} className="status-late" />;
            case 'Graded':
                return <CheckCircle size={16} className="status-submitted" />;
            default:
                return <XCircle size={16} className="status-not-submitted" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    if (loading && !assignment) {
        return <div>Loading assignment details...</div>;
    }

    if (error) {
        return <div className='p-4 text-red-600 bg-red-100 rounded-md'>{error}</div>;
    }

    if (!assignment) {
        return <div>Assignment not found.</div>;
    }

    const { expand, title, description, assignment_type, due_date, marks, created, attachments } = assignment;
    const module = expand?.module_id;
    const submodule = expand?.submodule_id;
    
    const attachmentFiles = attachments ? [{ name: attachments, url: pb.files.getURL(assignment, attachments) }] : [];

    return (
        <div className="assignment-detail-page">
             {isModalOpen && (
                <GradingModal 
                    submission={currentSubmission} 
                    assignment={assignment}
                    onClose={closeModal} 
                    onGradeUpdate={() => {
                        fetchAssignmentData(); // Re-fetch all data to update the UI
                    }}
                />
            )}
            <header className="detail-header">
                <a href="#" onClick={() => navigate('/admin-dashboard/assignments')} className="back-link">
                    <ArrowLeft size={20} />
                    Back to Assignments
                </a>
            </header>

            <section className="assignment-main-info">
                <h1 className="assignment-main-title">{title}</h1>
                {module && submodule && (
                    <p className="assignment-breadcrumb">
                        <BookOpen size={16} /> {module.title} <ChevronsRight size={16} /> {submodule.title}
                    </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {getStatusBadge(assignment.status)}
                    <div className="header-actions">
                        <button onClick={() => navigate(`/admin-dashboard/assignments/edit/${id}`)}><Edit size={16} /> Edit</button>
                        <button onClick={() => alert('Delete clicked')}><Trash2 size={16} /> Delete</button>
                        <button onClick={() => alert('Export clicked')}><Upload size={16} /> Export Submissions</button>
                    </div>
                </div>
            </section>

            <hr className="divider" />

            <section className="assignment-info-grid">
                <div className="info-block" style={{ gridColumn: '1 / -1' }}>
                    <span className="info-block-label"><FileText size={16}/> Description / Instructions</span>
                    <div className="info-block-description" dangerouslySetInnerHTML={{ __html: description || 'No description provided.' }} />
                </div>
                <div className="info-block">
                    <span className="info-block-label"><Folder size={16}/> Assignment Type</span>
                    <span className="info-block-value">{assignment_type}</span>
                </div>
                <div className="info-block">
                    <span className="info-block-label"><Target size={16}/> Total Marks</span>
                    <span className="info-block-value">{marks || 'N/A'}</span>
                </div>
                <div className="info-block">
                    <span className="info-block-label"><Calendar size={16}/> Due Date</span>
                    <span className="info-block-value">{formatDate(due_date)}</span>
                </div>
                <div className="info-block">
                    <span className="info-block-label"><Clock size={16}/> Created On</span>
                    <span className="info-block-value">{formatDate(created)}</span>
                </div>
                {attachmentFiles.length > 0 && (
                     <div className="info-block" style={{ gridColumn: '1 / -1' }}>
                        <span className="info-block-label"><Paperclip size={16}/> Attachments</span>
                        <div className="info-block-value">
                            {attachmentFiles.map(file => (
                                <a key={file.name} href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <hr className="divider" />

            <section className="submissions-section">
                <div className="submissions-header">
                    <h3><Users size={20}/> Student Submissions</h3>
                    <div className="submissions-controls">
                        <div className="search-box">
                            <Search size={18} className="lucide-search" />
                            <input type="text" placeholder="Search by student..." />
                        </div>
                        <select>
                            <option value="all">All Students</option>
                            <option value="submitted">Submitted</option>
                            <option value="pending">Pending</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                </div>
                
                <table className="submissions-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Submission</th>
                            <th>Submitted On</th>
                            <th>Status</th>
                            <th>Marks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length > 0 ? submissions.map(sub => (
                            <tr key={sub.id}>
                                <td>{sub.expand?.student_id?.name || 'N/A'}</td>
                                <td>{sub.expand?.student_id?.email || 'N/A'}</td>
                                <td>{sub.submission_file ? sub.submission_file : '-'}</td>
                                <td>{formatDate(sub.submitted_at)}</td>
                                <td className="submission-status">
                                    {getSubmissionStatusIcon(sub.status)}
                                    {sub.status}
                                </td>
                                <td>{sub.score !== null ? `${sub.score} / ${assignment.marks}` : 'Not Graded'}</td>
                                <td>
                                    <button onClick={() => openModal(sub)} className="action-btn">
                                        Grade / View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No submissions yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AssignmentDetailPage;
