
import React, { useState, useEffect } from 'react';
import pb from '../../../lib/pocketbase';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Clock, CheckCircle, XCircle, Trash2, Edit, Eye, Search } from 'lucide-react';
import './Assignments.css';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        module: '',
        submodule: '',
        status: ''
    });

    const fetchAssignments = async () => {
        try {
            const records = await pb.collection('assignments').getFullList({
                sort: '-created',
                expand: 'module_id,submodule_id'
            });
            setAssignments(records);
            setFilteredAssignments(records);
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    useEffect(() => {
        let result = assignments;
        if (searchTerm) {
            result = result.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filters.status) {
            result = result.filter(a => a.status === filters.status);
        }
        // Add module and submodule filtering if needed

        setFilteredAssignments(result);
    }, [searchTerm, filters, assignments]);


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this assignment?")) {
            try {
                await pb.collection('assignments').delete(id);
                fetchAssignments();
            } catch (error) {
                console.error("Failed to delete assignment:", error);
            }
        }
    };

    return (
        <div className="assignments-container container mx-auto p-4">
            <div className="assignments-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">📑 Assignments</h1>
                    <p className="text-gray-400">Create and manage assignments for modules & submodules.</p>
                </div>
                <Link to="/admin-dashboard/assignments/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
                    <Plus size={20} className="mr-2"/> Add Assignment
                </Link>
            </div>

            <div className="flex justify-between mb-4">
                <div className="flex items-center">
                    <Search className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search assignments..."
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center">
                    {/* Add filters here */}
                </div>
            </div>

            <div className="assignments-table-container">
                <table className="assignments-table">
                    <thead>
                        <tr>
                            <th>Assignment Title</th>
                            <th>Module</th>
                            <th>Submodule</th>
                            <th>Type</th>
                            <th>Due Date</th>
                            <th>Submissions</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.map(assignment => (
                            <tr key={assignment.id}>
                                <td>{assignment.title}</td>
                                <td>{assignment.expand?.module_id?.name || 'N/A'}</td>
                                <td>{assignment.expand?.submodule_id?.name || 'N/A'}</td>
                                <td>{assignment.assignment_type}</td>
                                <td>{new Date(assignment.due_date).toLocaleDateString()}</td>
                                <td>{/* Submissions count */}</td>
                                <td>
                                    <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                                        {assignment.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Link to={`/admin-dashboard/assignments/edit/${assignment.id}`} title="Edit"><Edit size={20}/></Link>
                                        <button onClick={() => handleDelete(assignment.id)} className="delete-btn" title="Delete"><Trash2 size={20}/></button>
                                        <Link to={`/admin-dashboard/assignments/${assignment.id}`} title="View"><Eye size={20}/></Link>
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

export default Assignments;
