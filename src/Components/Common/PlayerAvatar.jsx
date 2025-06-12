import React, { useState, useEffect } from "react";

// In-memory cache for avatar URLs
const avatarCache = new Map();

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 3).map(word => word[0].toUpperCase()).join("");
};

const PlayerAvatar = ({ name = "", userId = "", className = "" }) => {
  const initials = getInitials(name);
  const [loadFailed, setLoadFailed] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoadFailed(true);
      return;
    }

    // Check cache first
    const cachedSrc = avatarCache.get(userId);
    if (cachedSrc) {
      setImageSrc(cachedSrc);
      return;
    }

    let objectUrl = null;

    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadFailed(true);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API}/api/user/${userId}/avatar`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "image/*",
          },
        });

        if (!response.ok) {
          setLoadFailed(true);
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        // Cache the image URL
        avatarCache.set(userId, objectUrl);
      } catch (error) {
        setLoadFailed(true);
      }
    };

    fetchImage();

    return () => {
      // Only revoke object URL if not cached (avoid revoking shared URLs)
      if (objectUrl && !avatarCache.has(userId)) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId]); // Removed 'name' from dependencies

  if (loadFailed || !userId) {
    return (
      <div
        className={`rounded-full flex items-center justify-center text-white font-semibold shadow-md ${className}`}
        style={{
          backgroundColor: "#000",
          fontSize: "calc(175%)",
        }}
      >
        {initials}
      </div>
    );
  }

  return imageSrc ? (
    <img
      src={imageSrc}
      alt={name}
      className={`rounded-full object-cover border-2 border-white shadow-md ${className}`}
      onError={() => {
        setLoadFailed(true);
        avatarCache.delete(userId); // Clear cache on error
      }}
      loading="lazy"
    />
  ) : (
    <div
        className={`rounded-full flex items-center justify-center text-white font-semibold shadow-md ${className}`}
        style={{
          backgroundColor: "#000",
          fontSize: "calc(175%)",
        }}
      >
        {initials}
      </div>
  );
};

export default PlayerAvatar;