import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
const Register = () => {
  

   const [email, setemail] = useState('');
   const [password, setpassword] = useState('');
   const {setUser} = useContext(UserContext);

  const navigate = useNavigate()
   function submitHandler(e) {
    e.preventDefault();
    axios.post('/users/register', {
        email,
        password
        })
        .then(res => {
          localStorage.setItem('token', res.data.token)
          setUser(res.data.user)
            console.log(res.data)
            navigate('/')
        }).catch(err => {
            console.log(err.response.data)
    })
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Register</h2>
        <form onSubmit={submitHandler}>
          <div className="mb-3 md:mb-4">
            <label className="block text-gray-400 mb-1 md:mb-2" htmlFor="email">Email</label>
            <input
            onChange={(e) => setemail(e.target.value)}
              type="email"
              id="email"
              className="w-full p-2 md:p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4 md:mb-6">
            <label className="block text-gray-400 mb-1 md:mb-2" htmlFor="password">Password</label>
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