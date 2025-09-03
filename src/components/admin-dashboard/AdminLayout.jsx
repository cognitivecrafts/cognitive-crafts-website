import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pocketbase';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const isAdmin = pb.authStore.isValid && pb.authStore.model?.collectionName === 'admin';

    useEffect(() => {
        if (!isAdmin) {
            navigate('/login');
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) {
        // Render nothing while redirecting
        return null;
    }

    return children;
};

export default AdminLayout;
