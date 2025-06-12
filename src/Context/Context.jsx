import { createContext, useContext, useReducer } from "react";
import { gameReducer} from "../Reducer/Reducer";

const GameContext = createContext();

export const useGameContext = () => {
    const context = useContext(GameContext);
  if (!context) {
    
  }
  return context;
}

export const GameProvider = ({children, initialState}) => {
    const defaultState = { gameOver: false, ...initialState };
    const [state, dispatch] = useReducer(gameReducer, defaultState);

    const ProviderValue = {
        state,
        dispatch,
    }

    return (
        <GameContext.Provider value={ProviderValue}>
            {children}
        </GameContext.Provider>
    )
}

export default GameContext;