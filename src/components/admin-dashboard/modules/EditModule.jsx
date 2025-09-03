import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModuleForm from './ModuleForm';
import pb from '../../../lib/pocketbase'; // Adjust path as needed

const EditModule = () => {
    const { id } = useParams();
    const [moduleData, setModuleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchModule = async () => {
            try {
                setLoading(true);
                const record = await pb.collection('modules').getOne(id);
                
                // Construct the full URL for the thumbnail
                const thumbnailUrl = record.thumbnail 
                    ? `${pb.baseUrl}/api/files/modules/${id}/${record.thumbnail}` 
                    : null;

                setModuleData({ ...record, thumbnail: thumbnailUrl });
            } catch (err) {
                setError('Failed to fetch module details. Please ensure the ID is correct.');
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchModule();
    }, [id]);

    const handleUpdateModule = async (formData) => {
        try {
            const record = await pb.collection('modules').update(id, formData);
            console.log("Module updated successfully:", record);
            // Navigation will be handled by the form on success
        } catch (error) {
            console.error("Failed to update module:", error);
            // Re-throw to be caught by the form's error handler
            throw error;
        }
    };

    if (loading) {
        return <div className="module-form-container"><p>Loading module...</p></div>;
    }

    if (error) {
        return <div className="module-form-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <ModuleForm 
            onSubmit={handleUpdateModule} 
            initialData={moduleData}
            isEditing={true} 
        />
    );
};

export default EditModule;
