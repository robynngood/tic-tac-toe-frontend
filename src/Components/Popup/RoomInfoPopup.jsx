
import React, { useState } from "react";
import { Copy } from "lucide-react";
import PopupCard from "./PopupCard";
import { useSocket } from "../../Context/SocketContext";
import PlayerAvatar from "../Common/PlayerAvatar";

const RoomInfoPopup = ({ playerX, playerO, roomId }) => {
  const { socket, connected } = useSocket();
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleStartGame = () => {
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
    socket.emit("start-game", { roomId });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackErr) {
        setError("Failed to copy Room ID. Please copy it manually.");
        setTimeout(() => setError(null), 2000);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fade-in-out {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }
          .animate-fade-in-out {
            animation: fade-in-out 2s ease-in-out forwards;
          }
        `}
      </style>
      <div className="fixed inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center p-2 sm:p-4">
        <PopupCard
          className="relative w-full max-w-[22rem] sm:max-w-md md:max-w-lg lg:max-w-xl m-[2vw] sm:m-[3vw] p-4 sm:p-6 md:p-8 space-y-1 sm:space-y-2 md:space-y-3 backdrop-blur-lg bg-amber-50/80 border border-amber-200/50 rounded-xl shadow-lg"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black text-center">
            Room Created
          </h2>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
              <div className="bg-red-500/90 text-white font-medium px-6 py-3 rounded-md shadow-lg text-center max-w-[80%] animate-fade-in-out">
                {error}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
            {/* Player X Info */}
            <div className="flex flex-col items-center flex-1">
              <PlayerAvatar
                key={playerX?.id}
                name={playerX?.name || "Player 1"}
                userId={playerX?.id}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-24 lg:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-purple-400"
              />
              <span className="text-xs sm:text-sm md:text-base lg:text-lg text-black truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[180px]">
                {playerX?.name || "Player 1"}
              </span>
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                ({playerX?.symbol || "X"})
              </span>
            </div>

            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mx-2 sm:mx-4">
              vs
            </span>

            {/* Player O Info */}
            <div className="flex flex-col items-center flex-1">
              {playerO ? (
                <>
                  <PlayerAvatar
                    key={playerO?.id}
                    name={playerO?.name || "Player 2"}
                    userId={playerO?.id}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-24 lg:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-blue-400"
                  />
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg text-black truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[180px]">
                    {playerO?.name || "Player 2"}
                  </span>
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    ({playerO?.symbol || "O"})
                  </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gray-300 mb-1 sm:mb-2 md:mb-3" />
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg text-black/80">
                    Waiting...
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Room ID and Copy Button with Feedback */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
            <span className="font-mono bg-gray-700/80 text-white px-2 sm:px-3 md:px-4 py-1 rounded text-xs sm:text-sm md:text-base lg:text-lg">
              {roomId}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomId}
                className="p-1.5 sm:p-2 md:p-2.5 rounded hover:bg-gray-700/10 transition"
                disabled={isCopied}
              >
                {isCopied ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : (
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600 hover:text-gray-800" />
                )}
              </button>
              <span
                className={`text-green-600 text-xs sm:text-sm md:text-base ${
                  isCopied ? "animate-fade-in-out text-black opacity-100" : "text-black opacity-0"
                }`}
                style={{ transition: "opacity 0.1s ease-in-out" }}
              >
                Copied!
              </span>
            </div>
          </div>

          {playerO && (
            <button
              onClick={handleStartGame}
              className="w-full mt-3 sm:mt-4 md:mt-6 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
              disabled={!connected}
            >
              Start Game
            </button>
          )}
        </PopupCard>
      </div>
    </>
  );
};

export default RoomInfoPopup;