import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const Login = () => {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [error, setError] = useState(''); // Error state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showAlert, setShowAlert] = useState(false); // Alert modal state
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Function to proceed with login after user confirms the alert modal
  const handleAlertConfirm = () => {
    setShowAlert(false);
    setIsLoading(true);
    axios
      .post('/users/login', { email, password })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      })
      .catch((err) => {
        console.error('Login error response:', err.response);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Login failed. Please try again.';
        setError(errorMessage);
      })
      .finally(() => setIsLoading(false));
  };

  // Function to handle form submission
  function submitHandler(e) {
    e.preventDefault();
    // Instead of native alert, show custom modal
    setShowAlert(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">
          Login
        </h2>
        {error && (
          <div className="mb-4 text-red-500 text-center">
            {error}
          </div>
        )}
        <form onSubmit={submitHandler}>
          <div className="mb-3 md:mb-4">
            <label className="block text-gray-400 mb-1 md:mb-2" htmlFor="email">
              Email
            </label>
            <input
              onChange={(e) => setemail(e.target.value)}
              type="email"
              id="email"
              className="w-full p-2 md:p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4 md:mb-6">
            <label className="block text-gray-400 mb-1 md:mb-2" htmlFor="password">
              Password
            </label>
            <input
              onChange={(e) => setpassword(e.target.value)}
              type="password"
              id="password"
              className="w-full p-2 md:p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 md:py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 flex items-center justify-center"
          >
            {isLoading && <i className="ri-loader-2-line animate-spin mr-2"></i>}
            Login
          </button>
        </form>
        <p className="text-gray-400 mt-4 md:mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Create one
          </Link>
        </p>
      </div>

      {/* Custom Alert Modal */}
      {showAlert && (
        <>
          {/* Blurred background overlay */}
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed top-0 inset-x-0 flex justify-center z-50"
          >
            <div className="bg-white rounded shadow p-3 w-11/12 max-w-xs">
              <h3 className="text-md font-semibold mb-1">Please Note</h3>
              <p className="text-gray-700 text-sm mb-3">
                Our backend is hosted on a free cloud server and may take a few seconds to wake up.
              </p>
              <button
                onClick={handleAlertConfirm}
                className="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none text-sm"
              >
                OK
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Login;
