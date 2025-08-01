import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom"; // BrowserRouter should be in index.js
import { useAuth } from './contexts/authContext'; // VERIFY THIS PATH! e.g., '../contexts/AuthContext' if App.js is in src/ and AuthContext.js in src/contexts/
// At the top of App.js
import './components/Layout/Navbar.css'; // Adjust path as needed

// Your existing component imports
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Home from "./components/Home";
import Chatbot from "./components/Chatbot";
import VideoArticles from "./components/VideoArticles";
import SupportChat from "./components/SupportChat";
import Tasks from "./components/Tasks";
import LandingPage from "./components/LandingPage";
import LogMoodPage from "./pages/LogMoodPage";
import ContentListPage from './pages/ContentListPage'; // Adjust path if needed
import ContentDetailPage from './pages/ContentDetailPage';    
import ProfilePage from './pages/ProfilePage';


import './App.css'; // Ensure you have some basic styles for the navbar

const ProtectedRoute = ({ children, path }) => { // Added path prop for logging
    const { isAuthenticated, loading } = useAuth();

    // console.log(`ProtectedRoute (${path}): loading=${loading}, isAuthenticated=${isAuthenticated}`); // DEBUG

    if (loading) {
        // console.log(`ProtectedRoute (${path}): Rendering LOADING state`); // DEBUG
        return <div>Loading authentication status... (Protected)</div>;
    }

    if (!isAuthenticated) {
        // console.log(`ProtectedRoute (${path}): NOT AUTHENTICATED, redirecting to /login`); // DEBUG
        return <Navigate to="/login" replace />;
    }

    // console.log(`ProtectedRoute (${path}): AUTHENTICATED, rendering children`); // DEBUG
    return children;
};

const PublicRoute = ({ children, path }) => { // Added path prop for logging
    const { isAuthenticated, loading } = useAuth();

    // console.log(`PublicRoute (${path}): loading=${loading}, isAuthenticated=${isAuthenticated}`); // DEBUG

    if (loading) {
        // console.log(`PublicRoute (${path}): Rendering LOADING state`); // DEBUG
        return <div>Loading session status... (Public)</div>;
    }

    if (isAuthenticated) {
        // console.log(`PublicRoute (${path}): IS AUTHENTICATED, redirecting to /home`); // DEBUG
        return <Navigate to="/home" replace />;
    }

    // console.log(`PublicRoute (${path}): NOT AUTHENTICATED, rendering children`); // DEBUG
    return children;
};


function App() {
  const { isAuthenticated, logout, user, loading: authContextLoading } = useAuth(); // Get auth state and functions
  // console.log('App.js RENDER: authContextLoading=', authContextLoading, 'isAuthenticated=', isAuthenticated, 'User=', user); // DEBUG

  const Navbar = () => (
    <nav className="app-navbar">
      {/* <Link to="/" className="nav-brand">MindScribe</Link> */}
      <div className="nav-links">
        {/* Show links based on auth state, but only after initial loading is complete */}
        {!authContextLoading && isAuthenticated ? (
          <>
          <Link to="/profile">My Profile</Link>
            <Link to="/home">Home</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/videoarticles">Resources</Link>
            <Link to="/chatbot">Chatbot</Link>
           
            <Link to="/log-mood">Log Mood</Link>
            <span className="nav-user-greeting">Hi, {user?.username || 'User'}!</span>
            <button onClick={logout} className="nav-logout-button">Logout</button>
          </>
        ) : !authContextLoading ? ( // Only show Login/Signup if not loading AND not authenticated
              <>
                {/* <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link> */}
              </>
        ) : (
            <span className="nav-links">Loading nav...</span> // Optional: loading indicator for navbar itself
        )}
      </div>
    </nav>
  );

  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute path="/login"><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute path="/signup"><Signup /></PublicRoute>} />

          {/* Protected Routes - only accessible when authenticated */}
          <Route path="/home" element={<ProtectedRoute path="/home"><Home /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute path="/chatbot"><Chatbot /></ProtectedRoute>} />
          <Route path="/videoarticles" element={<ProtectedRoute path="/videoarticles"><VideoArticles /></ProtectedRoute>} />
          <Route path="/support-chat" element={<ProtectedRoute path="/support-chat"><SupportChat /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute path="/tasks"><Tasks /></ProtectedRoute>} />
           <Route path="/log-mood" element={<ProtectedRoute path="/log-mood"><LogMoodPage /></ProtectedRoute>} />
             <Route path="/resources" element={<ProtectedRoute path="/resources"><ContentListPage /></ProtectedRoute>} />
   <Route path="/content/:id" element={<ProtectedRoute path="/content/:id"><ContentDetailPage /></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute path="/profile"><ProfilePage /></ProtectedRoute>} />

          {/* Fallback for unmatched routes */}
          <Route
            path="*"
            element={
              authContextLoading ? (
                <div>Loading app...</div> // Global loading for unmatched paths during auth check
              ) : isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/" replace /> // Or <Navigate to="/login" replace /> if preferred for unknown paths when logged out
              )
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;