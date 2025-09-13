import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import pb from '../lib/pocketbase'; // Assuming you have a pocketbase client instance exported from here

const JoinUsSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Learner',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('Sending your message...');

    try {
      // Make sure you have a collection named 'contact_messages' in PocketBase
      // with fields: name (text), email (email), role (text), message (text)
      await pb.collection('contact_messages').create(formData);

      toast.success('Message sent successfully! We will get back to you soon.', { id: loadingToast });
      setFormData({ name: '', email: '', role: 'Learner', message: '' });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error('Failed to send message. Please try again later.', { id: loadingToast });
    }
    setIsSubmitting(false);
  };

  return (
    <section id="joinus" className="py-20 bg-white dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4"
        >
          Get in Touch
        </motion.h2>
        <p className="text-center text-lg text-gray-700 dark:text-gray-200 mb-12 max-w-2xl mx-auto">
          Whether you want to learn, support, or collaborate — there’s a place for you here. Drop us a line!
        </p>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/60 dark:bg-white/10 backdrop-blur rounded-xl shadow-lg p-8 border border-white/40 dark:border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-900 dark:text-gray-200">I am interested as a...</label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-900 dark:text-white"
                >
                  <option>Learner</option>
                  <option>Supporter</option>
                  <option>Partner</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-gray-200">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-900 dark:text-white"
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold rounded-xl px-8 py-3 text-lg shadow-md hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;
