import { useNavigate } from "react-router-dom";
import Card from "../Components/ui/Card/Card";
import { useAppContext } from "../Context/AppContext";
import { useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  // Clear game-related localStorage keys on mount
  useEffect(() => {
    localStorage.removeItem("activeRoomId");
    localStorage.removeItem("lastRoomConfig");
    localStorage.removeItem("draftConfig");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("gameState_") || key.startsWith("room_") || key.startsWith("roundResults_")) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const handlePlayWithFriend = () => {
    navigate("/config?mode=friend");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 max-w-2xl w-full">
        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0s" }}
        >
          TIC TAC TOE
        </h1>

        {/* Welcome Message */}
        <p
          className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium text-center animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          Welcome, {user?.name || "Guest"}!
        </p>

        {/* Cards */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
          {/* Profile Card */}
          <Card
            onClick={handleProfileClick}
            className="w-56 sm:w-72 md:w-80 max-w-full text-center cursor-pointer backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
            aria-label="Go to Profile"
          >
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl mb-2 animate-pulse">👤</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Profile</h2>
            </div>
          </Card>

          {/* Play with Friend Card */}
          <Card
            onClick={handlePlayWithFriend}
            className="w-56 sm:w-72 md:w-80 max-w-full text-center cursor-pointer backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: "0.6s" }}
            aria-label="Play with Friend"
          >
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl mb-2 animate-pulse">🤝</div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Play with Friend</h2>
            </div>
          </Card>
        </div>
      </div>

      {/* Custom CSS for FadeIn Animation */}
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
    </div>
  );
};

export default HomePage;