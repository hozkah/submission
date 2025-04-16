import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ManagerDashboard from "./ManagerDashboard";
import BabysitterDashboard from "./BabysitterDashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      // Check if the current URL matches the user's role and username
      const currentPath = window.location.pathname;
      const expectedPath = `/${user.username || user.firstName}/dashboard`;

      if (currentPath !== expectedPath) {
        navigate(expectedPath);
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full"
              src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`}
              alt={user.firstName}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back,{" "}
              {user.firstName
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              !
            </h2>
            <p className="text-gray-500">
              {user.role === "manager"
                ? "Here's an overview of your daycare center"
                : "Here's your daily schedule and activities"}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {user.role === "manager" ? <ManagerDashboard /> : <BabysitterDashboard />}
    </div>
  );
};

export default Dashboard;
