import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";

const BabysitterPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        console.log("Fetching payments with token:", token);

        // Fetch all babysitter payments
        const response = await axios.get(
          "http://localhost:5000/api/babysitters/payments/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Payments response:", response.data);

        // Process payments
        const processedPayments = response.data.map((payment) => ({
          id: payment.id,
          first_name: payment.first_name,
          last_name: payment.last_name,
          date: payment.date,
          session_type: payment.session_type,
          children_count: payment.children_count,
          amount: payment.amount,
          status: payment.status,
        }));

        setPayments(processedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);

        // Handle specific error cases
        if (error.response?.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Data Not Found",
            text: "Could not fetch payment data. Please try again later.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch payments. Please check the console for details.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const calculateAmount = (sessionType, childrenCount) => {
    if (!childrenCount || childrenCount === 0) return 0;
    const rate = sessionType === "full-day" ? 5000 : 2000;
    return rate * childrenCount;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please log in again to approve payments.",
        });
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/babysitters/payments/${paymentId}/clear`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Payment approved successfully") {
        Swal.fire({
          icon: "success",
          title: "Payment Approved",
          text: "The payment has been successfully approved.",
        });

        // Refresh the payments list
        const fetchPayments = async () => {
          try {
            setLoading(true);
            const response = await axios.get(
              "http://localhost:5000/api/babysitters/payments/all",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const processedPayments = response.data.map((payment) => ({
              id: payment.id,
              first_name: payment.first_name,
              last_name: payment.last_name,
              date: payment.date,
              session_type: payment.session_type,
              children_count: payment.children_count,
              amount: payment.amount,
              status: payment.status,
            }));

            setPayments(processedPayments);
          } catch (error) {
            console.error("Error fetching payments:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to refresh payments. Please try again.",
            });
          } finally {
            setLoading(false);
          }
        };

        await fetchPayments();
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      let errorMessage = "Failed to approve payment. Please try again.";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Payment not found or already cleared.";
        } else if (error.response.status === 401) {
          errorMessage = "You are not authorized to approve payments.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage =
          "Could not connect to the server. Please check your connection.";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaMoneyBillWave className="text-indigo-500 mr-2" />
              Babysitter Payments
            </h2>
          </div>

          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Session Type
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Children Count
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {payment.first_name} {payment.last_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {payment.session_type}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {payment.children_count}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === "completed"
                                  ? "bg-indigo-500 text-white"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payment.status === "completed" ? (
                                <span className="flex items-center">
                                  <FaCheckCircle className="mr-1" />
                                  Approved
                                </span>
                              ) : (
                                "Pending"
                              )}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {payment.status !== "completed" && (
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabysitterPayments;
