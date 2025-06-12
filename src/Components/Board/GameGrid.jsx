import React, { memo } from "react";
import Square from "../Square/Square";

const GameGrid = ({ squares, onSquareClick, winningLine, boardSize, gameOver, isGameFinished, transitionKey, gapClass }) => {
  if (!Array.isArray(squares)) {
    return null;
  } // Avoid rendering when squares is undefined

  return (
    <div
      key={transitionKey}
      className={`grid ${gapClass} max-w-[calc(90vw-4px)] mx-auto opacity-100 transition-opacity duration-300 bg-transparent`}
      style={{ 
        gridTemplateColumns: `repeat(${boardSize}, min(8vw, 3rem))`,
        minHeight: `calc(min(8vw,3rem)*${boardSize}+2px*${boardSize-1})`
      }}
    >
      {squares.map((_, index) => (
        <Square
          key={index}
          index={index}
          value={squares[index]}
          onSquareClick={onSquareClick}
          isWinner={winningLine?.includes(index)}
          disabled={gameOver || isGameFinished}
          boardSize={boardSize}
        />
      ))}
    </div>
  );
};

const areEqual = (prev, next) => {
  return (
    prev.boardSize === next.boardSize &&
    prev.onSquareClick === next.onSquareClick && // function ref
    prev.winningLine?.join() === next.winningLine?.join() && // shallow array compare
    prev.squares.join() === next.squares.join() && // shallow array compare
    prev.gameOver === next.gameOver &&
    prev.isGameFinished === next.isGameFinished &&
    prev.transitionKey === next.transitionKey &&
    prev.gapClass === next.gapClass
  );
};

export default memo(GameGrid, areEqual);