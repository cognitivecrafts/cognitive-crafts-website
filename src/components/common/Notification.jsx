import React, { useEffect, useState } from 'react';
import './Notification.css';
import { CheckCircle, XCircle } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) {
                onClose();
            }
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    const isSuccess = type === 'success';

    return (
        <div className={`notification-card ${isSuccess ? 'notification-success' : 'notification-error'}`}>
            <div className="notification-icon">
                {isSuccess ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>
            <span>{message}</span>
        </div>
    );
};

export default Notification;
