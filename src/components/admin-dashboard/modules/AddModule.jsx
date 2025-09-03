import React from 'react';
import ModuleForm from './ModuleForm';
import pb from '../../../lib/pocketbase'; // Adjust path as needed

const AddModule = () => {

    const handleCreateModule = async (formData) => {
        try {
            // The key for the collection is 'modules', not 'module'
            const record = await pb.collection('modules').create(formData);
            console.log("Module created successfully:", record);
            // Navigation will be handled by the form on success
        } catch (error) {
            console.error("Failed to create module:", error);
            // Re-throw the error to be caught by the form's error handler
            throw error;
        }
    };

    return (
        <ModuleForm 
            onSubmit={handleCreateModule} 
            isEditing={false} 
        />
    );
};

export default AddModule;
