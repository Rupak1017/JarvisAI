import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const Register = () => {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [error, setError] = useState(''); // Added state for error message
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    setIsLoading(true);
    // Informing the user about the potential delay due to free cloud hosting
    alert(
      "Please note: Our backend is hosted on a free cloud server and may take a few seconds to wake up. Thank you for your patience while we process your registration."
    );
    axios
      .post('/users/register', { email, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        console.log(res.data);
        navigate('/');
      })
      .catch(err => {
        console.error('Registration error response:', err.response);
        let errorMessage = 'Registration failed. Please try again.';
        if (err.response && err.response.data) {
          // If backend sends a plain text error message
          if (typeof err.response.data === 'string') {
            if (
              err.response.data.includes('duplicate') ||
              err.response.data.includes('E11000')
            ) {
              errorMessage = 'User is already registered';
            } else {
              errorMessage = err.response.data;
            }
          }
          // If error response is in JSON format with an "errors" field
          else if (err.response.data.errors) {
            if (Array.isArray(err.response.data.errors)) {
              errorMessage = err.response.data.errors
                .map(error => error.msg || error)
                .join(', ');
            } else {
              errorMessage = err.response.data.errors;
            }
          }
        }
        setError(errorMessage);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">
          Register
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
            Register
          </button>
        </form>
        <p className="text-gray-400 mt-4 md:mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
