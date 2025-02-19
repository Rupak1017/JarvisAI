import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const SideNav = ({ projects, isOpen, toggleSidebar, setProjects }) => {
  const navigate = useNavigate();
  const [activeDelete, setActiveDelete] = useState(null); // Track which project is in delete mode

  // Delete Project Function
  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`/projects/delete/${projectId}`);
      setProjects((prev) => prev.filter((project) => project._id !== projectId));
      setActiveDelete(null); // Reset icon after deletion
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <motion.aside
      className="bg-white shadow-md p-4 fixed top-0 left-0 h-screen z-50 w-72 flex flex-col justify-between"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <i className="ri-rocket-line text-2xl mr-2"></i>
            <span className="text-xl font-semibold">Jarvis AI</span>
          </div>
          <button onClick={toggleSidebar}>
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        <hr className="mb-4" />
      </div>

      {/* Scrollable Project List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-2 custom-scrollbar">
        {projects.map((project) => (
          <motion.div
            key={project._id}
            className="flex justify-between items-center cursor-pointer p-3 border border-slate-300 rounded-md hover:bg-gray-100"
            whileHover={{ scale: 1.02 }}
          >
            {/* Project Info */}
            <div onClick={() => navigate('/project', { state: { project } })}>
              <h2 className="font-medium">{project.name}</h2>
              <div className="flex items-center text-sm text-gray-600">
                <i className="ri-user-line mr-1"></i> {project.users.length} collaborators
              </div>
            </div>

            {/* Toggleable Delete Button */}
            <button
              onClick={() => setActiveDelete(activeDelete === project._id ? null : project._id)}
              className="text-gray-500 hover:text-black transition"
            >
              {activeDelete === project._id ? (
                <i className="ri-delete-bin-line text-lg text-red-600 hover:text-red-800" onClick={() => handleDeleteProject(project._id)}></i>
              ) : (
                <i className="ri-more-fill text-lg"></i> // Three dots icon
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Need Help Section */}
      <div className="mt-4 pb-2">
        <hr className="mb-3" />
        <button className="flex items-center text-sm text-gray-500 hover:text-black transition">
          <i className="ri-question-line text-lg mr-2"></i>
          Need Help?
        </button>
      </div>
    </motion.aside>
  );
};

export default SideNav;
