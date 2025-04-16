import React, { useState, useEffect } from "react";
import {
  FaChild,
  FaMoneyBillWave,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import axios from "axios";

const BabysitterDashboard = () => {
  const [stats, setStats] = useState([
    {
      name: "Assigned Children",
      value: "0",
      icon: FaChild,
      color: "text-purple-600",
    },
    {
      name: "Pending Payments",
      value: "UGX 0",
      icon: FaMoneyBillWave,
      color: "text-purple-600",
    },
    {
      name: "Resolved Payments",
      value: "UGX 0",
      icon: FaCheckCircle,
      color: "text-purple-600",
    },
  ]);

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Get babysitter ID from token or user info
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/me",
          { headers }
        );
        const babysitterId = userResponse.data.id;

        // Fetch all required data
        const [childrenCountResponse, paymentsResponse, scheduleResponse] =
          await Promise.all([
            axios.get(
              `http://localhost:5000/api/babysitters/${babysitterId}/children/count`,
              { headers }
            ),
            axios.get(
              `http://localhost:5000/api/babysitters/${babysitterId}/payments/summary`,
              { headers }
            ),
            axios.get(
              `http://localhost:5000/api/babysitters/${babysitterId}/schedule/today`,
              { headers }
            ),
          ]);

        setStats([
          {
            name: "Assigned Children",
            value: childrenCountResponse.data.count.toString(),
            icon: FaChild,
            color: "text-purple-600",
          },
          {
            name: "Pending Payments",
            value: `UGX ${parseFloat(
              paymentsResponse.data.pending
            ).toLocaleString()}`,
            icon: FaMoneyBillWave,
            color: "text-purple-600",
          },
          {
            name: "Resolved Payments",
            value: `UGX ${parseFloat(
              paymentsResponse.data.completed
            ).toLocaleString()}`,
            icon: FaCheckCircle,
            color: "text-purple-600",
          },
        ]);

        setTodaySchedule(scheduleResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Babysitter Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Today's Schedule
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {todaySchedule.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {todaySchedule.map((schedule) => (
                  <li key={schedule.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaCalendarAlt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {schedule.session_type} Session
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:px-6">
                <p className="text-sm text-gray-500">No schedule for today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabysitterDashboard;
