import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AssignmentForm.css';
import pb from '../../../lib/pocketbase'; 
import { UploadCloud, FileText } from 'lucide-react';

const AssignmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        module_id: '',
        submodule_id: '',
        assignment_type: 'coding',
        due_date: '',
        marks: '',
        status: 'draft',
    });
    const [attachments, setAttachments] = useState(null);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [modules, setModules] = useState([]);
    const [submodules, setSubmodules] = useState([]);

    // Fetch modules on component mount
    useEffect(() => {
        const fetchModules = async () => {
            try {
                const records = await pb.collection('modules').getFullList({ sort: 'order' });
                setModules(records);
            } catch (error) {
                console.error('Failed to fetch modules:', error);
            }
        };
        fetchModules();
    }, []);

    // Fetch assignment details if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchAssignment = async () => {
                try {
                    const record = await pb.collection('assignments').getOne(id, {
                        expand: 'attachments'
                    });
                    setFormData({
                        title: record.title,
                        description: record.description,
                        module_id: record.module_id,
                        submodule_id: record.submodule_id,
                        assignment_type: record.assignment_type,
                        due_date: record.due_date ? new Date(record.due_date).toISOString().slice(0, 16) : '',
                        marks: record.marks,
                        status: record.status,
                    });
                    if (record.attachments) {
                        setExistingAttachments(record.attachments.map(fileName => ({ name: fileName, url: pb.files.getUrl(record, fileName) })));
                    }
                } catch (error) {
                    console.error('Failed to fetch assignment:', error);
                }
            };
            fetchAssignment();
        }
    }, [id, isEditMode]);

    // Fetch submodules when module changes
    useEffect(() => {
        const fetchSubmodules = async () => {
            if (formData.module_id) {
                try {
                    const records = await pb.collection('submodules').getFullList({
                        filter: `module='${formData.module_id}'`,
                        sort: 'order',
                    });
                    setSubmodules(records);
                } catch (error) {
                    console.error('Failed to fetch submodules:', error);
                }
            } else {
                setSubmodules([]);
            }
        };
        fetchSubmodules();
    }, [formData.module_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilechange = (e) => {
        setAttachments(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        if (attachments) {
            for (let i = 0; i < attachments.length; i++) {
                data.append('attachments', attachments[i]);
            }
        }

        try {
            if (isEditMode) {
                await pb.collection('assignments').update(id, data);
                alert('Assignment updated successfully!');
            } else {
                await pb.collection('assignments').create(data);
                alert('Assignment created successfully!');
            }
            navigate('/admin-dashboard/assignments');
        } catch (error) {
            console.error('Failed to save assignment:', error);
            alert('Failed to save assignment.');
        }
    };

    return (
        <div className="assignment-form">
            <header className="form-header">
                <div>
                    <h1>{isEditMode ? 'Edit Assignment' : 'Add Assignment'}</h1>
                    <p>Create or update assignments for modules and submodules.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Assignment Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Intro to Java – Setup Assignment"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description / Instructions</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Write a Java program that prints Hello World. Submit code as .java file."
                        rows="6"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="module_id">Module</label>
                    <select id="module_id" name="module_id" value={formData.module_id} onChange={handleChange} required>
                        <option value="">Select a Module</option>
                        {modules.map(module => (
                            <option key={module.id} value={module.id}>{module.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="submodule_id">Submodule</label>
                    <select id="submodule_id" name="submodule_id" value={formData.submodule_id} onChange={handleChange} required disabled={!formData.module_id}>
                        <option value="">Select a Submodule</option>
                        {submodules.map(submodule => (
                            <option key={submodule.id} value={submodule.id}>{submodule.title}</option> // Also changed to title here for consistency
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="assignment_type">Assignment Type</label>
                    <select id="assignment_type" name="assignment_type" value={formData.assignment_type} onChange={handleChange}>
                        <option value="quiz">Quiz</option>
                        <option value="coding">Coding Challenge</option>
                        <option value="written">Written</option>
                        <option value="project">Project</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Attachments (Optional)</label>
                    <div className="upload-field" onClick={() => fileInputRef.current.click()}>
                        <UploadCloud size={40} className="upload-icon" />
                        <p>Click to browse or drag & drop</p>
                        <span>You can upload multiple files</span>
                        <input type="file" name="attachments" ref={fileInputRef} onChange={handleFilechange} style={{ display: 'none' }} multiple />
                    </div>
                </div>

                {(attachments || existingAttachments.length > 0) && (
                    <div className="preview-section">
                        <h4>Selected Files:</h4>
                        {attachments && Array.from(attachments).map((file, index) => (
                             <div key={index} className="file-preview-item">
                                <FileText className="placeholder-icon" size={30} />
                                <div className='file-info'>
                                    <p>{file.name}</p>
                                    <span>{(file.size / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                        ))}
                         {isEditMode && !attachments && existingAttachments.map((file, index) => (
                             <div key={index} className="file-preview-item">
                                <FileText className="placeholder-icon" size={30} />
                                <div className='file-info'>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                </div>
                            </div>
                        ))}
                        {isEditMode && <p className='file-info-edit'>Leave empty or upload new files to overwrite existing ones.</p>}
                    </div>
                )}
                 <div className="form-group">
                    <label htmlFor="due_date">Due Date & Time</label>
                    <input type="datetime-local" id="due_date" name="due_date" value={formData.due_date} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="marks">Marks / Weightage</label>
                    <input type="number" id="marks" name="marks" value={formData.marks} onChange={handleChange} placeholder="e.g., 100" />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        {isEditMode ? 'Update Assignment' : 'Save Assignment'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin-dashboard/assignments')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignmentForm;
