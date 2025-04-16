import React, { useState, useEffect } from "react";
import axios from "axios";
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
import {
  FaPlus,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaFileExport,
} from "react-icons/fa";
import IncomeSources from "./IncomeSources";
import AddTransactionForm from "./AddTransactionForm";
import AddBudgetForm from "./AddBudgetForm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ManagerFinance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [transactionType, setTransactionType] = useState("income");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [budgetData, setBudgetData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetTracking, setBudgetTracking] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeTransactionCount, setIncomeTransactionCount] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [chartDataState, setChartDataState] = useState({
    labels: [],
    income: [],
    expenses: [],
  });

  const [reportsData, setReportsData] = useState({
    transactions: [],
    budgetAdherence: [],
  });

  // Add useEffect to fetch budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/financial/budgets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudgets(response.data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };

    const fetchBudgetTracking = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/financial/budgets/tracking",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudgetTracking(response.data);
      } catch (error) {
        console.error("Error fetching budget tracking:", error);
      }
    };

    fetchBudgets();
    fetchBudgetTracking();
  }, []);

  const handleBudgetAdded = () => {
    // Refresh budgets and tracking data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [budgetsRes, trackingRes] = await Promise.all([
          axios.get("http://localhost:5000/api/financial/budgets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/financial/budgets/tracking", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setBudgets(budgetsRes.data);
        setBudgetTracking(trackingRes.data);
      } catch (error) {
        console.error("Error refreshing budget data:", error);
      }
    };
    fetchData();
  };

  // Add useEffect to fetch total expenses
  useEffect(() => {
    const fetchTotalExpenses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/financial/expenses/total?timeRange=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFilteredExpenses(response.data);
        // Calculate total expenses from the response
        const total = response.data.reduce(
          (sum, expense) => sum + Number(expense.total_amount),
          0
        );
        setTotalExpenses(total);
      } catch (error) {
        console.error("Error fetching total expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalExpenses();
  }, [timeRange]);

  // Update the useEffect for filtered income and expenses
  useEffect(() => {
    const fetchFilteredIncome = async () => {
      try {
        const token = localStorage.getItem("token");
        const [incomeResponse, expensesResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/financial/income/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get(
            `http://localhost:5000/api/financial/expenses/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // Calculate total income from the response data
        const totalIncome = incomeResponse.data.data.reduce(
          (sum, item) => sum + (Number(item.total_income) || 0),
          0
        );
        const transactionCount = incomeResponse.data.data.reduce(
          (sum, item) => sum + (Number(item.transaction_count) || 0),
          0
        );

        // Calculate total expenses from the response data
        const totalExpenses = expensesResponse.data.expenses.reduce(
          (sum, item) => sum + (Number(item.total_amount) || 0),
          0
        );

        setTotalIncome(totalIncome);
        setIncomeTransactionCount(transactionCount);
        setTotalExpenses(totalExpenses);
        setNetIncome(totalIncome - totalExpenses);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        // Reset values on error
        setTotalIncome(0);
        setIncomeTransactionCount(0);
        setTotalExpenses(0);
        setNetIncome(0);
      }
    };

    fetchFilteredIncome();
  }, [timeRange]);

  // Update the useEffect for total budget
  useEffect(() => {
    const fetchTotalBudget = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/financial/budgets/total",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTotalBudget(Number(response.data.totalBudget) || 0);
      } catch (error) {
        console.error("Error fetching total budget:", error);
        setTotalBudget(0);
      }
    };

    fetchTotalBudget();
  }, []);

  // Update the useEffect for chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [incomeResponse, expensesResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/financial/income/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get(
            `http://localhost:5000/api/financial/expenses/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // Generate labels based on timeRange
        let labels = [];
        const today = new Date();
        switch (timeRange) {
          case "day":
            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            break;
          case "week":
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            break;
          case "month":
            const daysInMonth = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            ).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
            break;
          case "year":
            labels = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            break;
          default:
            labels = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
        }

        // Process income data
        const incomeData = new Array(labels.length).fill(0);
        incomeResponse.data.data.forEach((item) => {
          const index =
            timeRange === "week" ? item.period - 1 : item.period - 1;
          if (index >= 0 && index < incomeData.length) {
            incomeData[index] = Number(item.total_income) || 0;
          }
        });

        // Process expenses data
        const expensesData = new Array(labels.length).fill(0);
        expensesResponse.data.expenses.forEach((item) => {
          const index =
            timeRange === "week" ? item.period - 1 : item.period - 1;
          if (index >= 0 && index < expensesData.length) {
            expensesData[index] = Number(item.total_amount) || 0;
          }
        });

        setChartDataState({
          labels,
          income: incomeData,
          expenses: expensesData,
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartDataState({
          labels: [],
          income: [0],
          expenses: [0],
        });
      }
    };

    fetchChartData();
  }, [timeRange]);

  // Add useEffect to fetch budget data
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/financial/budgets/status?timeRange=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudgetData(response.data);
      } catch (error) {
        console.error("Error fetching budget data:", error);
        setBudgetData([]);
      }
    };

    fetchBudgetData();
  }, [timeRange]);

  // Add useEffect to fetch reports data
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [transactionsRes, budgetStatusRes] = await Promise.all([
          axios.get("http://localhost:5000/api/financial/transactions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/financial/budgets/status", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setReportsData({
          transactions: transactionsRes.data,
          budgetAdherence: budgetStatusRes.data,
        });
      } catch (error) {
        console.error("Error fetching reports data:", error);
      }
    };

    fetchReportsData();
  }, []);

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === undefined || amount === null) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
      }).format(0);
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
      }).format(0);
    }

    if (numAmount >= 1000000) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(numAmount);
    }
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  // Update the chart data object
  const chartDataConfig = {
    labels: chartDataState.labels,
    datasets: [
      {
        label: "Income",
        data: chartDataState.income,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.1,
        fill: false,
      },
      {
        label: "Expenses",
        data: chartDataState.expenses,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.1,
        fill: false,
      },
    ],
  };

  // Update chart options to show proper tooltips
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Financial Trends - ${
          timeRange.charAt(0).toUpperCase() + timeRange.slice(1)
        }`,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const handleTransactionAdded = () => {
    // Refresh transactions data
    // TODO: Implement actual data refresh
  };

  // Update the expenses tab content
  const renderExpensesTab = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            For {timeRange === "day" ? "today" : `this ${timeRange}`}
          </p>
        </div>

        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.category} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {expense.category}
                </h3>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(expense.total_amount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{
                    width: `${(expense.total_amount / totalExpenses) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {expense.transaction_count} transactions
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Update the budgets tab content
  const renderBudgetsTab = () => {
    return (
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Budget Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetData.map((budget, index) => (
            <div
              key={`${budget.category}-${index}`}
              className={`bg-white border rounded-lg p-4 ${
                budget.status === "exceeded" ? "border-red-500" : ""
              }`}
            >
              <h3 className="text-sm font-medium text-gray-900">
                {budget.category}
              </h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Budget</span>
                  <span className="font-medium">
                    {budget.budget ? formatCurrency(budget.budget) : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Actual Spending</span>
                  <span
                    className={`font-medium ${
                      budget.status === "exceeded"
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(budget.actualSpending)}
                  </span>
                </div>
                {budget.status === "exceeded" && (
                  <div className="mt-1 text-xs text-red-600">
                    Budget exceeded by{" "}
                    {formatCurrency(budget.actualSpending - budget.budget)}
                  </div>
                )}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        budget.status === "exceeded"
                          ? "bg-red-600"
                          : "bg-indigo-600"
                      }`}
                      style={{
                        width: `${calculateProgress(
                          budget.actualSpending,
                          budget.budget || budget.actualSpending
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Update the reports tab content
  const renderReportsTab = () => {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Financial Reports
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleExport("pdf")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaFileExport className="mr-2" /> Export PDF
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaFileExport className="mr-2" /> Export CSV
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Summary Card */}
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Daily Summary
              </h3>
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {reportsData.transactions.map((transaction, index) => (
                <div
                  key={`${transaction.id}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === "income"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Adherence Card */}
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Budget Adherence
              </h3>
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-gray-400" />
                <span className="text-sm text-gray-500">Current Period</span>
              </div>
            </div>
            <div className="space-y-4">
              {reportsData.budgetAdherence.map((budget, index) => (
                <div
                  key={`${budget.category}-${index}`}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {budget.category}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        budget.status === "exceeded"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(budget.actualSpending - budget.budget)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budget.status === "exceeded"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (budget.actualSpending / budget.budget) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Spent: {formatCurrency(budget.actualSpending)}</span>
                    <span>Budget: {formatCurrency(budget.budget)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add handleExport function
  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/financial/export?format=${format}&timeRange=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial_report_${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track income, expenses, and manage budgets
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Add Transaction
            </button>
            <button
              onClick={() => setShowAddBudgetForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaChartLine className="mr-2" /> Set Budget
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["overview", "income", "expenses", "budgets", "reports"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <FaFilter className="mr-2" /> Filter
          </button>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === "overview" && (
            <div className="p-6">
              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Income
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {formatCurrency(totalIncome)}
                        </dd>
                        <p className="mt-1 text-sm text-gray-500">
                          {incomeTransactionCount} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Expenses
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600">
                          {formatCurrency(totalExpenses)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Net Income
                        </dt>
                        <dd
                          className={`mt-1 text-3xl font-semibold ${
                            netIncome >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(netIncome)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Monthly Budget
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {formatCurrency(totalBudget)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="mt-8">
                <Line data={chartDataConfig} options={chartOptions} />
              </div>
            </div>
          )}

          {activeTab === "income" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Income Sources
              </h2>
              <IncomeSources timeRange={timeRange} />
            </div>
          )}

          {activeTab === "expenses" && renderExpensesTab()}

          {activeTab === "budgets" && renderBudgetsTab()}

          {activeTab === "reports" && renderReportsTab()}
        </div>
      </div>

      {/* Transaction Form */}
      {showTransactionForm && (
        <AddTransactionForm
          onClose={() => setShowTransactionForm(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      {/* Add Budget Form Modal */}
      {showAddBudgetForm && (
        <AddBudgetForm
          onClose={() => setShowAddBudgetForm(false)}
          onBudgetAdded={handleBudgetAdded}
        />
      )}
    </div>
  );
};

export default ManagerFinance;
