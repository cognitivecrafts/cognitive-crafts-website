import React, { useState } from 'react';
import './signup.css';
import { BookOpen, Download, BarChart2 } from 'lucide-react';
import logo from '../../assets/images/logo05.png';
import pb from '../../lib/pocketbase' // make sure pocketbase.js is in src/

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp_no: '', // Added optional WhatsApp field
        password: '',
        confirmPassword: '',
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
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);

            // FIX: Added `name` field to be stored in the database.
            // ADD: Added `whatsapp_no` field.
            const data = {
                username: formData.name, // Using name as username as per original logic
                name: formData.name,       // Storing name in the 'name' field
                email: formData.email,
                emailVisibility: true,
                password: formData.password,
                passwordConfirm: formData.confirmPassword,
                whatsapp_no: formData.whatsapp_no, // Storing optional whatsapp number
            };

            const record = await pb.collection('users').create(data);

            setSuccess("Account created successfully! Please log in.");
            // Clear all form fields on success
            setFormData({ name: '', email: '', whatsapp_no: '', password: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            const errorMessage = err.message || "Something went wrong. A user with this name may already exist.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="left-side">
                <div className="branding-content">
                    <img src={logo} alt="Cognitive Crafts Logo" className="signup-logo-image" />
                    <div className="font-Poppins text-4xl font-bold text-white mb-4">
                        Unlock Your Cognitive Journey
                    </div>
                    <p className="font-mono">
                        Create your account and start learning smarter with Cognitive Crafts LMS.
                    </p>
                    <ul className="highlights">
                        <li><BookOpen size={20} /> Access curated video lessons</li>
                        <li><Download size={20} /> Download notes & resources</li>
                        <li><BarChart2 size={20} /> Track progress across modules</li>
                    </ul>
                </div>
            </div>
            <div className="right-side">
                <div className="signup-card">
                    <p className="font-bold text-xl">Create Account</p>
                    <p>Join Cognitive Crafts and craft your learning path.</p>
                    
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {/* ADD: New optional input for WhatsApp Number */}
                        <input
                            type="tel"
                            name="whatsapp_no"
                            placeholder="WhatsApp Number (Optional)"
                            value={formData.whatsapp_no}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit" className="signup-button" disabled={loading}>
                            {loading ? "Signing Up..." : "Sign Up & Start Learning"}
                        </button>
                        {/* <div className="divider">──────── or sign up with ────────</div> */}
                        <button type="button" className="google-signup-button">
                            Continue with Google
                        </button>
                    </form>
                    
                    <div className="login-link">
                        Already have an account? <a href="/login">Log in here</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
