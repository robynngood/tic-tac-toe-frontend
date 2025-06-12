import { useAppContext } from "../../Context/AppContext";
import Card from "../../Components/ui/Card/Card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PlayerAvatar from "../../Components/Common/PlayerAvatar";

const Profile = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/"); // redirect if not logged in
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-900 to-purple-900">
      <Card
        className="w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        {/* User Info */}
        <div className="space-y-4 text-center break-words">
          <PlayerAvatar
            name={user.name}
            userId={user._id}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full mx-auto shadow-md border-4 border-white/30 animate-fadeIn"
            style={{ animationDelay: "0.3s" }}
          />
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            Hi, {user.name}
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg text-white/90 animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            Email: {user.email}
          </p>
          <p
            className="text-sm sm:text-base md:text-lg text-white/90 animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            UID: {user._id}
          </p>
        </div>

        {/* Divider */}
        <div
          className="border-t border-white/30 animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        />

        {/* Match History */}
        <div className="space-y-4 text-center break-words">
          <h3
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white animate-fadeIn"
            style={{ animationDelay: "0.6s" }}
          >
            📊 Match History
          </h3>
          <ul
            className="list-disc list-inside text-base sm:text-lg md:text-xl text-white/90 space-y-2 animate-fadeIn"
            style={{ animationDelay: "0.7s" }}
          >
            <li>Total Matches: {user.stats?.matches || 0}</li>
            <li>Matches Won: {user.stats?.matchesWon || 0}</li>
            <li>Matches Lost: {user.stats?.matchesLost || 0}</li>
            <li>Matches Draw: {user.stats?.matchesDraw || 0}</li>
            <li>Total Rounds: {user.stats?.rounds || 0}</li>
            <li>Rounds Won: {user.stats?.wins || 0}</li>
            <li>Rounds Lost: {user.stats?.losses || 0}</li>
            <li>Rounds Draw: {user.stats?.draws || 0}</li>
          </ul>
        </div>

        {/* Divider */}
        <div
          className="border-t border-white/30 animate-fadeIn"
          style={{ animationDelay: "0.7s" }}
        />

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
          className="w-full mt-6 sm:mt-8 px-4 py-2 sm:px-6 sm:py-3 backdrop-blur-lg bg-red-500/80 hover:bg-red-600/80 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg animate-fadeIn focus:ring-2 focus:ring-red-500"
          style={{ animationDelay: "0.8s" }}
          aria-label="Log out of account"
        >
          Logout
        </button>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/home")}
          className="w-full mt-6 sm:mt-8 px-4 py-2 sm:px-6 sm:py-3 backdrop-blur-lg bg-green-500/80 hover:bg-green-600/80 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg lg:text-xl animate-fadeIn focus:ring-2 focus:ring-green-500"
          style={{ animationDelay: "0.9s" }}
          aria-label="Return to home page"
        >
          Back to Home
        </button>
      </Card>

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

export default Profile;
