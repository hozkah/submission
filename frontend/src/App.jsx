import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import Babysitters from "./pages/Babysitters";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import NotificationList from "./components/notifications/NotificationList";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root path to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="/:username" element={<MainLayout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <Navigate to="dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="children"
              element={
                <ProtectedRoute>
                  <Children />
                </ProtectedRoute>
              }
            />
            <Route
              path="babysitters"
              element={
                <ProtectedRoute>
                  <Babysitters />
                </ProtectedRoute>
              }
            />
            <Route
              path="finance"
              element={
                <ProtectedRoute>
                  <Finance />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationList />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
