import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { GameProvider } from "../Context/Context";
import Board from "../Components/Board/Board";
import FinalResult from "./Helper/FinalResult";
import MatchSummary from "../Components/Board/MatchSummary";
import { getValidLineLength } from "../GameLogic";
import { useGameContext } from "../Context/Context";
import { useSocket } from "../Context/SocketContext";
import { useAppContext } from "../Context/AppContext";


const GamePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const boardSize = Math.max(3, Math.min(11, Number(searchParams.get("board")) || 3)); // Validate: 3–11
  const lineLengthParam = searchParams.get("line");
  const lineLength = getValidLineLength(boardSize, lineLengthParam);
  const totalRounds = Math.max(1, parseInt(searchParams.get("rounds")) || 1); // Validate: >=1
  const roomId = searchParams.get("roomId") || null;
  const timerDuration = searchParams.get("timer") === "none" ? null : parseInt(searchParams.get("timer"));

  // Save location.state to localStorage on navigation
  useEffect(() => {
    if (location.state && roomId) {
      localStorage.setItem(`gameState_${roomId}`, JSON.stringify({
        mySymbol: location.state.mySymbol,
        isHost: location.state.isHost,
        playerX: location.state.playerX,
        playerO: location.state.playerO,
      }));
    }
  }, [location.state, roomId]);

  // Restore state from localStorage or use defaults
  const restoredState = useMemo(() => {
    if (!location.state && roomId) {
      const savedState = localStorage.getItem(`gameState_${roomId}`);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          return {
            mySymbol: parsedState.mySymbol,
            isHost: parsedState.isHost,
            playerX: parsedState.playerX,
            playerO: parsedState.playerO,
            isGameFinished: parsedState.isGameFinished || false, // Restore isGameFinished
          };
        } catch (error) {
          
        }
      }
    }
    return location.state || {};
  }, [location.state, roomId]);


  const initialState = useMemo(
    () => ({
      squares: Array(boardSize * boardSize).fill(null),
    xIsNext: true,
    boardSize,
    lineLength,
    winningLine: [],
    mySymbol: restoredState.mySymbol || null,
    roomId,
    isHost: restoredState.isHost || false,
    config: { timerDuration },
    currentRound: 1,
    gameOver: false,
    isGameFinished: restoredState.isGameFinished || false,
    playerX: restoredState.playerX || { name: "Unknown", id: null, symbol: "X" },
    playerO: restoredState.playerO || { name: "Unknown", id: null, symbol: "O" },
    }),
    [boardSize, lineLength, roomId, timerDuration, restoredState]
  );

  return (
    <GameProvider initialState={initialState}>
      <InnerGamePage
        totalRounds={totalRounds}
        navigate={navigate}
        locationState={restoredState}
        roomId={roomId}
      />
    </GameProvider>
  );
};

