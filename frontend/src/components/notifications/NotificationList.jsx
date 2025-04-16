import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import axios from "axios";

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          setError("Not authenticated. Please login again.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/incidents/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          setError("You don't have permission to view notifications.");
        } else {
          setError("Failed to fetch notifications. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/incidents/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, status: 1 } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <FaArrowLeft className="inline mr-2" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <FaArrowLeft className="inline mr-2" /> Back
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 rounded-lg bg-white  border ${
                notification.status === 0
                  ? "border-indigo-500 hover:border-blue-300"
                  : "border-gray-200 hover:border-gray-300"
              } transition-all duration-200`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {notification.incident_type}
                    </h3>
                    {notification.status === 0 && (
                      <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{notification.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Reported by: {notification.reported_by_name}</span>
                    <span>Child: {notification.child_name}</span>
                    <span>
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {notification.status === 0 && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium 
                    text-indigo-500 border border-indigo-500 rounded-full hover:bg-green-100
                     cursor-pointer 
                     transition-colors duration-200 "
                  >
                    <FaCheck className="mr-1.5" /> Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
