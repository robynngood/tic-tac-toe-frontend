
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGameContext } from "../../Context/Context";
import { useSocket } from "../../Context/SocketContext";
import { useAppContext } from "../../Context/AppContext";

import GameGrid from "./GameGrid";
import TimerManager from "./TimerManager";

const Board = ({ totalRounds, setRoundResults, setBoardWidth, onGameEnd, roomId, playerX, playerO }) => {
  const { user: contextUser } = useAppContext();
  const { state, dispatch } = useGameContext();
  const location = useLocation();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const boardRef = useRef(null);
  const lastUpdateBoard = useRef({ winner: null, draw: false });
  const squaresRef = useRef(state.squares); // Ref to track latest state.squares
  const gameOverProcessed = useRef(false); // Track game-over deduplication

  // Memoize stable values to prevent useEffect re-runs
  const user = useMemo(() => contextUser, [contextUser]);

  const memoizedDispatch = useMemo(() => dispatch, [dispatch]);
  const memoizedSetRoundResults = useMemo(() => setRoundResults, [setRoundResults]);
  const memoizedOnGameEnd = useMemo(() => onGameEnd, [onGameEnd]);

  const [displaySquares, setDisplaySquares] = useState(null);
  const [displayRound, setDisplayRound] = useState(state.currentRound || 1);
  const [timer, setTimer] = useState(state.config.timerDuration || null);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [socketLoading, setSocketLoading] = useState(!connected);

  // Sync squaresRef with state.squares
  useEffect(() => {
    squaresRef.current = state.squares;
  }, [state.squares]);

  useEffect(() => {
    setSocketLoading(!connected);
  }, [connected]);

  useEffect(() => {
    if (roomId) {
      const gameState = {
        squares: state.squares,
        xIsNext: state.xIsNext,
        currentRound: state.currentRound,
        gameOver: state.gameOver,
        isGameFinished: state.isGameFinished,
        winningLine: state.winningLine,
        mySymbol: state.mySymbol,
        playerX,
        playerO,
      };
      localStorage.setItem(
        `gameState_${roomId}`,
        JSON.stringify({
          ...JSON.parse(localStorage.getItem(`gameState_${roomId}`) || "{}"),
          ...gameState,
        })
      );
    }
  }, [state.squares, state.xIsNext, state.currentRound, state.gameOver, state.isGameFinished, state.winningLine, state.mySymbol, playerX, playerO, roomId]);


  // Clear winningLine and displaySquares after 3 seconds for wins
  useEffect(() => {
    if (state.winningLine?.length > 0 && !isGameFinished) {
      const timeout = setTimeout(() => {
        memoizedDispatch({
          type: "CLEAR_WINNING_LINE",
          payload: { winningLine: [] },
        });
        setDisplaySquares(null);
        setDisplayRound(state.currentRound);
        setTransitionKey((prev) => prev + 1); // Trigger board reset animation
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [state.winningLine, memoizedDispatch, isGameFinished, state.currentRound]);

  // Single useEffect for all socket listeners
  useEffect(() => {
    if (!socket) {
      setErrorMessage("Cannot connect to server. Please try again.");
      return;
    }

    const handleUpdateBoard = async ({ index, symbol, xIsNext, currentRound, isGameFinished: gameFinished, winner, draw, winningLine }) => {
      if (isGameFinished || gameFinished) {
        setIsGameFinished(true);
        return;
      }
      try {
        if (winner || draw) {
          lastUpdateBoard.current = { winner, draw };
        }

        // Use squaresRef.current instead of state.squares
        const squares = squaresRef.current ? [...squaresRef.current] : Array(state.boardSize * state.boardSize).fill(null);
        if (index >= 0 && index < squares.length && symbol) {
          squares[index] = symbol;
        } else {
          return;
        }

        const action = {
          type: "SYNC_STATE_FROM_SOCKET",
          payload: {
            squares,
            xIsNext,
            gameOver: !!winner || draw || false,
            winningLine: winningLine || [],
            currentRound,
            isGameFinished: gameFinished || false,
          },
        };

        memoizedDispatch(action);
      } catch (error) {
        setErrorMessage("Error processing move");
        setTimeout(() => setErrorMessage(null), 1500);
      }
    };

    const handleRoundEnded = async ({ result, currentRound: newRound, board, winningLine }) => {
      try {
        const winnerResult = result.match(/Winner - (\w+)/)?.[1] || null;
        const isDraw = result.includes("Draw");
        const reason = result.includes("Line Completion") ? null : result.includes("Time Over") ? "Time Over" : null;

        // Cap newRound at totalRounds
        const cappedNewRound = Math.min(newRound, totalRounds);
        if (newRound > totalRounds) {

        }

        if (!isGameFinished) {
          setDisplaySquares(board);
          setDisplayRound(isDraw || reason === "Time Over" ? cappedNewRound : cappedNewRound - 1);
        }

        memoizedDispatch({
          type: "SET_CURRENT_ROUND",
          payload: { currentRound: cappedNewRound },
        });

        memoizedDispatch({
          type: "SYNC_STATE_FROM_SOCKET",
          payload: {
            squares: Array(state.boardSize * state.boardSize).fill(null),
            xIsNext: true,
            gameOver: false,
            winningLine: winningLine || [],
          },
        });

        memoizedSetRoundResults((prev) => {
          if (prev.some((r) => r.round === cappedNewRound - 1)) return prev;
          const newResults = [
            ...prev,
            {
              winner: winnerResult || null,
              round: cappedNewRound - 1,
              reason,
              isDraw,
            },
          ];
          // Save roundResults to localStorage
          if (roomId) {
            localStorage.setItem(`roundResults_${roomId}`, JSON.stringify(newResults));
          }
          return newResults;
        });

        if (isDraw || reason === "Time Over") {
          setDisplaySquares(null);
          setDisplayRound(cappedNewRound);
          setTransitionKey((prev) => prev + 1);
        }
      } catch (error) {
        setErrorMessage("Error processing round end");
        setTimeout(() => setErrorMessage(null), 1500);
      }
    };

    const handleGameOver = async ({ results, board, winningLine, roundResult, stats }) => {
      try {
        // Deduplicate game-over
        if (gameOverProcessed.current) {
          return;
        }
        gameOverProcessed.current = true;
    
        const normalizedResults = results.map((result) => ({
          winner: result.winner || null,
          round: result.round,
          reason: result.reason,
          isDraw: result.draw || false,
        }));

        // Save roundResults to localStorage
        if (roomId) {
          localStorage.setItem(`roundResults_${roomId}`, JSON.stringify(normalizedResults));
        }
    
        const isDraw = roundResult.includes("Draw");
        const isTimeOver = roundResult.includes("Time Over") || results[results.length - 1]?.reason === "Time Over";
    
        // Base state updates
        const basePayload = {
          squares: board,
          winningLine: winningLine || [],
          gameOver: true,
          isGameFinished: true,
          currentRound: results.length,
        };
    
        if (!isDraw && (winningLine?.length > 0 || isTimeOver)) {
          setDisplaySquares(board);
          setDisplayRound(totalRounds);
          memoizedDispatch({
            type: "SYNC_STATE_FROM_SOCKET",
            payload: basePayload,
          });
    
          setTimeout(() => {
            memoizedDispatch({
              type: "SYNC_STATE_FROM_SOCKET",
              payload: {
                ...basePayload,
                squares: Array(state.boardSize * state.boardSize).fill(null),
                winningLine: [],
              },
            });
            setDisplaySquares(null);
            setIsGameFinished(true);
            memoizedSetRoundResults(normalizedResults);
            memoizedOnGameEnd();
          }, 1500);
        } else {
          setDisplaySquares(null);
          setDisplayRound(totalRounds);
          memoizedDispatch({
            type: "SYNC_STATE_FROM_SOCKET",
            payload: {
              ...basePayload,
              squares: Array(state.boardSize * state.boardSize).fill(null),
              winningLine: [],
            },
          });
          setIsGameFinished(true);
          memoizedSetRoundResults(normalizedResults);
          memoizedOnGameEnd();
        }
      } catch (error) {
        setErrorMessage("Error processing game over");
        setTimeout(() => setErrorMessage(null), 1500);
      }
    };

    const handleReconnectSuccess = ({ gameState }) => {
      memoizedDispatch({
        type: "RESTORE_STATE",
        payload: {
          mySymbol: gameState.mySymbol,
          isHost: gameState.isHost,
          playerX: gameState.playerX,
          playerO: gameState.playerO,
          squares: gameState.squares,
          xIsNext: gameState.xIsNext,
          currentRound: gameState.currentRound,
          gameOver: gameState.gameOver,
          isGameFinished: gameState.isGameFinished,
          winningLine: gameState.winningLine || [],
          config: gameState.config,
        },
      });
    };

    const handleRoomNotFound = () => {
      if (roomId) {
        localStorage.removeItem(`gameState_${roomId}`);
      }
      navigate("/home");
    };


    const handleInvalidMove = ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 1500);
    };

    const handleError = ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 1500);
    };

    socket.on("updateBoard", handleUpdateBoard);
    socket.on("round-ended", handleRoundEnded);
    socket.on("game-over", handleGameOver);
    socket.on("reconnect-success", handleReconnectSuccess);
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("invalid-move", handleInvalidMove);
    socket.on("error", handleError);

    return () => {
      console.log("Cleaning up socket listeners for socket", socket.id);
      socket.off("updateBoard", handleUpdateBoard);
      socket.off("round-ended", handleRoundEnded);
      socket.off("game-over", handleGameOver);
      socket.off("reconnect-success", handleReconnectSuccess);
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("invalid-move", handleInvalidMove);
      socket.off("error", handleError);
    };
  }, [socket, connected, memoizedDispatch, memoizedSetRoundResults, memoizedOnGameEnd, roomId, user, totalRounds, state.boardSize, navigate, playerX, playerO]);

  const handleSquareClick = useCallback(
    (index) => {

      if (!connected) {
        setErrorMessage("Disconnected from server. Reconnecting...");
        setTimeout(() => setErrorMessage(null), 1500);
        return;
      }

      if (isGameFinished || state.gameOver || state.currentRound > totalRounds) {
        setErrorMessage("Game is over");
        setTimeout(() => setErrorMessage(null), 1500);
        return;
      }
      if (!state.mySymbol) {
        setErrorMessage("Symbol not assigned");
        setTimeout(() => setErrorMessage(null), 1500);
        return;
      }
      if (state.squares[index] || state.gameOver) {
        return;
      }
      socket.emit("playerMove", { roomId, index, symbol: state.mySymbol });
    },
    [state.squares, state.mySymbol, state.gameOver, roomId, socket, connected, user, isGameFinished, totalRounds]
  );

  // Update gridWidth and boardWidth on resize
  useEffect(() => {
    const updateWidths = () => {
      if (boardRef.current) {
        const boardWidth = boardRef.current.offsetWidth;
        setBoardWidth(boardWidth);
      }
    };

    updateWidths();

    const resizeObserver = new ResizeObserver(updateWidths);
    if (boardRef.current) {
      resizeObserver.observe(boardRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [state.boardSize, setBoardWidth]);

  // Memoize props for GameGrid to prevent re-renders
  const memoizedSquares = useMemo(
    () => (state.winningLine?.length > 0 && displaySquares ? displaySquares : state.squares),
    [state.squares, state.winningLine, displaySquares]
  );
  const memoizedWinningLine = useMemo(() => state.winningLine || [], [state.winningLine]);

  // Conditional gap class for GameGrid based on board size
  const gridGapClass = state.boardSize >= 10 ? "gap-0.2 sm:gap-1" : "gap-1 sm:gap-2";

  // Determine if we should split timers (for boards <= 7)
  const splitTimers = state.boardSize <= 7;

  return (
    <div ref={boardRef}
    className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white bg-opacity-80 p-0 sm:p-4 sm:backdrop-blur-sm sm:rounded-lg sm:min-h-[50vh] w-full sm:w-fit !mx-auto transform-none">
      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-red-500/90 text-white font-medium px-6 py-3 rounded-md shadow-lg animate-pulse">
            {errorMessage}
          </div>
        </div>
      )}
      {socketLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-700 text-lg font-semibold">Reconnecting to server...</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-[calc(90vw)] min-w-[calc(min(8vw,3rem)*3+2px*2)] mx-auto rounded-md text-center">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {totalRounds > 1 && (
            <div className="text-lg font-semibold transition-all duration-300">
              Round {displayRound} of {totalRounds}
            </div>
          )}
          {/* Render Player X timer above for boards <= 7, or both timers for boards >= 8 */}
          <TimerManager
            state={state}
            timer={timer}
            setTimer={setTimer}
            playerX={playerX}
            playerO={playerO}
            currentRound={state.currentRound}
            totalRounds={totalRounds}
            boardSize={state.boardSize}
            showPlayer={splitTimers ? "X" : "both"}
          />
        </div>
      </div>
      <div className="w-full max-w-[calc(90vw)] mx-auto flex justify-center items-center p-0 sm:p-4">
          <GameGrid
            squares={memoizedSquares}
            onSquareClick={handleSquareClick}
            boardSize={state.boardSize}
            winningLine={memoizedWinningLine}
            gameOver={state.gameOver}
            isGameFinished={isGameFinished}
            transitionKey={transitionKey}
            gapClass={gridGapClass}
          />
      </div>
      {/* Render Player O timer below for boards <= 7 */}
      {splitTimers && (
        <div className="w-full max-w-[calc(90vw-4px)] mx-auto rounded-md p-0 text-center">
          <TimerManager
            state={state}
            timer={timer}
            setTimer={setTimer}
            playerX={playerX}
            playerO={playerO}
            currentRound={state.currentRound}
            totalRounds={totalRounds}
            boardSize={state.boardSize}
            showPlayer="O"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(Board);
