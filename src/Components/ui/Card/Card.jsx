import React from "react"

const Card = ({ children, className="", onClick, ...props }) => {
    return (
        <div 
        {...props}
        onClick={onClick}
        className={`shadow-lg rounded-2xl p-4 ${className}`}>
            {children}
        </div>
    )
}

export default Card;