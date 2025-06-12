import React, { memo, useEffect, useRef } from "react";

const MatchSummary = ({ roundResults, boardWidth, playerX, playerO }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [roundResults]);

  const getResultDisplay = (result) => {
    const safePlayerX = playerX || { name: "Unknown", id: null, symbol: "X" };
    const safePlayerO = playerO || { name: "Unknown", id: null, symbol: "O" };

    // Check draw first to handle winner: null, isDraw: true
    if (result.isDraw) {
      return `R${result.round} - Draw`;
    }

    if (result.winner) {
      const player =
        result.winner === safePlayerX?.symbol ? safePlayerX : safePlayerO;
      const playerName = player?.name || result.winner || "Unknown";
      let display = `R${result.round} - ${playerName}(${result.winner})`;

      if (result.reason === "Time Over") {
        display += "(Timeout)";
      }

      return display;
    }

    return `R${result.round} - Unknown`;
  };

  return (
    <div
      className="w-full sm:w-fit mx-auto text-sm text-center overflow-x-auto rounded-lg bg-white bg-opacity-90 px-4 py-2 shadow-md text-gray-800 mb-2 sm:backdrop-blur-sm sm:p-4"
      style={{
        width: boardWidth ? `${boardWidth}px` : "auto",
      }}
      ref={scrollRef}
    >
      <h2 className="font-bold mb-2">Match Summary</h2>
      <div className="flex justify-start w-max gap-3">
        {roundResults.map((result, idx) => (
          <div
            key={idx}
            className="px-3 py-1 bg-white/80 rounded shadow whitespace-nowrap"
          >
            {getResultDisplay(result)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(MatchSummary);
