import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // TODO: Integrate with Sentry or logging service in production
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ error, reset }) => {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    // Clear localStorage keys to prevent stale data
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("gameState_") ||
        key.startsWith("room_") ||
        key.startsWith("roundResults_") ||
        key === "activeRoomId" ||
        key === "lastRoomConfig"
      ) {
        localStorage.removeItem(key);
      }
    });
    navigate("/home");
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-xs sm:max-w-sm md:max-w-md p-4 sm:p-6 md:p-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg animate-fadeIn">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 text-center mb-4 sm:mb-6">
            Something went wrong
          </h1>
          <p className="text-white/80 text-sm sm:text-base md:text-lg text-center mb-6 sm:mb-8">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={reset}
              className="flex-1 backdrop-blur-sm bg-green-500/80 hover:bg-green-600/80 text-white font-semibold p-2 sm:p-3 rounded-lg hover:scale-105 transition-all duration-300 text-base sm:text-lg md:text-xl focus:ring-2 focus:ring-green-500 animate-fadeIn"
              aria-label="Retry the application"
            >
              Retry
            </button>
            <button
              onClick={handleNavigateHome}
              className="flex-1 backdrop-blur-sm bg-blue-500/80 hover:bg-blue-600/80 text-white font-semibold p-2 sm:p-3 rounded-lg hover:scale-105 transition-all duration-300 text-base sm:text-lg md:text-xl focus:ring-2 focus:ring-blue-500 animate-fadeIn"
              aria-label="Navigate back to home"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorBoundary;