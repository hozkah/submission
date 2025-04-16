import React, { useState, useEffect } from "react";
import axios from "axios";

const IncomeSources = ({ timeRange }) => {
  const [incomeSources, setIncomeSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const cleanTimeRange = timeRange?.split(":")[0] || "month";

        const transactionsResponse = await axios.get(
          `http://localhost:5000/api/financial/transactions?type=income&timeRange=${cleanTimeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Group transactions by category and calculate totals
        const categoryTotals = transactionsResponse.data.reduce(
          (acc, transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
              acc[category] = {
                amount: 0,
                transactionCount: 0,
              };
            }
            acc[category].amount += Number(transaction.amount) || 0;
            acc[category].transactionCount += 1;
            return acc;
          },
          {}
        );

        // Convert to array format
        const processedData = Object.entries(categoryTotals).map(
          ([category, data]) => ({
            category,
            amount: data.amount,
            transactionCount: data.transactionCount,
          })
        );

        setIncomeSources(processedData);
      } catch (error) {
        console.error("Error fetching income data:", error);
        setIncomeSources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomeData();
  }, [timeRange]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incomeSources.map((source) => (
        <div key={source.category} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              {source.category}
            </h3>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(source.amount)}
              </span>
              <span className="text-xs text-gray-500">
                {source.transactionCount} transactions
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncomeSources;
