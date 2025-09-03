import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './StudentAssignmentDetailPage.css'; 
import {
    ArrowLeft, BookOpen, ChevronsRight, FileText, Calendar, Target, Paperclip,
    CheckCircle, XCircle, Clock, Upload, Send, MessageSquare, Edit,
    UploadCloud
} from 'lucide-react';

const StudentAssignmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [viewMode, setViewMode] = useState('view');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    const userId = pb.authStore.model?.id; // Safely access user ID

    useEffect(() => {
        if (!pb.authStore.isValid || !userId) {
            navigate('/login');
        }
    }, [navigate, userId]);

    const fetchAllData = useCallback(async () => {
        if (!userId) return; // Don't fetch if no user
        setLoading(true);
        try {
            const assignmentRecord = await pb.collection('assignments').getOne(id, {
                expand: 'module_id,submodule_id'
            });
            setAssignment(assignmentRecord);

            try {
                const submissionRecord = await pb.collection('assignments_submisson').getFirstListItem(
                    `assignment_id = '${id}' && student_id = '${userId}'`,
                    { expand: 'student_id' }
                );
                setSubmission(submissionRecord);
            } catch (err) {
                if (err.status !== 404) {
                    throw err;
                }
                setSubmission(null);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError('Failed to load assignment data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [id, userId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (!userId) {
        return null; // Render nothing while redirecting
    }

    const getStudentStatus = () => {
    if (!assignment) return { text: '', component: null };

    if (submission) {
        if (submission.status === 'Graded') {
            return { text: 'Graded', component: <span className="status-badge status-graded"><CheckCircle size={14} /> Graded</span> };
        }
        return { text: 'Submitted', component: <span className="status-badge status-submitted-main"><CheckCircle size={14} /> Submitted</span> };
    }

    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    if (now > dueDate) {
        return { text: 'Closed', component: <span className="status-badge status-closed"><XCircle size={14} /> Closed</span> };
    }

    return { text: 'Open', component: <span className="status-badge status-open"><Clock size={14} /> Open</span> };
};

    const handleFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile && !submission) {
            alert('Please select a file to submit.');
            return;
        }
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('assignment_id', id);
            formData.append('student_id', userId);
            if (submissionFile) {
                formData.append('submission_file', submissionFile);
            }
            const isLate = new Date() > new Date(assignment.due_date);
            formData.append('status', isLate ? 'Late' : 'Submitted');
            formData.append('submitted_at', new Date().toISOString());

            if (submission) {
                await pb.collection('assignments_submisson').update(submission.id, formData);
                alert('Submission updated successfully!');
            } else {
                await pb.collection('assignments_submisson').create(formData);
                alert('Assignment submitted successfully!');
            }
            
            setViewMode('view');
            fetchAllData();
        } catch (err) {
            console.error("Failed to submit:", err);
            alert('An error occurred during submission. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!assignment) return <div className="loading-container">Assignment not found.</div>;

    const { expand, title, description, due_date, marks, attachments } = assignment;
    const attachmentUrl = attachments ? pb.files.getURL(assignment, attachments) : null;
    const studentStatus = getStudentStatus();
    const allowUpdate = submission && new Date() < new Date(due_date);

    return (
        <div className="student-assignment-detail-page">
            <header className="detail-header">
                <a href="#" onClick={() => navigate('/dashboard/assignments')} className="back-link">
                    <ArrowLeft size={20} />
                    Back to Assignments
                </a>
            </header>

            <section className="assignment-main-info">
                <h1 className="assignment-main-title">{title}</h1>
                {expand?.module_id && expand?.submodule_id && (
                    <p className="assignment-breadcrumb">
                        <BookOpen size={16} /> {expand.module_id.title} <ChevronsRight size={16} /> {expand.submodule_id.title}
                    </p>
                )}
                {studentStatus.component}
            </section>

            <div className="assignment-overview-block">
                 <div className="overview-item">
                    <span className="overview-label"><FileText size={16} /> Instructions</span>
                    <div dangerouslySetInnerHTML={{ __html: description || "No instructions provided." }} />
                </div>
                {attachmentUrl && (
                    <div className="overview-item">
                        <span className="overview-label"><Paperclip size={16} /> Resources</span>
                        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="resource-link">{attachments}</a>
                    </div>
                )}
                <div className="overview-grid">
                    <div className="overview-item">
                        <span className="overview-label"><Calendar size={16} /> Due Date</span>
                        <p className={new Date(due_date) < new Date() && !submission ? 'date-overdue' : ''}>{formatDate(due_date)}</p>
                    </div>
                    <div className="overview-item">
                        <span className="overview-label"><Target size={16} /> Max Marks</span>
                        <p>{marks || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <hr className="divider" />

            <section className="submission-section">
                <h2><Upload size={20} /> Your Submission</h2>

                {studentStatus.text === 'Open' || viewMode === 'edit' ? (
                    <form className="submission-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{submission ? 'Replace File' : 'Upload File'}</label>
                            <div className="upload-field" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                                <UploadCloud size={40} className="upload-icon" />
                                <p>Click to browse or drag & drop</p>
                                <span>Any standard file formats are accepted.</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    required={!submission}
                                />
                            </div>
                            {submissionFile && (
                                <div className="preview-section">
                                    <div className="thumbnail-preview"><FileText className="placeholder-icon" size={40} /></div>
                                    <div className='file-info'>
                                        <p>{submissionFile.name}</p>
                                        <span>{(submissionFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                </div>
                            )}
                            {submission && !submissionFile && (
                                <p className='file-info-edit'>Current file: {submission.submission_file}</p>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="submission-notes">Notes</label>
                            <textarea 
                                id="submission-notes" 
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                placeholder="Add any comments for your instructor..."></textarea>
                        </div>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            <Send size={16} /> {isSubmitting ? 'Submitting...' : (submission ? 'Update Submission' : 'Submit Assignment')}
                        </button>
                        {viewMode === 'edit' && <button type="button" onClick={() => setViewMode('view')} className="btn-cancel">Cancel</button>}
                    </form>
                ) : studentStatus.text === 'Submitted' || studentStatus.text === 'Graded'? (
                    <div className="submission-feedback-card">
                        <div className="submission-status-header">
                           <CheckCircle size={18} /> Submitted on {formatDate(submission.submitted_at)}
                        </div>
                        <div className="submission-details">
                           <p><strong>File:</strong> <a href={pb.files.getURL(submission, submission.submission_file)} target="_blank" rel="noopener noreferrer">{submission.submission_file}</a></p>
                           {submission.notes && <p><strong>Notes:</strong> {submission.notes}</p>}
                        </div>
                        {submission.score !== null ? (
                            <div className="feedback-section">
                                <h4><MessageSquare size={18}/> Feedback & Marks</h4>
                                <p className="marks-display">Scored: <span>{submission.score} / {marks}</span></p>
                                {submission.feedback && <p className="feedback-text">{submission.feedback}</p>}
                            </div>
                        ) : (
                             <div className="feedback-section pending-grading">
                                 <p>Your submission is awaiting feedback.</p>
                             </div>
                        )}
                         {allowUpdate && (
                             <button onClick={() => setViewMode('edit')} className="btn-update-submission">
                                 <Edit size={14} /> Update Submission
                             </button>
                         )}
                    </div>
                ) : (
                     <div className="submission-feedback-card closed">
                        <div className="submission-status-header">
                           <XCircle size={18} /> The submission deadline has passed.
                        </div>
                         <p>Submissions are no longer accepted for this assignment.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default StudentAssignmentDetailPage;
