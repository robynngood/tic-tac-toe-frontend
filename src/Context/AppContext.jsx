import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./path/api";

export const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
  if (!context) {
    
  }
  return context;
}

export const AppProvider = ({children}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Track and store last visited route
  useEffect(() => {
    const currentRoute = location.pathname + location.search;
    localStorage.setItem("lastRoute", currentRoute);
  }, [location]);


    // Function to fetch user with JWT Token
    const fetchUser = async(token) => {
        setLoading(true);
        try {
            const res = await api.get('/auth/user', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if(res.data.isAuthenticated && res.data.user) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("token", token);
                // Navigate to last route or /home
        const lastRoute = localStorage.getItem("lastRoute") || "/home";
        navigate(lastRoute);
            } else {
                handleLogout()   // token invalid or expired
            }
        } catch(err) {
            handleLogout();   // fallback on any error
        } finally {
            setLoading(false);
        }
    }

    // Handle logout (clear local storage and user state)
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("lastRoute");
        setUser(null);
        navigate("/")
    }

    // Handle auth from token in url or stored token
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");

        const storedToken = localStorage.getItem("token");

        if(tokenFromUrl) {
            urlParams.delete("token");
            window.history.replaceState({}, "", `${window.location.pathname}`);
            fetchUser(tokenFromUrl);
        } else if(storedToken && !user) {
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, [])

    const ProviderValue = {
        user,
        setUser,
        loading,
        logout : handleLogout
    }

    return (
        <AppContext.Provider value={ProviderValue}>
            {loading ? (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full flex items-center justify-center space-x-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-gray-700 text-lg font-semibold">Loading...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AppContext.Provider>
    )
}