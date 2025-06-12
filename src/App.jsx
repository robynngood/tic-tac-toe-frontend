import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/AppContext";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import ConfigPage from "./pages/ConfigPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile/Profile";
import CreateRoom from "./pages/Setup/CreateRoom";
import JoinRoom from "./pages/Setup/JoinRoom";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import "./App.css";

function App() {

  return (
    <BrowserRouter>
      <AppProvider>
        <div>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/create-room" element={<CreateRoom />} />
              <Route path="/join-room" element={<JoinRoom />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
