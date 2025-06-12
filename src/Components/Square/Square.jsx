
import React, { memo } from "react";

const Square = ({index, value, isWinner, onSquareClick, disabled, boardSize}) => {

  const isLargeBoard = boardSize >= 8;

    return (
        <button
      className={`w-[min(8vw,3rem)] h-[min(8vw,3rem)] flex items-center justify-center ${
        isLargeBoard ? "text-[min(5.5vw,1.5rem)]" : "text-[min(5vw,1.25rem)]"
      } font-bold rounded-md transition-all duration-200 ${
        isWinner
          ? "bg-yellow-400/40 border-2 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.9)]"
          : "bg-white/10 border border-white/50"
      } hover:bg-white/20 backdrop-blur-sm disabled:cursor-not-allowed`}
      onClick={() => onSquareClick(index)}
      disabled={disabled}
    >
      {value}
    </button>
    )
}

// this function defines if re-render is needed or not
const areEqual = (prevProps, nextProps) => {  // this is called automatically by React ... everytime React tries to re-render <Square/>
    return (
        prevProps.value === nextProps.value && // React compares old props v/s new props using areEqual function
        prevProps.isWinner === nextProps.isWinner &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.boardSize === nextProps.boardSize
    );
}

export default memo(Square, areEqual);