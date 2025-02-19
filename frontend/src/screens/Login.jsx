import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const Login = () => {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [error, setError] = useState(''); // Error state
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Function to handle form submission
  function submitHandler(e) {
    e.preventDefault();
    axios
      .post('/users/login', { email, password })
      .then(res => {
        console.log(res.data);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      })
      .catch(err => {
        console.error('Login error response:', err.response);
        // Try to extract the error message from the response; if not available, use a default message
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Login failed. Please try again.';
        setError(errorMessage);
      });
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
            className="w-full py-2 md:py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
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
    </div>
  );
};

export default Login;
