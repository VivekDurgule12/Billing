import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-teal-900">
      <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-teal-300 mb-6 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none mb-4 transition-all duration-200"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none mb-6 transition-all duration-200"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg text-lg font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;