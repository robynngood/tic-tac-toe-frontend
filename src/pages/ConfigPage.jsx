import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../Components/ui/Card/Card";
import { useAppContext } from "../Context/AppContext";
import { getAvailableLineLengths } from "../GameLogic";
import JoinRoomPopup from "../Components/Popup/JoinRoomPopup";
import { useSocket } from "../Context/SocketContext";

const ConfigPage = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { socket, connected } = useSocket();
  const [error, setError] = useState(null);

  const mode = useMemo(() => "friend", []);

  // Initialize state from localStorage or defaults
  const [boardSize, setBoardSize] = useState(() => {
    const draftConfig = localStorage.getItem("draftConfig");
    if (draftConfig) {
      try {
        const parsed = JSON.parse(draftConfig);
        return Number(parsed.boardSize) || 3;
      } catch (error) {
        setError("ConfigPage: Failed to parse draftConfig")
      }
    }
    return 3;
  });
  const [lineLength, setLineLength] = useState(() => {
    const draftConfig = localStorage.getItem("draftConfig");
    if (draftConfig) {
      try {
        const parsed = JSON.parse(draftConfig);
        return Number(parsed.lineLength) || 3;
      } catch (error) {
        setError("ConfigPage: Failed to parse draftConfig")
      }
    }
    return 3;
  });
  const [rounds, setRounds] = useState(() => {
    const draftConfig = localStorage.getItem("draftConfig");
    if (draftConfig) {
      try {
        const parsed = JSON.parse(draftConfig);
        return Number(parsed.rounds) || 1;
      } catch (error) {
        setError("ConfigPage: Failed to parse draftConfig")
      }
    }
    return 1;
  });
  const [timerDuration, setTimerDuration] = useState(() => {
    const draftConfig = localStorage.getItem("draftConfig");
    if (draftConfig) {
      try {
        const parsed = JSON.parse(draftConfig);
        return parsed.timerDuration === null
          ? null
          : Number(parsed.timerDuration) || null;
      } catch (error) {
        setError("ConfigPage: Failed to parse draftConfig")
      }
    }
    return null;
  });

  const [showJoinPopup, setShowJoinPopup] = useState(false);
  

  const availableLineLengths = useMemo(
    () => getAvailableLineLengths(boardSize),
    [boardSize]
  );

  // Clear game-related localStorage keys on mount, preserving draftConfig
  useEffect(() => {
    localStorage.removeItem("activeRoomId");
    localStorage.removeItem("lastRoomConfig");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("gameState_") || key.startsWith("room_") || key.startsWith("roundResults_")) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Save draft config to localStorage on state change
  useEffect(() => {
    const draftConfig = { boardSize, lineLength, rounds, timerDuration };
    localStorage.setItem("draftConfig", JSON.stringify(draftConfig));
  }, [boardSize, lineLength, rounds, timerDuration]);

  // Automatically update lineLength when boardSize changes
  useEffect(() => {
    if (!availableLineLengths.includes(lineLength)) {
      setLineLength(availableLineLengths[0]);
    }
  }, [availableLineLengths, lineLength]);

  const handleBoardSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setBoardSize(size);
    const validLengths = getAvailableLineLengths(size);
    if (!validLengths.includes(lineLength)) {
      setLineLength(validLengths[0]);
    }
  };

  const handleCreateRoom = () => {
    if (!user) {
      setError("User not logged in!");
      setTimeout(() => setError(null), 2000);
      return;
    }
    localStorage.removeItem("draftConfig");
    navigate(
      `/create-room?board=${encodeURIComponent(
        boardSize
      )}&line=${encodeURIComponent(lineLength)}&rounds=${encodeURIComponent(
        rounds
      )}&timer=${encodeURIComponent(timerDuration || "none")}`
    );
  };

  const handleJoinRoom = (roomId) => {
    if (!user) {
      setError("Please log in to continue!");
      setTimeout(() => setError(null), 2000);
      return;
    }
    if (!socket) {
      setError("Cannot connect to server. Please try again.");
      setTimeout(() => setError(null), 2000);
      return;
    }
    if (!connected) {
      setError("Disconnected from server. Reconnecting...");
      setTimeout(() => setError(null), 2000);
      return;
    }
    localStorage.removeItem("draftConfig");
    navigate(`/join-room?roomId=${encodeURIComponent(roomId)}`);
  };

  const handleBackToHome = () => {
    localStorage.removeItem("draftConfig");
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
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }
          .animate-fadeInOut {
            animation: fadeInOut 2s ease-in-out forwards;
          }
          select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23F3F4F6' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1.5em;
          }
          select option {
            background-color: #1F2937;
            color: #F3F4F6;
          }
        `}
      </style>
      <div className="min-h-screen flex justify-center items-center p-2 sm:p-4 md:p-6 bg-gradient-to-br from-blue-900 to-purple-900">
        <Card
          className="relative w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 text-center space-y-6 sm:space-y-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-lg animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
              <div
                className="backdrop-blur-lg bg-red-500/80 text-white font-medium px-6 py-3 rounded-lg shadow-lg text-base sm:text-lg max-w-[80%] animate-fadeInOut focus:ring-2 focus:ring-red-500"
              >
                {error}
              </div>
            </div>
          )}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 animate-fadeIn"
            style={{ animationDelay: "0.3s" }}
          >
            Play With Friend
          </h1>
          <div className="text-left space-y-6">
            <div className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
              <label className="block mb-1 font-medium text-base sm:text-lg md:text-xl text-white/90">
                Select Board
              </label>
              <select
                className="w-full bg-gray-800/50 border border-white/30 hover:border-white/50 text-gray-100 p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-base sm:text-lg animate-fadeIn"
                style={{ animationDelay: "0.5s" }}
                value={boardSize}
                onChange={handleBoardSizeChange}
                aria-label="Select board size"
              >
                {Array.from({ length: 9 }, (_, i) => i + 3).map((size) => (
                  <option key={size} value={size}>
                    {size} x {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: "0.6s" }}>
              <label className="block mb-1 font-medium text-base sm:text-lg md:text-xl text-white/90">
                Select Align
              </label>
              <select
                className="w-full bg-gray-800/50 border border-white/30 hover:border-white/50 text-gray-100 p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-base sm:text-lg animate-fadeIn"
                style={{ animationDelay: "0.7s" }}
                value={lineLength}
                onChange={(e) => setLineLength(parseInt(e.target.value))}
                aria-label="Select alignment length"
              >
                {availableLineLengths.map((length) => (
                  <option key={length} value={length}>
                    {length} in a row
                  </option>
                ))}
              </select>
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: "0.8s" }}>
              <label className="block mb-1 font-medium text-base sm:text-lg md:text-xl text-white/90">
                Number of Rounds
              </label>
              <select
                className="w-full bg-gray-800/50 border border-white/30 hover:border-white/50 text-gray-100 p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-base sm:text-lg animate-fadeIn"
                style={{ animationDelay: "0.9s" }}
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                aria-label="Select number of rounds"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Round" : "Rounds"}
                  </option>
                ))}
              </select>
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: "1.0s" }}>
              <label className="block mb-1 font-medium text-base sm:text-lg md:text-xl text-white/90">
                Timer Duration
              </label>
              <select
                className="w-full bg-gray-800/50 border border-white/30 hover:border-white/50 text-gray-100 p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-base sm:text-lg animate-fadeIn"
                style={{ animationDelay: "1.1s" }}
                value={timerDuration || "none"}
                onChange={(e) =>
                  setTimerDuration(
                    e.target.value === "none" ? null : parseInt(e.target.value)
                  )
                }
                aria-label="Select timer duration"
              >
                <option value="none">No Timer</option>
                <option value="10">10 Seconds</option>
                <option value="30">30 Seconds</option>
              </select>
            </div>
          </div>

          <button
            className="w-full backdrop-blur-lg bg-green-500/80 hover:bg-green-600/80 text-white font-semibold p-2 sm:p-3 rounded-lg hover:scale-105 transition-all duration-300 text-base sm:text-lg md:text-xl animate-fadeIn focus:ring-2 focus:ring-green-500"
            style={{ animationDelay: "0.9s" }}
            onClick={handleCreateRoom}
            aria-label="Create a new game room"
          >
            Create Room
          </button>

          <button
            className="w-full backdrop-blur-lg bg-yellow-500/80 hover:bg-yellow-600/80 text-white font-semibold p-2 sm:p-3 rounded-lg hover:scale-105 transition-all duration-300 text-base sm:text-lg md:text-xl animate-fadeIn focus:ring-2 focus:ring-yellow-500"
            style={{ animationDelay: "1.0s" }}
            onClick={() => setShowJoinPopup(true)}
            aria-label="Join an existing game room"
          >
            Join Room
          </button>

          <button
            className="w-full mt-2 sm:mt-4 backdrop-blur-lg bg-green-500/80 hover:bg-green-600/80 text-white font-semibold p-2 sm:p-3 rounded-lg hover:scale-105 transition-all duration-300 text-base sm:text-lg md:text-xl animate-fadeIn focus:ring-2 focus:ring-green-500"
            style={{ animationDelay: "1.1s" }}
            onClick={handleBackToHome}
            aria-label="Return to home page"
          >
            Back to Home
          </button>

          {showJoinPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <JoinRoomPopup
                onJoin={handleJoinRoom}
                onClose={() => setShowJoinPopup(false)}
              />
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default ConfigPage;
