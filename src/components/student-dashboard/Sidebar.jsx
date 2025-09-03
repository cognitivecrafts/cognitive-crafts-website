import React from 'react';
import './Sidebar.css';
import { Book, Video, FileText, Users, MessageSquare, ClipboardCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>Cognitive Crafts</h3>
      </div>
      <nav className="sidebar-nav">
        <button onClick={() => handleNavigate('/modules')}><Book size={20} /><span>Modules</span></button>
        <button onClick={() => handleNavigate('/videos')}><Video size={20} /><span>Video Library</span></button>
        <button onClick={() => handleNavigate('/notes')}><FileText size={20} /><span>Notes Library</span></button>
        <button onClick={() => handleNavigate('/assignments')}><ClipboardCheck size={20} /><span>Assignments</span></button>
        <button onClick={() => handleNavigate('/community')}><MessageSquare size={20} /><span>Community Forum</span></button>
        <button onClick={() => handleNavigate('/support')}><Users size={20} /><span>Support</span></button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn"><LogOut size={20} /><span>Logout</span></button>
      </div>
    </div>
  );
};

export default Sidebar;
