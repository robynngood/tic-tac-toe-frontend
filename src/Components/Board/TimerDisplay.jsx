
import React, { memo } from "react";
import { formatName } from "../../GameLogic";

const TimerDisplay = ({ timer, xIsNext, playerX, playerO, boardSize, showPlayer }) => {
  const isSmallBoard = boardSize <= 5;

  // Determine if this TimerDisplay is for Player O (below the grid)
  const isPlayerOBelow = showPlayer === "O";

  return (
    <div className={`flex justify-center w-full ${isPlayerOBelow ? "mt-[2px] sm:mt-[2px]" : "mb-[2px] sm:mb-[2px]"}`}>
      <div
        className={`flex items-center ${
          showPlayer === "both"
            ? isSmallBoard
              ? "space-x-4 sm:space-x-8"
              : "space-x-8 sm:space-x-12"
            : ""
        } bg-white/10 ${isSmallBoard ? "px-3 py-1 sm:px-4 sm:py-2" : "px-5 py-2.5 sm:px-8 sm:py-4"} rounded-lg`}
      >
        {/* Player X (if showPlayer is "X" or "both") */}
        {(showPlayer === "X" || showPlayer === "both") && (
          <div
            className={`flex items-center ${
              isSmallBoard ? "gap-1 sm:gap-3" : "gap-3 sm:gap-4"
            } ${xIsNext ? "bg-white/20 px-1 py-0.5 sm:px-2 sm:py-1 rounded" : ""}`}
          >
            <div
              className={`${
                isSmallBoard ? "w-8 h-5 sm:w-12 sm:h-7" : "w-12 h-7 sm:w-16 sm:h-9"
              } bg-black/30 text-white rounded text-center flex items-center justify-center font-mono ${
                isSmallBoard ? "text-sm sm:text-base" : "text-lg sm:text-xl"
              }`}
            >
              {xIsNext && timer !== null ? timer : "--"}
            </div>
            <span
              className={`text-white font-semibold truncate ${
                isSmallBoard ? "text-sm sm:text-base max-w-[80px] sm:max-w-[120px]" : "text-lg sm:text-xl max-w-[120px] sm:max-w-[180px]"
              }`}
            >
              {formatName(playerX?.name || "Player X")}(X)
            </span>
          </div>
        )}

        {/* Player O (if showPlayer is "O" or "both") */}
        {(showPlayer === "O" || showPlayer === "both") && (
          <div
            className={`flex items-center ${
              isSmallBoard ? "gap-1 sm:gap-3" : "gap-3 sm:gap-4"
            } ${!xIsNext ? "bg-white/20 px-1 py-0.5 sm:px-2 sm:py-1 rounded" : ""}`}
          >
            <span
              className={`text-white font-semibold truncate ${
                isSmallBoard ? "text-sm sm:text-base max-w-[80px] sm:max-w-[120px]" : "text-lg sm:text-xl max-w-[120px] sm:max-w-[180px]"
              }`}
            >
              {formatName(playerO?.name || "Player O")}(O)
            </span>
            <div
              className={`${
                isSmallBoard ? "w-8 h-5 sm:w-12 sm:h-7" : "w-12 h-7 sm:w-16 sm:h-9"
              } bg-black/30 text-white rounded text-center flex items-center justify-center font-mono ${
                isSmallBoard ? "text-sm sm:text-base" : "text-lg sm:text-xl"
              }`}
            >
              {!xIsNext && timer !== null ? timer : "--"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const areEqual = (prev, next) => {
  return (
    prev.timer === next.timer &&
    prev.xIsNext === next.xIsNext &&
    prev.playerX?.name === next.playerX?.name &&
    prev.playerO?.name === next.playerO?.name &&
    prev.boardSize === next.boardSize &&
    prev.showPlayer === next.showPlayer
  );
};

export default memo(TimerDisplay, areEqual);