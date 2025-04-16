/**
 * MainLayout Component
 *
 * This component serves as the primary layout wrapper for the application.
 * It provides a consistent structure with a navigation bar at the top,
 * a sidebar on the left, and a main content area that renders child routes.
 */

import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserDropdown from "../UserDropdown";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import MobileMenu from "./MobileMenu";
import axios from "axios";

const MainLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/incidents/notifications/unread",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && typeof response.data.count === "number") {
          setNotificationCount(response.data.count);
        } else {
          console.warn("Invalid notification count response:", response.data);
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        // Don't set error state here, just log it
        // This prevents the UI from breaking if notifications fail
      }
    };

    // Fetch notifications initially
    fetchNotifications();

    // Set up polling to fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    const username = user?.username || user?.firstName;
    if (location.pathname.includes("/notifications")) {
      navigate(-1); // Go back if already on notifications page
    } else {
      navigate(`/${username}/notifications`); // Navigate to notifications page
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center">
              {/* Modern hamburger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden relative w-8 h-8 focus:outline-none group"
                aria-label="Toggle menu"
              >
                <div className="relative flex overflow-hidden items-center justify-center rounded-full w-8 h-8 transform transition-all duration-200">
                  <div className="flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center overflow-hidden">
                    <div
                      className={`bg-gray-600 h-0.5 w-5 transform transition-all duration-300 origin-left ${
                        isMobileMenuOpen ? "rotate-45" : ""
                      }`}
                    ></div>
                    <div
                      className={`bg-gray-600 h-0.5 w-5 rounded transform transition-all duration-300 ${
                        isMobileMenuOpen ? "translate-x-10" : ""
                      }`}
                    ></div>
                    <div
                      className={`bg-gray-600 h-0.5 w-5 transform transition-all duration-300 origin-left ${
                        isMobileMenuOpen ? "-rotate-45" : ""
                      }`}
                    ></div>
                  </div>
                </div>
              </button>
              <h1 className="text-xl font-semibold text-gray-800 ml-4">
                Daycare Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="relative text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={handleNotificationClick}
              >
                <FaBell className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-3">{user?.role}</span>
                <UserDropdown />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
