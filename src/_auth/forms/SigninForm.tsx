import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';

const SigninForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-2xl max-w-md w-full"
      >
        <motion.img
          src="/assets/images/logo.svg"
          alt="Topfived logo"
          className="mx-auto mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <h2 className="text-3xl font-bold text-white text-center mb-6">Log in to your account</h2>
        <p className="text-gray-300 text-center mb-8">Unlock Full Access! Please enter your details.</p>

        <form className="space-y-6">
          <div className="relative">
            <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">or</p>
          <button className="mt-4 w-full bg-white text-gray-800 font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center">
            <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
            Sign in with Google
          </button>
        </div>

        <p className="text-gray-400 text-center mt-8">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-purple-400 hover:text-purple-300 transition duration-300">
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SigninForm;