import React, { useState, useEffect } from "react";
import PopupCard from "./PopupCard";

const JoinRoomPopup = ({ onJoin, onClose }) => {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState(null);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError("Please enter a valid Room ID");
      return;
    }
    setError(null);
    onJoin(roomId.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[50]">
      <PopupCard
        className="w-full max-w-[22rem] sm:max-w-[20rem] md:max-w-md lg:max-w-lg m-[2vw] sm:m-[3vw] p-4 sm:p-6 md:p-8 space-y-2 sm:space-y-3 md:space-y-4 backdrop-blur-lg bg-amber-50/80 border border-amber-200/50 rounded-xl shadow-lg"
      >
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black text-center">
          Join Room
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
          <div>
            <label className="block mb-1 font-medium text-xs sm:text-sm md:text-base text-black">
              Room ID
            </label>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full border border-amber-200/80 p-1 sm:p-1.5 md:p-2 rounded text-xs sm:text-sm md:text-base bg-amber-50/50 text-black focus:outline-none focus:border-amber-300"
            />
            {error && <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-1 sm:py-1.5 md:py-2 rounded hover:from-green-600 hover:to-green-700 transition text-xs sm:text-sm md:text-base"
            >
              Join
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-1 sm:py-1.5 md:py-2 rounded hover:from-gray-600 hover:to-gray-700 transition text-xs sm:text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </PopupCard>
    </div>
  );
};

export default JoinRoomPopup;