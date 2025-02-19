import React, { useEffect, useState, useContext } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import SideNav from './SideNav';
import TypewriterHeadline from './TypewriterHeadline';
import UserMenu from './UserMenu';
import { UserContext } from '../context/user.context';

export const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Example logout handler
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Fetch existing projects
  useEffect(() => {
    axios.get('/projects/all')
      .then((res) => {
        setProjects(res.data.projects || []);
      })
      .catch((error) => console.error(error));
  }, []);

  // Create new project
  function createProject(e) {
    e.preventDefault();
    axios.post('/projects/create', { name: projectName })
      .then((res) => {
        setNewProject(res.data);
        setIsModalOpen(false);
        setProjectName('');
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Fixed Header */}
      <header className="
          fixed top-0 left-0 right-0
          flex items-center justify-between
          px-4 py-2
          border-b border-gray-300
          bg-white
          z-50
        ">
        {/* Hamburger Icon */}
        <button
          onClick={toggleSidebar}
          className="
            p-2 bg-white rounded-full shadow-md border border-black 
            hover:bg-gray-100 transition
          ">
          <i className="ri-menu-line text-2xl text-black"></i>
        </button>

        {/* User Menu (only show if logged in) */}
        {user && (
          <UserMenu
            user={user}
            onLogout={handleLogout}
          />
        )}
      </header>

      {/* Main container: side nav + content */}
      <div className="flex-1 pt-16 flex">
        {/* Sidebar */}
        <SideNav projects={projects} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setProjects={setProjects} />


        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4">
          <div className="flex flex-col items-center text-center mt-[20vh]">
            <TypewriterHeadline
              text="Hello, I'm Jarvis. Let's get to work."
              speed={75}
            />

            <p className="mt-2 text-lg text-gray-700 font-medium">
              Ready to Collaborate?
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="
                mt-10 w-full max-w-md py-4 px-6 
                bg-white text-black border border-black rounded-md shadow 
                text-lg font-semibold 
                flex items-center justify-center space-x-2
                hover:bg-gray-100 transition
              ">
              <i className="ri-add-circle-line text-xl"></i>
              <span>Create New Project</span>
            </button>

            {newProject && (
              <motion.div
                onClick={() => {
                  setProjects((prev) => [...prev, newProject]);
                  setNewProject(null);
                  navigate('/project', { state: { project: newProject } });
                }}
                className="
                  w-full max-w-md mt-6 p-5 border border-black rounded-md shadow 
                  cursor-pointer hover:bg-gray-50 transition
                "
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-2">{newProject.name}</h2>
                <div className="flex items-center text-sm">
                  <i className="ri-user-line mr-1"></i>
                  {newProject.users.length} collaborators
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 p-4 text-center text-sm text-gray-400">
        © 2025 Rupak Potdukhe. All Rights Reserved.
      </footer>

      {/* Modal for creating new project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white border border-black p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" htmlFor="projectName">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  id="projectName"
                  className="
                    w-full border border-gray-300 rounded px-3 py-2 
                    focus:outline-none focus:ring-2 focus:ring-black
                  "
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="
                    border border-black text-black px-4 py-2 rounded 
                    hover:bg-gray-100 transition
                  ">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="
                    bg-black text-white px-4 py-2 rounded 
                    hover:bg-gray-800 transition
                  ">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
