import React from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const TechnologySection = () => {
  return (
    <section id="courses" className="py-20 bg-white dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4"
        >
          Our Premier Program
        </motion.h2>
        <p className="text-center text-lg text-gray-700 dark:text-gray-200 mb-12 max-w-2xl mx-auto">
          One comprehensive program to launch your career in tech.
        </p>
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-xl shadow-lg p-8 bg-white/60 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/20 flex flex-col items-center text-center max-w-lg"
          >
            <Code size={36} className="text-pink-500 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Automation Testing + DevOps</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-4">
              Become job-ready in 4 months. This program covers everything from software testing fundamentals to advanced DevOps practices, ensuring you have the skills for a high-demand tech career.
            </p>
            <span className="inline-block mb-6 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 text-sm font-semibold">
              4 Months - Job Ready
            </span>
            <Link to="/signup">
              <button className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold rounded-xl px-8 py-3 text-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
                Join Now
              </button>
            </Link>
          </motion.div>
        </div>
        <p className="text-center text-base text-gray-600 dark:text-gray-300 mt-12 max-w-2xl mx-auto">
          Our program guarantees safe learning, inclusive mentorship, and real career outcomes.
        </p>
      </div>
    </section>
  );
};

export default TechnologySection;
