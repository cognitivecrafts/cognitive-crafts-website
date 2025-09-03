import React, { useState } from 'react';
import './login.css';
import logo from '../../assets/images/logo05.png';
import pb from '../../lib/pocketbase'; // import pocketbase instance

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
    
        try {
            setLoading(true);
    
            let authData;
    
            // Try logging in with "admins" first
            try {
                authData = await pb.collection('admin').authWithPassword(
                    formData.email,
                    formData.password
                );
                console.log("Admin Auth Data:", authData);
                setSuccess("Admin login successful! Redirecting...");
                setFormData({ email: '', password: '' });
    
                setTimeout(() => {
                    window.location.href = "/admin-dashboard";
                }, 1500);
    
                return; // stop here since we found an admin
            } catch (err) {
                // Not an admin → fallback to "users"
                console.log("Not admin, trying users...");
            }
    
            // Try logging in with "users" collection
            authData = await pb.collection('users').authWithPassword(
                formData.email,
                formData.password
            );
    
            console.log("User Auth Data:", authData);
            setSuccess("Login successful! Redirecting...");
            setFormData({ email: '', password: '' });
    
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
    
        } catch (err) {
            console.error(err);
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    


    return (
        <div className="login-container bg-white dark:bg-transparent h-screen flex items-center justify-center">
            <div className="login-left-side bg-white dark:bg-transparent">
                <div className="login-branding-content bg-white dark:bg-transparent">
                    <img src={logo} alt="Cognitive Crafts Logo" className="login-logo-image" />
                    <p className='font-bold text-5xl text-center text-white poppins mb-4'>
                        Craft Your Knowledge, Shape Your Future
                    </p>
                    <p className='font-mono'>
                        Cognitive Crafts is your gateway to interactive learning, skill growth, and creativity. 
                        Join us and unlock your true potential.
                    </p>
                </div>
            </div>
            <div className="login-right-side">
                <div className="login-card">
                    <p className='font-bold text-xl'>Welcome Back</p>
                    <p>Log in to continue your journey with Cognitive Crafts.</p>
                    
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <a href="#" className="forgot-password">Forgot Password?</a>
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                        <div className="login-divider">or</div>
                        <button type="button" className="google-login-button">
                            Continue with Google
                        </button>
                    </form>

                    <div className="signup-link">
                        Don’t have an account? <a href="/signup">Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
