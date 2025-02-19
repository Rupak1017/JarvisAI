import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @param {Object} user  - The logged-in user object.
 * @param {Function} onLogout - Callback function to handle logout.
 */
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Derive an initial from either user's name or email
  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : '?';

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Avatar Circle */}
      <button
        onClick={toggleMenu}
        className="
          w-10 h-10 
          rounded-full 
          bg-gray-200 
          flex items-center justify-center 
          font-bold text-gray-700
          hover:bg-gray-300
          transition
        "
      >
        {initial}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              origin-top-right 
              absolute right-0 mt-2 
              w-36 
              bg-white 
              border border-gray-300 
              rounded-md 
              shadow-lg
              z-50
            "
          >
            <button
              onClick={handleLogout}
              className="
                flex items-center 
                w-full px-4 py-2 text-sm text-gray-700 
                hover:bg-gray-100
              "
            >
              <i className="ri-logout-box-line mr-2"></i>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
