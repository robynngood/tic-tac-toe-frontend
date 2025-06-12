import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../Components/ui/Card/Card";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAppContext();
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      fetchUser(token);
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        fetchUser(storedToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.isAuthenticated) {
        setUser(res.data.user);
        navigate("/home");
      } else {
        setLoading(false);
      }
    } catch (err) {
      localStorage.removeItem("token");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-white text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4 sm:p-6">
      <Card
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 sm:p-8 space-y-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl animate-fadeIn"
      >
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v18M3 12h18M6 6l12 12M6 18L18 6"
            />
          </svg>
        </div>

        {/* Title and Tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Tic Tac Toe
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/80">
            Join the fun, challenge your friends!
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white text-gray-900 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
          aria-label="Sign in with Google"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.24 10.44v2.06h5.47c-.24 1.18-.97 2.18-2.03 2.97-1.8 1.34-4.36 1.34-6.16 0-1.8-1.34-2.56-3.63-1.97-5.97.59-2.34 2.56-4.12 4.97-4.59 1.44-.28 2.88.03 4.12.81.88.56 1.59 1.31 2.09 2.22l-2.44 1.88c-.41-.53-.97-.94-1.59-1.16-.97-.34-2-.22-2.91.34-1.06.66-1.75 1.88-1.75 3.25s.69 2.59 1.75 3.25c.94.59 2.09.75 3.19.41.94-.28 1.69-.97 2.03-1.88.28-.75.28-1.56 0-2.31h-5.47z"
              fill="#4285F4"
            />
          </svg>
          Sign in with Google
        </button>
      </Card>
    </div>
  );
};

export default Dashboard;