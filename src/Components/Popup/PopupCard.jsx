import React from "react";

const PopupCard = ({ children, className }) => {
  return (
    <div className={`text-center shadow-xl rounded-lg pointer-events-auto ${className}`}>
      {children}
    </div>
  );
};

export default PopupCard;