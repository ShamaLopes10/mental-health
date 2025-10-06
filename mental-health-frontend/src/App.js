import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './contexts/authContext';
import { setAuthToken } from "./utils/api";
import { AuthProvider } from "./contexts/authContext";

// Component imports
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Home from "./components/Home";
import Chatbot from "./components/Chatbot";
import VideoArticles from "./components/VideoArticles";
import SupportChat from "./components/SupportChat";
import LandingPage from "./components/LandingPage";
import LogMoodPage from "./pages/LogMoodPage";
import ContentListPage from './pages/ContentListPage';
import ContentDetailPage from './pages/ContentDetailPage';    
import ProfilePage from './pages/ProfilePage';

// CSS
import './App.css';
import './components/Layout/Navbar.css';
import NavBar from "./components/NavBar";
import TasksPage from "./pages/TasksPage";


// Protected Route
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading: authContextLoading } = useAuth();
    if (authContextLoading) return <div>Loading authentication status...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

// Public Route
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading: authContextLoading } = useAuth();
    if (authContextLoading) return <div>Loading session status...</div>;
    return children;
};

function App() {
  const { isAuthenticated, authContextLoading } = useAuth();

  // ✅ Set token AFTER auth state is ready
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      setAuthToken(token);
    }
  }, [isAuthenticated]);

  if (authContextLoading) return <div>Loading app...</div>;

  return (
    <div className="app-container">
      <AuthProvider>
      <NavBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/videoarticles" element={<ProtectedRoute><VideoArticles /></ProtectedRoute>} />
        <Route path="/support-chat" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/log-mood" element={<ProtectedRoute><LogMoodPage /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ContentListPage /></ProtectedRoute>} />
        <Route path="/content/:id" element={<ProtectedRoute><ContentDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/" replace />}
        />
      </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
