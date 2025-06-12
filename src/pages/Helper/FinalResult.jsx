import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PopupCard from "../../Components/Popup/PopupCard"
import PlayerAvatar from "../../Components/Common/PlayerAvatar"

const FinalResult = ({ playerXWins, playerOWins, draw, navigate, playerX, playerO }) => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || null;

  // Determine winner or draw
  const winnerText = useMemo(() => {
    if (playerXWins > playerOWins) {
      return `${playerX?.name || "Player 1"} won`;
    } else if (playerOWins > playerXWins) {
      return `${playerO?.name || "Player 2"} won`;
    } else {
      return "Match Draw";
    }
  }, [playerXWins, playerOWins, playerX, playerO]);

  const handleNavigateHome = () => {
    if (roomId) {
      localStorage.removeItem(`gameState_${roomId}`);
      localStorage.removeItem(`room_${roomId}`);
      localStorage.removeItem(`roundResults_${roomId}`); 
      localStorage.removeItem("activeRoomId");
      localStorage.removeItem("lastRoomConfig"); 
    }
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[50]">
      <PopupCard
        className="w-full max-w-[22rem] sm:max-w-md md:max-w-lg lg:max-w-xl m-[2vw] sm:m-[3vw] p-4 sm:p-6 md:p-8 space-y-1 sm:space-y-2 md:space-y-3 backdrop-blur-lg bg-amber-50/80 border border-amber-200/50 rounded-xl shadow-lg"
      >
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black text-center">
          Match Over
        </h2>

        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Player X Info */}
          <div className="flex flex-col items-center flex-1">
            <PlayerAvatar
              key={playerX?.id}
              name={playerX?.name || "Player 1"}
              userId={playerX?.id}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-24 lg:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-purple-400"
            />
            <span className="text-xs sm:text-sm md:text-base lg:text-lg text-black truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px]">
              {playerX?.name || "Player 1"}
            </span>
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              ({playerX?.symbol || "X"})
            </span>
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-black">
              Wins: {playerXWins}
            </span>
          </div>

          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black mx-1 sm:mx-2 md:mx-4">
            vs
          </span>

          {/* Player O Info */}
          <div className="flex flex-col items-center flex-1">
            <PlayerAvatar
              key={playerO?.id}
              name={playerO?.name || "Player 2"}
              userId={playerO?.id}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-24 lg:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-blue-400"
            />
            <span className="text-xs sm:text-sm md:text-base lg:text-lg text-black truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px]">
              {playerO?.name || "Player 2"}
            </span>
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              ({playerO?.symbol || "O"})
            </span>
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-black">
              Wins: {playerOWins}
            </span>
          </div>
        </div>

        {/* Winner or Draw */}
        <div className="text-center">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black">
            {winnerText}
          </span>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={handleNavigateHome}
          className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm sm:text-base md:text-lg"
          aria-label="Return to home page"
        >
          Back to Home
        </button>
      </PopupCard>
    </div>
  );
};

export default FinalResult;