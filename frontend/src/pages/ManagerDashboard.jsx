import React, { useState, useEffect } from "react";
import {
  FaChild,
  FaUserNurse,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";

const ManagerDashboard = () => {
  const [stats, setStats] = useState([
    {
      name: "Total Children",
      value: "0",
      icon: FaChild,
      color: "text-purple-600",
    },
    {
      name: "Active Babysitters",
      value: "0",
      icon: FaUserNurse,
      color: "text-purple-600",
    },
    {
      name: "Total Income",
      value: "UGX 0",
      icon: FaMoneyBillWave,
      color: "text-purple-600",
    },
    {
      name: "Total Expenditure",
      value: "UGX 0",
      icon: FaChartLine,
      color: "text-purple-600",
    },
  ]);

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch children, babysitters, and financial transactions
        const [childrenResponse, babysittersResponse, transactionsResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/children", { headers }),
            axios.get("http://localhost:5000/api/babysitters", { headers }),
            axios.get("http://localhost:5000/api/financial/transactions", {
              headers,
            }),
          ]);

        // Calculate total income and expenditure from transactions
        const transactions = transactionsResponse.data;
        const totalIncome = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenditure = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        setStats([
          {
            name: "Total Children",
            value: childrenResponse.data.length.toString(),
            icon: FaChild,
            color: "text-purple-600",
          },
          {
            name: "Active Babysitters",
            value: babysittersResponse.data.length.toString(),
            icon: FaUserNurse,
            color: "text-purple-600",
          },
          {
            name: "Total Income",
            value: `UGX ${totalIncome.toLocaleString()}`,
            icon: FaMoneyBillWave,
            color: "text-purple-600",
          },
          {
            name: "Total Expenditure",
            value: `UGX ${totalExpenditure.toLocaleString()}`,
            icon: FaChartLine,
            color: "text-purple-600",
          },
        ]);

        // Fetch recent alerts (incidents and budget warnings)
        const [incidentsResponse, budgetResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/incidents", { headers }),
          axios.get("http://localhost:5000/api/financial/budgets/status", {
            headers,
          }),
        ]);

        // Format alerts
        const alerts = [
          ...incidentsResponse.data.slice(0, 2).map((incident) => ({
            id: incident.id,
            type: "warning",
            message: `Incident reported for ${incident.child_name}`,
            time: new Date(incident.created_at).toLocaleTimeString(),
          })),
          ...budgetResponse.data
            .filter((budget) => budget.status === "exceeded")
            .map((budget) => ({
              id: `budget-${budget.category}`,
              type: "warning",
              message: `Budget exceeded for ${budget.category}`,
              time: "Today",
            })),
        ];

        setRecentAlerts(alerts.slice(0, 3));
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
          Manager Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Alerts
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <li key={alert.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle
                        className={`h-5 w-5 ${
                          alert.type === "warning"
                            ? "text-purple-600"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
