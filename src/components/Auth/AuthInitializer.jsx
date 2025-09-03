import React, { useEffect, useState, useContext, createContext } from 'react';
import pb from '../../lib/pocketbase';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthInitializer = ({ children }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreAuth = () => {
            try {
                // The onChange listener with the `true` flag executes the callback
                // immediately with the restored auth state.
                const unsubscribe = pb.authStore.onChange(() => {
                    setLoading(false); // Auth state is confirmed, stop loading.
                }, true);

                // Immediately unsubscribe because we only needed the initial state check,
                // not to listen for future changes.
                unsubscribe();
            } catch (error) {
                // If something goes wrong, stop loading anyway to not block the app.
                console.error("Auth restore error:", error);
                setLoading(false);
            }
        };

        restoreAuth();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
                <p>Initializing Application...</p>
            </div>
        );
    }

    return children;
};

export default AuthInitializer;
