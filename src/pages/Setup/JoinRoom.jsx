import { useEffect, useState, useRef, useMemo } from "react";
import { useSocket } from "../../Context/SocketContext";
import { useAppContext } from "../../Context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import PopupCard from "../../Components/Popup/PopupCard";
import RoomInfoPopup from "../../Components/Popup/RoomInfoPopup";

const JoinRoom = () => {
  const { socket, connected } = useSocket();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [socketLoading, setSocketLoading] = useState(!connected);

  const [playerX, setPlayerX] = useState(null);
  const [playerO, setPlayerO] = useState(null); // this is the current user
  const [roomId, setRoomId] = useState(null);
  const [mySymbol, setMySymbol] = useState(null);

  const hasJoinedRef = useRef(false); // Prevent duplicate join-room emissions
  const reconnectTimeoutRef = useRef(null);
  const roomIdFromURL = useMemo(
    () => searchParams.get("roomId"),
    [searchParams]
  );

  useEffect(() => {
    setSocketLoading(!connected);
  }, [connected]);

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

    if (!roomIdFromURL) {
      setError("Missing Room Id");
      setTimeout(() => navigate("/home"), 2000);
      return;
    }

    // Check localStorage for existing room
    const savedRoom = localStorage.getItem(`room_${roomIdFromURL}`);

    if (savedRoom && !hasJoinedRef.current) {
      try {
        const parsed = JSON.parse(savedRoom);
        if (parsed.roomId === roomIdFromURL && !parsed.isHost) {
          setMySymbol(parsed.mySymbol || "O"); // Added: Restore mySymbol
          setPlayerX(parsed.playerX);
          setPlayerO(parsed.playerO);
          setRoomId(parsed.roomId);
          socket.emit("reconnect", { roomId: roomIdFromURL, userId: user._id });
          reconnectTimeoutRef.current = setTimeout(() => {
            setError("Failed to reconnect to room.");
            navigate("/home");
          }, 5000);
        }
      } catch (error) {
        localStorage.removeItem(`room_${roomIdFromURL}`);
      }
    }

    if (!savedRoom && !hasJoinedRef.current && connected) {
      socket.emit("join-room", {
        roomId: roomIdFromURL,
        user: { _id: user._id, name: user.name, avatar: user.avatar },
      });
      hasJoinedRef.current = true;
    } else if (!savedRoom && !hasJoinedRef.current && !connected) {
      socket.on("connect", () => {
        socket.emit("join-room", {
          roomId: roomIdFromURL,
          user: { _id: user._id, name: user.name, avatar: user.avatar },
        });
        hasJoinedRef.current = true;
      });
    }

    const handleRoomFull = () => {
      setError("Room is full, attempting to reconnect...");
      reconnectTimeoutRef.current = setTimeout(() => {
        setError("Failed to reconnect to room.");
        navigate("/home");
      }, 5000);
    };

    const handleAssignSymbol = ({ symbol: receivedSymbol }) => {
      setMySymbol(receivedSymbol);
    };

    const handleJoinSuccess = ({ playerX, playerO, roomId }) => {
      setPlayerX(playerX);
      setPlayerO(playerO);
      setRoomId(roomId);
      setMySymbol(mySymbol || "O");
      clearTimeout(reconnectTimeoutRef.current);
      // Save room data to localStorage
      const roomData = {
        roomId,
        isHost: false,
        mySymbol: mySymbol || "O",
        playerX,
        playerO,
        config: {
          board: playerX.config?.board,
          line: playerX.config?.line,
          rounds: playerX.config?.rounds,
          timerDuration: playerX.config?.timerDuration,
        },
      };
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
      localStorage.setItem("activeRoomId", roomId);
    };

    const handleBothPlayersJoined = ({ playerX, playerO, roomId, config }) => {
      setPlayerX(playerX);
      setPlayerO(playerO);
      setRoomId(roomId);
      setMySymbol(mySymbol || "O");
      clearTimeout(reconnectTimeoutRef.current);
      // Save room data to localStorage
      const roomData = {
        roomId,
        isHost: false,
        mySymbol: mySymbol || "O",
        playerX,
        playerO,
        config: config || { board: 3, line: 3, rounds: 1, timerDuration: null },
      };
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
      localStorage.setItem("activeRoomId", roomId);
    };

    const handleReconnectSuccess = ({ gameState }) => {
      setMySymbol(gameState.mySymbol || "O");
      setPlayerX(gameState.playerX);
      setPlayerO(gameState.playerO);
      setRoomId(gameState.roomId);
      clearTimeout(reconnectTimeoutRef.current);
      // Update localStorage
      const roomData = {
        roomId: gameState.roomId,
        isHost: gameState.isHost,
        mySymbol: gameState.mySymbol || "O",
        playerX: gameState.playerX,
        playerO: gameState.playerO,
        config: gameState.config,
      };
      localStorage.setItem(`room_${roomIdFromURL}`, JSON.stringify(roomData));
      localStorage.setItem("activeRoomId", gameState.roomId);
    };

    const handleGameStarted = ({ roomId, config, playerX, playerO }) => {
      clearTimeout(reconnectTimeoutRef.current);
      if (!config || !playerX || !playerO) {
        setError("Failed to start game.");
        setTimeout(() => navigate("/home"), 2000);
        return;
      }

      const { board, line, rounds, timerDuration } = config;

      navigate(
        `/game?mode=friend&roomId=${roomId}&board=${board}&line=${line}&rounds=${rounds}&timer=${
          timerDuration || "none"
        }`,
        {
          state: {
            roomId,
            isHost: false, // ✅ YOU are not the host, you're joining someone else's room
            playerX: { ...playerX, symbol: playerX.symbol },
            playerO: { ...playerO, symbol: playerO.symbol },
            boardSize: board,
            lineLength: line,
            rounds,
            timerDuration,
            mySymbol: mySymbol || "O",
          },
        }
      );
    };

    const handleRoomNotFound = () => {
      setError("Room not found, please check the room ID.");
      localStorage.removeItem(`room_${roomIdFromURL}`);
      localStorage.setItem("activeRoomId", "");
      clearTimeout(reconnectTimeoutRef.current);
      setTimeout(() => navigate(`/join-room?roomId=${roomIdFromURL}`), 2000);
    };

    socket.on("room-full", handleRoomFull);
    socket.on("assign-symbol", handleAssignSymbol);
    socket.on("join-room-success", handleJoinSuccess);
    socket.on("both-players-joined", handleBothPlayersJoined);
    socket.on("reconnect-success", handleReconnectSuccess);
    socket.on("game-started", handleGameStarted);
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("error", ({ message }) => {
      setError(message);
      clearTimeout(reconnectTimeoutRef.current);
      setTimeout(() => navigate("/home"), 2000);
    });

    return () => {
      socket.off("room-full", handleRoomFull);
      socket.off("assign-symbol", handleAssignSymbol);
      socket.off("join-room-success", handleJoinSuccess);
      socket.off("both-players-joined", handleBothPlayersJoined);
      socket.off("reconnect-success", handleReconnectSuccess);
      socket.off("game-started", handleGameStarted);
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("error");
      clearTimeout(reconnectTimeoutRef.current);
      hasJoinedRef.current = false; // Reset for future mounts
      socket.off("connect");
    };
  }, [socket, user, navigate, searchParams, roomIdFromURL, connected]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {socketLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-700 text-lg font-semibold">Connecting to server...</p>
        </div>
      ) : playerX && playerO ? (
        <RoomInfoPopup playerX={playerX} playerO={playerO} roomId={roomId} />
      ) : (
        <PopupCard className="max-w-sm w-full p-4 sm:p-6">
          {error ? (
            <p className="text-red-600 font-medium text-sm sm:text-base">
              {error}
            </p>
          ) : (
            <p className="text-base font-medium sm:text-lg text-gray-800">
              Attempting to join the room...
            </p>
          )}
        </PopupCard>
      )}
    </div>
  );
};

export default JoinRoom;
