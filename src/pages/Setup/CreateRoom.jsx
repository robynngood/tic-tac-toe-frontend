import React, { useState, useEffect } from "react";
import { useSocket } from "../../Context/SocketContext";
import { useAppContext } from "../../Context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoomInfoPopup from "../../Components/Popup/RoomInfoPopup";
import { generateRoomId } from "../../GameLogic";

const CreateRoom = () => {
  const { socket, connected } = useSocket();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  const [roomId] = useState(() => {
    const activeRoomId = localStorage.getItem("activeRoomId");
    if (activeRoomId && user) {
      const savedRoom = localStorage.getItem(`room_${activeRoomId}`);
      if (savedRoom) {
        try {
          const parsed = JSON.parse(savedRoom);
          if (parsed.isHost && parsed.playerX.id === user._id) {
            return activeRoomId;
          }
        } catch (error) {
          setError("CreateRoom: Failed to parse active room")
        }
      }
    }
    const newRoomId = generateRoomId();
    return newRoomId;
  });

  const [showPopup, setShowPopup] = useState(false);
  const [playerX, setPlayerX] = useState(
    user ? { ...user, id: user._id } : null
  );
  const [playerO, setPlayerO] = useState(null);
  const [socketLoading, setSocketLoading] = useState(!connected);
  const [mySymbol, setMySymbol] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (!socket) {
      setError("Cannot connect to server. Please try again.");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    // Update socket loading state
    setSocketLoading(!connected);

    // Check if room exists in localStorage
    let isNewRoom = true;
    const savedRoom = localStorage.getItem(`room_${roomId}`);
    if (savedRoom) {
      try {
        const parsed = JSON.parse(savedRoom);
        if (parsed.roomId === roomId && parsed.isHost && parsed.playerX.id === user._id) {
          isNewRoom = false;
          setMySymbol(parsed.mySymbol || "X"); // Added: Restore mySymbol
          setPlayerX(parsed.playerX);
          setPlayerO(parsed.playerO || null);
          if (connected) {
            socket.emit("reconnect", { roomId, userId: user._id });
          } else {
            socket.on("connect", () => {
              socket.emit("reconnect", { roomId, userId: user._id });
            });
          }
        }
      } catch (error) {
        localStorage.removeItem(`room_${roomId}`);
      }
    }

    const board = parseInt(searchParams.get("board"));
    const line = parseInt(searchParams.get("line"));
    const rounds = parseInt(searchParams.get("rounds"));
    const timer =
      searchParams.get("timer") === "none"
        ? null
        : parseInt(searchParams.get("timer"));

    const validTimers = [10, 30, null];
    if (!board || !line || !rounds || !validTimers.includes(timer)) {
      setTimeout(() => navigate("/home"), 2000);
      return;
    }

    if (isNewRoom && connected) {
      // Save config to localStorage for recovery
      localStorage.setItem(
        "lastRoomConfig",
        JSON.stringify({ board, line, rounds, timerDuration: timer })
      );
      socket.emit("create-room", {
        roomId,
        user: { _id: user._id, name: user.name, avatar: user.avatar },
        config: {
          boardSize: board,
          lineLength: line,
          rounds,
          timerDuration: timer,
        },
      });
    } else if (isNewRoom && !connected) {
      socket.on("connect", () => {
        socket.emit("create-room", {
          roomId,
          user: { _id: user._id, name: user.name, avatar: user.avatar },
          config: {
            boardSize: board,
            lineLength: line,
            rounds,
            timerDuration: timer,
          },
        });
      });
    }

    // show popup with host info(waiting for players)
    setShowPopup(true);

    const handleHostJoined = ({ host }) => {
      setPlayerX(host); // Use backend data directly
      setMySymbol("X");

      // Save room data to localStorage
      const roomData = {
        roomId,
        isHost: true,
        mySymbol: "X",
        playerX: host,
        config: { board, line, rounds, timerDuration: timer },
      };
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
      localStorage.setItem("activeRoomId", roomId);
    };

    const handleAssignSymbol = ({ symbol: receivedSymbol }) => {
      setMySymbol(receivedSymbol);
    };

    // Step 2: Listen for both players joining
    const handleBothPlayersJoined = ({ playerX: newPlayerX, playerO }) => {
      setPlayerX(newPlayerX); // Use backend data directly
      setPlayerO(playerO);
      // Update localStorage with playerO
      const roomData = JSON.parse(localStorage.getItem(`room_${roomId}`)) || {};
      roomData.playerO = playerO;
      roomData.mySymbol = mySymbol || "X";
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
    };

    // Step 3: Navigate when host clicks "Start Game"
    const handleStartGame = ({ roomId, config, playerX: serverPlayerX, playerO }) => {
      if (!config || !serverPlayerX || !playerO || !config.board || !config.line || !config.rounds) {
        setError("Failed to start game.");
        setTimeout(() => navigate("/home"), 2000);
        return;
      }

      navigate(
        `/game?mode=friend&roomId=${roomId}&board=${config.board}&line=${
          config.line
        }&rounds=${config.rounds}&timer=${config.timerDuration || "none"}`,
        {
          state: {
            roomId,
            isHost: true, // ✅ YOU are the host if you created the room
            playerX: serverPlayerX,
            playerO: playerO,
            boardSize: config.board,
            lineLength: config.line,
            rounds: config.rounds,
            timerDuration: config.timerDuration,
            mySymbol: mySymbol || "X",
          },
        }
      );
    };

    const handleReconnectSuccess = ({ gameState }) => {
      setMySymbol(gameState.mySymbol || "X");
      setPlayerX(gameState.playerX);
      setPlayerO(gameState.playerO || null);
      // Update localStorage
      const roomData = {
        roomId,
        isHost: gameState.isHost,
        mySymbol: gameState.mySymbol || "X",
        playerX: gameState.playerX,
        playerO: gameState.playerO || null,
        config: gameState.config,
      };
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
      localStorage.setItem("activeRoomId", roomId);
    };

    const handleRoomNotFound = () => {
      setError("Room expired, recreating...");
      localStorage.removeItem(`room_${roomId}`);
      localStorage.removeItem("activeRoomId");
      const lastConfig =
        JSON.parse(localStorage.getItem("lastRoomConfig")) || {};
      setTimeout(
        () =>
          navigate(
            `/create-room?board=${lastConfig.board || 3}&line=${
              lastConfig.line || 3
            }&rounds=${lastConfig.rounds || 1}&timer=${
              lastConfig.timerDuration || "none"
            }`
          ),
        2000
      );
    };

    const handleError = ({ message }) => {
      if (message === "Failed to reconnect") {
        localStorage.removeItem(`room_${roomId}`);
        localStorage.removeItem("activeRoomId");
      }
      setError(message);
      setTimeout(() => navigate("/home"), 2000);
    };

    socket.on("host-joined", handleHostJoined);
    socket.on("assign-symbol", handleAssignSymbol);
    socket.on("both-players-joined", handleBothPlayersJoined);
    socket.on("game-started", handleStartGame);
    socket.on("reconnect-success", handleReconnectSuccess); // Added: Listener
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("error", handleError);

    return () => {
      socket.off("host-joined", handleHostJoined);
      socket.off("assign-symbol", handleAssignSymbol);
      socket.off("both-players-joined", handleBothPlayersJoined);
      socket.off("game-started", handleStartGame);
      socket.off("reconnect-success", handleReconnectSuccess); // Added: Cleanup
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("error", handleError);
      socket.off("connect");
    };
  }, [socket, user, navigate, searchParams, roomId, connected]);

  return (
    <>
      {error ? (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : socketLoading ? (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-700 text-lg font-semibold">
              Connecting to server...
            </p>
          </div>
        </div>
      ) : (
        showPopup && (
          <RoomInfoPopup roomId={roomId} playerX={playerX} playerO={playerO} />
        )
      )}
    </>
  );
};

export default CreateRoom;
