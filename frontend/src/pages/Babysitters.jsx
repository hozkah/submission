import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
  FaUserClock,
  FaInfoCircle,
  FaSpinner,
  FaSearch,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BabysitterInfoPanel from "../components/babysitters/BabysitterInfoPanel";
import axios from "axios";
import Swal from "sweetalert2";
import BabysitterSchedules from "../components/babysitters/BabysitterSchedules";
import BabysitterPayments from "../components/babysitters/BabysitterPayments";

const Babysitters = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedBabysitter, setSelectedBabysitter] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "17:00",
    sessionType: "full-day",
  });

  // Fetch babysitters from backend
  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/babysitters",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Sort babysitters by first name in ascending order
        const sortedBabysitters = response.data.sort((a, b) =>
          a.first_name.localeCompare(b.first_name)
        );
        setBabysitters(sortedBabysitters);
        setError(null);
      } catch (err) {
        console.error("Error fetching babysitters:", err);
        setError("Failed to load babysitters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, []);

  // Filter babysitters based on search term
  const filteredBabysitters = babysitters.filter((babysitter) => {
    const searchString =
      `${babysitter.first_name} ${babysitter.last_name} ${babysitter.nin} ${babysitter.email} ${babysitter.phone}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const calculatePayment = (sessionType, childrenCount) => {
    const rate = sessionType === "full-day" ? 5000 : 2000;
    return rate * childrenCount;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const amount = calculatePayment(
        paymentData.sessionType,
        paymentData.childrenCount
      );

      const paymentRecord = {
        type: "income",
        category: "babysitter-payment",
        amount: amount,
        description: `Payment for ${paymentData.sessionType} session with ${paymentData.childrenCount} children`,
        date: paymentData.date,
        reference_id: paymentData.babysitterId,
        reference_type: "babysitter",
        status: "pending",
      };

      await axios.post(
        "http://localhost:5000/api/financial-transactions",
        paymentRecord,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("Success!", "Payment recorded successfully.", "success");
      setShowPaymentForm(false);
      // Refresh babysitters data to show updated payments
      fetchBabysitters();
    } catch (error) {
      console.error("Error recording payment:", error);
      Swal.fire("Error!", "Failed to record payment.", "error");
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/babysitters/${selectedBabysitter.id}/schedule`,
        {
          date: scheduleData.date,
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          sessionType: scheduleData.sessionType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Schedule created successfully",
        icon: "success",
        confirmButtonText: "OK",
      });

      setShowScheduleForm(false);
      setScheduleData({
        date: new Date().toISOString().split("T")[0],
        startTime: "08:00",
        endTime: "17:00",
        sessionType: "full-day",
      });
    } catch (error) {
      console.error("Error creating schedule:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to create schedule",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };

  const handleDeleteBabysitter = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/babysitters/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire("Deleted!", "The babysitter has been deleted.", "success");
        setBabysitters(babysitters.filter((b) => b.id !== id));
        setShowInfoPanel(false);
      } catch (error) {
        console.error("Error deleting babysitter:", error);
        Swal.fire("Error!", "Failed to delete babysitter.", "error");
      }
    }
  };

  const handleAssignChildren = async (id, children) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/babysitters/${id}/assign-children`,
        { children },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update local state
      setBabysitters(
        babysitters.map((b) =>
          b.id === id ? { ...b, children_assigned: children } : b
        )
      );
    } catch (error) {
      console.error("Error assigning children:", error);
    }
  };

  // Fetch schedules when schedules tab is active
  useEffect(() => {
    const fetchSchedules = async () => {
      if (activeTab === "schedules") {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:5000/api/babysitters/schedules",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSchedules(response.data);
        } catch (error) {
          console.error("Error fetching schedules:", error);
        }
      }
    };

    fetchSchedules();
  }, [activeTab]);

  // Add this function to handle status update
  const handleStatusUpdate = async (scheduleId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/babysitters/schedules/${scheduleId}/status`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Status updated successfully") {
        // Update the local state
        setSchedules(
          schedules.map((schedule) =>
            schedule.id === scheduleId
              ? { ...schedule, status: "approved" }
              : schedule
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Babysitters Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage babysitters from here
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Babysitters
              </h1>
              <nav className="-mb-px flex space-x-8 mt-6">
                {["list", "payments", "schedules"].map((tab) => (
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
                ))}
              </nav>
              {activeTab === "list" && (
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search babysitters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm sm:leading-6"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-gray-200 sm:rounded-lg">
                    {activeTab === "list" && (
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Phone
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Children Assigned
                            </th>
                            <th
                              scope="col"
                              className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                            >
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredBabysitters.map((babysitter) => (
                            <tr key={babysitter.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {babysitter.first_name} {babysitter.last_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {babysitter.phone_number}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {babysitter.email}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {babysitter.children_assigned_count}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedBabysitter(babysitter);
                                      setShowInfoPanel(true);
                                    }}
                                    className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition flex items-center space-x-2 cursor-pointer"
                                  >
                                    <FaInfoCircle className="h-4 w-4" />
                                    <span>Info</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBabysitter(babysitter);
                                      setShowScheduleForm(true);
                                    }}
                                    className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition flex items-center space-x-2 cursor-pointer"
                                  >
                                    <FaCalendarAlt className="h-4 w-4" />
                                    <span>Schedule</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "payments" && <BabysitterPayments />}

                    {activeTab === "schedules" && <BabysitterSchedules />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfoPanel && selectedBabysitter && (
        <BabysitterInfoPanel
          babysitter={selectedBabysitter}
          onClose={() => setShowInfoPanel(false)}
          onDelete={handleDeleteBabysitter}
          onAssignChildren={handleAssignChildren}
        />
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && selectedBabysitter && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-40 animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-center min-h-full py-12">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-4xl relative animate-slide-up my-12">
              {/* Close Button */}
              <button
                onClick={() => setShowScheduleForm(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-pink-600 focus:outline-none focus:border-[#4299e1] cursor-pointer hover:animate-spin hover:scale-110"
              >
                <FaTimes className="text-gray-500" />
              </button>

              <h2 className="text-xl font-semibold mb-6 text-center">
                Create Schedule for {selectedBabysitter.first_name}{" "}
                {selectedBabysitter.last_name}
              </h2>

              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={scheduleData.date}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          date: e.target.value,
                        })
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Session Type
                    </label>
                    <select
                      name="sessionType"
                      value={scheduleData.sessionType}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          sessionType: e.target.value,
                        })
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                      required
                    >
                      <option value="half-day">Half Day</option>
                      <option value="full-day">Full Day</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={scheduleData.startTime}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          startTime: e.target.value,
                        })
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={scheduleData.endTime}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          endTime: e.target.value,
                        })
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none cursor-pointer"
                  >
                    Create Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Babysitters;
