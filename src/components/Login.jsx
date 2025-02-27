import React, { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="container mx-auto max-w-md bg-gray-700 rounded-3xl shadow-2xl p-6 sm:p-8 border border-teal-600 flex flex-col justify-center min-h-screen">
      <h1 className="text-3xl font-extrabold text-center text-teal-300 mb-8 tracking-widest drop-shadow-lg animate-fade-in">
        Welcome to Invoice Builder
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-orange-400 font-semibold mb-2 text-center"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (hint: admin)"
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all duration-300 shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-orange-400 font-semibold mb-2 text-center"
          >
            Password
          </label>
          <input
            id="vivek"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password (hint: 1234)"
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all duration-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-xl w-full hover:bg-teal-700 hover:scale-105 transition-all duration-300 shadow-lg text-lg font-semibold flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14"
            />
          </svg>
          Login
        </button>
      </form>
      <p className="text-gray-400 text-center mt-4 italic">
        Use: admin / 1234 to login
      </p>
    </div>
  );
}

export default Login;
