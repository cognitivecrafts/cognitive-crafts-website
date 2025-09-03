import React, { useState, useEffect } from 'react';
import pb from '../../lib/pocketbase';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Book, Video, FileText, Users, User, MessageSquare, Plus, Bell, User as UserIcon, Settings, LogOut, FileArchive } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    modules: 0,
    videos: 0,
    notes: 0,
    students: 0,
    teachers: 0,
    threads: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Corrected collection name to 'modules' for consistency
        const modulesPromise = pb.collection('modules').getList(1, 1);
        const videosPromise = pb.collection('videos').getList(1, 1);
        const notesPromise = pb.collection('notes').getList(1, 1);
        const studentsPromise = pb.collection('users').getList(1, 1, { filter: 'role = "student" || role = ""' });
        const teachersPromise = pb.collection('admins').getList(1, 1);
        const threadsPromise = pb.collection('forum_threads').getList(1, 1, { filter: 'status = "active"' });

        const [
          modulesRes,
          videosRes,
          notesRes,
          studentsRes,
          teachersRes,
          threadsRes
        ] = await Promise.all([
          modulesPromise,
          videosPromise,
          notesPromise,
          studentsPromise,
          teachersPromise,
          threadsPromise
        ]);

        setStats({
          modules: modulesRes.totalItems,
          videos: videosRes.totalItems,
          notes: notesRes.totalItems,
          students: studentsRes.totalItems,
          teachers: teachersRes.totalItems,
          threads: threadsRes.totalItems,
        });

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        if (typeof error === 'object' && error !== null) {
          console.error(JSON.stringify(error, null, 2));
        }
      }
    };

    fetchStats();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-dashboard">
        <header className="dashboard-header">
            <div className="welcome-message">
            <h2>Welcome back, Admin 👋</h2>
            </div>
            <div className="header-actions">
            <button className="quick-action-btn"><Plus size={16} /> Add Module</button>
            <button className="quick-action-btn"><Plus size={16} /> Upload Video</button>
            <button className="quick-action-btn"><Plus size={16} /> Add Note</button>
            <div className="profile-dropdown">
                <UserIcon size={24} />
                <div className="dropdown-content">
                <a href="#"><User size={16} /> My Profile</a>
                <a href="#"><Settings size={16} /> Settings</a>
                <a href="#"><LogOut size={16} /> Logout</a>
                </div>
            </div>
            </div>
        </header>

        <section className="overview-widgets">
            <div className="widget">
            <div className="widget-icon"><Book size={32} /></div>
            <div className="widget-content">
                <span className="widget-label">Total Modules</span>
                <span className="widget-value">{stats.modules}</span>
            </div>
            </div>
            <div className="widget">
            <div className="widget-icon"><Video size={32} /></div>
            <div className="widget-content">
                <span className="widget-label">Total Videos</span>
                <span className="widget-value">{stats.videos}</span>
            </div>
            </div>
            <div className="widget">
            <div className="widget-icon"><FileText size={32} /></div>
            <div className="widget-content">
                <span className="widget-label">Total Notes</span>
                <span className="widget-value">{stats.notes}</span>
            </div>
            </div>
            <div className="widget">
            <div className="widget-icon"><Users size={32} /></div>
            <div className="widget-content">
                <span className="widget-label">Students</span>
                <span className="widget-value">{stats.students}</span>
            </div>
            </div>
            <div className="widget">
            <div className="widget-icon"><User size={32} /></div>
            <div className="widget-content">
                <span className="widget-label">Teachers</span>
                <span className="widget-value">{stats.teachers}</span>
            </div>
            </div>
            <div className="widget">
            <div className="widget-icon"><MessageSquare size={32} /></div>
            <div className="widget-content">
                <span className="widget-label">Active Forum Threads</span>
                <span className="widget-value">{stats.threads}</span>
            </div>
            </div>
        </section>

        <section className="main-content">
            <div className="left-column">
            <div className="analytics-section card">
                <h3>Weekly Activity</h3>
                <div className="chart-placeholder">Chart goes here</div>
            </div>
            <div className="recent-activity-feed card">
                <h3>Recent Activity</h3>
                <ul>
                <li>New student registered</li>
                <li>Teacher uploaded new video</li>
                <li>Admin published announcement</li>
                <li>Support ticket opened</li>
                </ul>
            </div>
            </div>
            <div className="right-column">
            <div className="notifications-panel card">
                <h3>Notifications</h3>
                <ul>
                <li><Bell size={16} /> Video upload failed</li>
                <li><Bell size={16} /> Module 03 updated</li>
                </ul>
            </div>
            <div className="quick-links-panel card">
                <h3>Quick Links</h3>
                <div className="quick-links-buttons">
                    <button onClick={() => handleNavigate('/admin-dashboard/modules')}><Book size={16} /> Modules</button>
                    <button onClick={() => handleNavigate('/admin-dashboard/videos')}><Video size={16} /> Videos</button>
                    <button onClick={() => handleNavigate('/admin-dashboard/notes')}><FileText size={16} /> Notes</button>
                    <button onClick={() => handleNavigate('/admin-dashboard/assignments')}><FileArchive size={16}/> Assignments</button>
                    <button onClick={() => handleNavigate('/admin-dashboard/students')}><Users size={16} /> Student Management</button>
                    <button onClick={() => handleNavigate('/admin-dashboard/teachers')}><User size={16} /> Teacher Management</button>
                    <button onClick={() => handleNavigate('/admin-dashboard/support')}><MessageSquare size={16} /> Support Desk</button>
                </div>
            </div>
            </div>
        </section>
    </div>
  );
};

export default AdminDashboard;
