export const gameReducer = (state = { gameOver: false }, action) => {

  switch (action.type) {
    case "SET_SYMBOL":
      
      return {
        ...state,
        mySymbol: action.payload,
      };

    case "SYNC_STATE_FROM_SOCKET":
      // Handle minimal payload with index/symbol
      const boardSize = state.boardSize || 3; // Default to 3x3 if undefined
      const maxIndex = boardSize * boardSize - 1;
      let updatedSquares = state.squares
        ? [...state.squares]
        : Array(boardSize * boardSize).fill(null);

      if (
        action.payload.index !== undefined &&
        action.payload.symbol &&
        action.payload.index >= 0 &&
        action.payload.index <= maxIndex
      ) {
        updatedSquares = [...updatedSquares];
        updatedSquares[action.payload.index] = action.payload.symbol;
      } else if (Array.isArray(action.payload.squares)) {
        updatedSquares = [...action.payload.squares];
      } else {
      
      }

      const isGameFinished =
        action.payload.isGameFinished !== undefined
          ? action.payload.isGameFinished
          : state.isGameFinished || false;

      return {
        ...state,
        squares: updatedSquares,
        xIsNext:
          action.payload.xIsNext !== undefined
            ? action.payload.xIsNext
            : state.xIsNext,
        gameOver:
          isGameFinished || action.payload.gameOver !== undefined
            ? action.payload.gameOver ||
              !!action.payload.winner ||
              action.payload.draw
            : state.gameOver,
        currentRound:
          action.payload.currentRound !== undefined
            ? action.payload.currentRound
            : state.currentRound || 1,
        winningLine: action.payload.winningLine || state.winningLine || [],
        isGameFinished,
      };

    case "SET_CURRENT_ROUND":
      return {
        ...state,
        currentRound: action.payload.currentRound,
      };

    case "CLEAR_WINNING_LINE":
      return {
        ...state,
        winningLine: action.payload.winningLine || [],
        gameOver: false, // Explicitly preserve gameOver
      };

    case "RESTORE_STATE":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};
