import React, { useEffect, useMemo, useState } from "react";
import TimerDisplay from "./TimerDisplay";
import { useSocket } from "../../Context/SocketContext";

const TimerManager = ({ state, timer, setTimer, playerX, playerO, currentRound, totalRounds, boardSize, showPlayer }) => {
  const { socket } = useSocket();
  const [isPaused, setIsPaused] = useState(false);

  // Pause timer during winningLine display
  useEffect(() => {
    if (state.winningLine?.length > 0 && !state.isGameFinished) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [state.winningLine, state.isGameFinished]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Stop timer if game is over or rounds exceed totalRounds
    if (state.gameOver || state.isGameFinished || currentRound > totalRounds) {
      setTimer(null);
      return;
    }

    const handleTimerUpdate = ({ roomId, timeLeft, currentTurn }) => {
      if (isPaused) {
        return;
      }
      setTimer(timeLeft);
    };

    socket.on("updateTimer", handleTimerUpdate);

    return () => {
      socket.off("updateTimer", handleTimerUpdate);
    };
  }, [socket, setTimer, isPaused, state.gameOver, state.isGameFinished, currentRound, totalRounds]);

  const timerProps = useMemo(
    () => ({
      timer: state.config.timerDuration ? timer : null, // Show null if no timer
      xIsNext: state.xIsNext,
      playerX,
      playerO,
      boardSize,
      showPlayer,
    }),
    [timer, state.xIsNext, playerX, playerO, state.config.timerDuration, boardSize, showPlayer]
  );

  return <TimerDisplay {...timerProps} />;
};

export default TimerManager;
