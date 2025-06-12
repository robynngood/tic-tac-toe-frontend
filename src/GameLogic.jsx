//function to generate available lineLength options based on board size
export const getAvailableLineLengths = (boardSize) => {
        if(boardSize === 3) {
            return [3];   // only allows 3-line game on 3 * 3 board
        } else if(boardSize === 4) {
            return [4];
        } else if(boardSize === 5) {
            return [4, 5]
        } else if(boardSize >= 6) {
            return [4, 5, 6]
        }
    }

export const getValidLineLength = (boardSize, lineLengthFromURL) => {
    const available = getAvailableLineLengths(boardSize);
    const requested = parseInt(lineLengthFromURL);

    if (available.includes(requested)) {
        return requested;
    }
    return available[0]; // default fallback
}

export const generateRoomId = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
};


export const formatName = (name = "") => {
    const firstName = name.split(" ")[0];
    return firstName.length > 9 ? firstName.slice(0, 9) : firstName;
};