const InnerGamePage = ({ totalRounds, navigate, locationState, roomId }) => {
  const { dispatch, state } = useGameContext();
  const { socket, connected } = useSocket();
  const { user } = useAppContext();

  const [playerXwins, setPlayerXWins] = useState(0);
  const [playerOWins, setPlayerOWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [showFinal, setShowFinal] = useState(locationState.isGameFinished || false);
  const [roundResults, setRoundResults] = useState(() => {
    // Restore roundResults from localStorage on mount
    if (roomId) {
      const savedRoundResults = localStorage.getItem(`roundResults_${roomId}`);
      if (savedRoundResults) {
        try {
          return JSON.parse(savedRoundResults) || [];
        } catch (error) {
          
        }
      }
    }
    return [];
  });
  const [boardWidth, setBoardWidth] = useState(null);

  // Set showFinal based on state.isGameFinished or locationState.isGameFinished
  useEffect(() => {
    if (state.isGameFinished || locationState.isGameFinished) {
      setShowFinal(true);
    }
  }, [state.isGameFinished, locationState.isGameFinished]);
  

  useEffect(() => {
    if (!user || !user._id) {
      // Added: Check if user._id is available
      navigate("/home");
      return;
    }

    // Added: Function to emit reconnect with userId
    const emitReconnect = () => {
      socket.emit("reconnect", { roomId, userId: user._id }); // Added: Include userId
    };

    // Added: Handle error events for reconnect
    const handleError = ({ message, retry }) => {
      if (message === "Missing user ID, please retry" && retry) {
        setTimeout(emitReconnect, 1000); // Retry after 1s
      } else {
        localStorage.removeItem(`gameState_${roomId}`);
        navigate("/home");
      }
    };


    if (socket && roomId && connected) {
      // Modified: Emit reconnect with userId if connected
      emitReconnect();
    } else if (socket && roomId && !connected) {
      // Modified: Emit reconnect with userId on connect
      socket.on("connect", () => {
        emitReconnect();
      });
    }


    if (socket) {
      const handleReconnectSuccess = ({ gameState }) => {
        dispatch({
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
        localStorage.setItem(
          `gameState_${roomId}`,
          JSON.stringify({
            mySymbol: gameState.mySymbol,
            isHost: gameState.isHost,
            playerX: gameState.playerX,
            playerO: gameState.playerO,
          })
        );
      };

      socket.on("reconnect-success", handleReconnectSuccess);
      socket.on("room-not-found", () => {
        localStorage.removeItem(`gameState_${roomId}`);
        navigate("/home");
      });
      socket.on("error", handleError)

      return () => {
        socket.off("reconnect-success", handleReconnectSuccess);
        socket.off("room-not-found");
        socket.off("error", handleError); // Added: Cleanup error listener
        socket.off("connect");
      };
    }
  }, [socket, connected, roomId, navigate, dispatch, user]);


  useEffect(() => {
    if (locationState?.mySymbol) {
      dispatch({ type: "SET_SYMBOL", payload: locationState.mySymbol });
    }
  }, [dispatch, locationState]);

  // Sync playerXWins, playerOWins, and draws with roundResults when showFinal is true
  useEffect(() => {
    if (showFinal) {
      const xWins = roundResults.filter((r) => r.winner === "X").length;
      const oWins = roundResults.filter((r) => r.winner === "O").length;
      const drawCount = roundResults.filter((r) => r.winner === null || r.isDraw).length;
      setPlayerXWins(xWins);
      setPlayerOWins(oWins);
      setDraws(drawCount);
    }
  }, [showFinal, roundResults]);

  const handleGameEnd = useCallback(() => setShowFinal(true), []);
  const memoizedSetBoardWidth = useCallback((width) => setBoardWidth(width), []);
  const memoizedSetRoundResults = useCallback((results) => setRoundResults(results), []);

  return (
    <div className="relative min-h-screen bg-gray-100 py-4 px-[2px] sm:py-6 sm:px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[90vw] sm:max-w-3xl flex flex-col items-center">
      <MatchSummary
          roundResults={roundResults}
          boardWidth={boardWidth}
          playerX={locationState.playerX || { name: "Unknown", id: null, symbol: "X" }}
          playerO={locationState.playerO || { name: "Unknown", id: null, symbol: "O" }}
        />
        <Board
          totalRounds={totalRounds}
          setBoardWidth={memoizedSetBoardWidth}
          setRoundResults={memoizedSetRoundResults}
          onGameEnd={handleGameEnd}
          roomId={roomId}
          playerX={locationState.playerX || { name: "Unknown", id: null, symbol: "X" }}
          playerO={locationState.playerO || { name: "Unknown", id: null, symbol: "O" }}
        />
        {showFinal && (
          <FinalResult
            playerXWins={playerXwins}
            playerOWins={playerOWins}
            draws={draws}
            navigate={navigate}
            playerX={locationState.playerX || { name: "Unknown", id: null, symbol: "X" }}
            playerO={locationState.playerO || { name: "Unknown", id: null, symbol: "O" }}
          />
        )}
      </div>
    </div>
  );
};

export default GamePage;
