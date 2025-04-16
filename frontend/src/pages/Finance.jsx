import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaChartLine,
  FaFileExport,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import AddTransactionForm from "../components/finance/AddTransactionForm";
import AddBudgetForm from "../components/finance/AddBudgetForm";
import IncomeSources from "../components/finance/IncomeSources";
import axios from "axios";
import BabysitterFinance from "../components/finance/BabysitterFinance";
import ManagerFinance from "../components/finance/ManagerFinance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Finance = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(response.data.role);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      {userRole === "babysitter" ? <BabysitterFinance /> : <ManagerFinance />}
    </div>
  );
};

export default Finance;
