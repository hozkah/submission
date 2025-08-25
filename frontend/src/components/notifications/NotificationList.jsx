import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import axios from "axios";

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    babysitterName: "",
    childName: "",
  });
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Debounced fetch when filters change
  useEffect(() => {
    console.log('Filters changed:', filters);
    if (notifications.length > 0) { // Only filter if we have notifications
      const timeoutId = setTimeout(() => {
        applyFilters();
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    }
  }, [filters.babysitterName, filters.childName, notifications]);

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
        console.log('Notifications fetched:', response.data);
        setNotifications(response.data);
        setFilteredNotifications(response.data);
      } else {
        setNotifications([]);
        setFilteredNotifications([]);
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

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    console.log('Total notifications:', notifications.length);
    
    let filtered = [...notifications];
    
    // Filter by babysitter name
    if (filters.babysitterName.trim()) {
      const babysitterSearch = filters.babysitterName.trim().toLowerCase();
      console.log('Filtering by babysitter name:', babysitterSearch);
      filtered = filtered.filter(notification => 
        notification.reported_by_name && 
        notification.reported_by_name.toLowerCase().includes(babysitterSearch)
      );
      console.log('After babysitter filter:', filtered.length);
    }
    
    // Filter by child name
    if (filters.childName.trim()) {
      const childSearch = filters.childName.trim().toLowerCase();
      console.log('Filtering by child name:', childSearch);
      filtered = filtered.filter(notification => 
        notification.child_name && 
        notification.child_name.toLowerCase().includes(childSearch)
      );
      console.log('After child filter:', filtered.length);
    }
    
    console.log('Final filtered count:', filtered.length);
    setFilteredNotifications(filtered);
  };

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

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Filter Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Babysitter Name
            </label>
            <input
              type="text"
              placeholder="Enter babysitter name..."
              value={filters.babysitterName}
              onChange={(e) => setFilters(prev => ({ ...prev, babysitterName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Child Name
            </label>
            <input
              type="text"
              placeholder="Enter child name..."
              value={filters.childName}
              onChange={(e) => setFilters(prev => ({ ...prev, childName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
                 <div className="mt-4 flex justify-between items-center">
           <div className="text-sm text-gray-600 flex items-center">
             {isLoading ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                 Loading...
               </>
             ) : (
               `Showing ${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? 's' : ''}`
             )}
           </div>
                     <button
             onClick={() => {
               setFilters({ babysitterName: "", childName: "" });
               setFilteredNotifications([...notifications]);
             }}
             className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
           >
             Clear Filters
           </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {notifications.length === 0 ? "No notifications found" : "No notifications match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
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
