import React, { useState, useEffect } from 'react';
import './Modules.css';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import pb from '../../../lib/pocketbase'; // Adjust the path to your pocketbase instance
import { Link } from 'react-router-dom';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('modules').getFullList({
        sort: 'order',
        expand: 'submodules(module)',
      });
      const modulesWithCount = records.map(module => ({
        ...module,
        submoduleCount: module.expand?.['submodules(module)']?.length || 0,
      }));
      setModules(modulesWithCount);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchSubmodules = async (moduleId) => {
    try {
      const records = await pb.collection('submodules').getFullList({
        filter: `module = '${moduleId}'`,
        sort: 'order',
      });
      return records;
    } catch (error) {
      console.error("Failed to fetch submodules:", error);
      return [];
    }
  };

  const handleViewModule = async (module) => {
    const submodules = await fetchSubmodules(module.id);
    setSelectedModule({ ...module, submodules });
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its submodules?')) {
        return;
    }

    try {
        const relatedSubmodules = await pb.collection('submodules').getFullList({
            filter: `module = '${moduleId}'`,
            fields: 'id',
        });

        const deletePromises = relatedSubmodules.map(sub => 
            pb.collection('submodules').delete(sub.id)
        );

        await Promise.all(deletePromises);
        await pb.collection('modules').delete(moduleId);
        fetchModules();
    } catch (err) {
        console.error("Failed to delete module:", err);
        alert(`Error: Could not delete module. ${err.message}`)
    }
  };

  const handleCloseDetailView = () => {
    setSelectedModule(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderMainView = () => (
    <div className="modules-container">
      <div className="modules-header">
        <h1 className="font-bold font-Poppins">Modules Management</h1>
        <Link to="/admin-dashboard/modules/add" className="add-module-btn">
          <Plus size={20} /> Add Module
        </Link>
      </div>

      <table className="modules-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Module Title</th>
            <th>Description</th>
            <th>Submodules</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <tr key={module.id}>
              <td>{module.order}</td>
              <td>{module.title}</td>
              <td>{module.description}</td>
              <td>{module.submoduleCount}</td>
              <td>{new Date(module.created).toLocaleDateString()}</td>
              <td className="actions">
                <button onClick={() => handleViewModule(module)}><Eye size={18} /></button>
                <Link to={`/admin-dashboard/modules/edit/${module.id}`} className="action-btn-link">
                  <Edit size={18} />
                </Link>
                <button onClick={() => handleDeleteModule(module.id)}><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDetailView = () => (
    <div className="module-detail-view">
        <button className="close-btn" onClick={handleCloseDetailView}>&times;</button>
        <div className="module-detail-header">
            <h2 className="font-bold">Module {selectedModule.order}: {selectedModule.title}</h2>
            <p>{selectedModule.description}</p>
        </div>
        
        <div className="submodules-section">
            <div className="submodules-header">
                <h2 className="font-bold">Submodules</h2>
                <Link to={`/admin-dashboard/modules/${selectedModule.id}/submodules/add`} className="add-submodule-btn">
                    <Plus size={20} /> Add Submodule
                </Link>
            </div>
            <table className="submodules-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Submodule Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedModule.submodules && selectedModule.submodules.map(sub => (
                        <tr key={sub.id}>
                            <td>{sub.order}</td>
                            <td>{sub.title}</td>
                            <td>{sub.description}</td>
                            <td className="actions">
                                <Link to={`/admin-dashboard/modules/${selectedModule.id}/submodules/${sub.id}`} className="action-btn-link">
                                  <Eye size={18} />
                                </Link>
                                <button><Edit size={18} /></button>
                                <button><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return selectedModule ? renderDetailView() : renderMainView();
};

export default Modules;
