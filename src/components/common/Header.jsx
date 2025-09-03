// src/components/Header.jsx

import React, { useState } from 'react';
import { NAV_ITEMS } from './utils/constants';
import { useTheme } from './context/ThemeContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import iconImage from '../../assets/images/logo05.png';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#overview'); // State to track active section

  const handleNavClick = (e, path) => {
    e.preventDefault();
    const element = document.querySelector(path);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(path); // Set active section on click
    }
    setMenuOpen(false);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white dark:bg-black shadow-md transition-colors duration-500"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-4 text-2xl font-bold">
          <img src={iconImage} alt="Cognitive Crafts" className="w-20 h-20 object-contain" />
          <span className="bg-gradient-to-r from-[#ff0000] via-[#ff7f00] to-[#ffff00] bg-clip-text text-transparent">Cognitive Crafts</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={`text-lg font-medium hover:text-primary-500 transition-colors ${
                activeSection === item.path
                  ? 'text-blue-500 dark:text-blue-400' // Blue color when active
                  : 'text-gray-600 dark:text-gray-300' // Default color
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>

        {/* Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">
            Login
          </Link>

          <Link to="/signup" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">
            Sign Up
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 dark:text-gray-300"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {/* Rainbow Gradient Underline with Fade and Glow */}
      <div
        style={{
          height: '3px',
          width: '100%',
          background: `linear-gradient(90deg, transparent 0%, #ff0000 10%, #ff7f00 23%, #ffff00 36%, #00ff00 50%, #0000ff 64%, #4b0082 77%, #9400d3 90%, transparent 100%)`,
          boxShadow: '0 0 16px 4px rgba(255,0,90,0.18), 0 0 32px 8px rgba(0,153,255,0.10)'
        }}
      />

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-t dark:border-gray-800 px-4 py-4 space-y-3">
          {NAV_ITEMS.map(item => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={`block text-lg font-medium ${
                activeSection === item.path
                  ? 'text-blue-500 dark:text-blue-400' // Blue color when active
                  : 'text-gray-700 dark:text-gray-200' // Default color
              }`}
            >
              {item.title}
            </a>
          ))}
         
        </div>
      )}
    </motion.header>
  );
};

export default Header;
