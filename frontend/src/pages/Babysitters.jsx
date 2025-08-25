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
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BabysitterInfoPanel from "../components/babysitters/BabysitterInfoPanel";
import CreateUserForm from "../components/babysitters/CreateUserForm";
import axios from "axios";
import Swal from "sweetalert2";
import BabysitterSchedules from "../components/babysitters/BabysitterSchedules";
import BabysitterPayments from "../components/babysitters/BabysitterPayments";

const Babysitters = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("babysitters");
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedBabysitter, setSelectedBabysitter] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createUserType, setCreateUserType] = useState("babysitter");
  const [babysitters, setBabysitters] = useState([]);
  const [managers, setManagers] = useState([]);
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

  // Fetch managers from backend
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/babysitters/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setManagers(response.data);
      } catch (err) {
        console.error("Error fetching managers:", err);
      }
    };

    fetchManagers();
  }, []);

  // Filter babysitters based on search term
  const filteredBabysitters = babysitters.filter((babysitter) => {
    const searchString =
      `${babysitter.first_name} ${babysitter.last_name} ${babysitter.nin} ${babysitter.email} ${babysitter.phone_number}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Filter managers based on search term
  const filteredManagers = managers.filter((manager) => {
    const searchString =
      `${manager.username} ${manager.email}`.toLowerCase();
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

      const response = await axios.post(
        "http://localhost:5000/api/financial/transactions",
        paymentRecord,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Payment Record Created",
          text: "Payment record has been created successfully!",
        });
        setShowPaymentForm(false);
      }
    } catch (error) {
      console.error("Error creating payment record:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create payment record. Please try again.",
      });
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

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Schedule Created",
          text: "Schedule has been created successfully!",
        });
        setShowScheduleForm(false);
        // Refresh schedules
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create schedule. Please try again.",
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
      title: "Delete Babysitter",
      text: "Are you sure you want to delete this babysitter permanently?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, I am sure!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/babysitters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Remove from local state
        setBabysitters(babysitters.filter((b) => b.id !== id));
        Swal.fire("Deleted!", "The babysitter has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting babysitter:", error);
        Swal.fire("Error!", "Failed to delete babysitter.", "error");
      }
    }
  };

  const handleAssignChildren = async (id, children) => {
    try {
      const token = localStorage.getItem("token");
      // Update each child with the new babysitter ID
      for (const childId of children) {
        await axios.put(
          `http://localhost:5000/api/children/${childId}`,
          {
            assignedBabysitterId: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Refresh babysitters list to update children count
      const response = await axios.get(
        "http://localhost:5000/api/babysitters",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBabysitters(response.data);
    } catch (error) {
      console.error("Error assigning children:", error);
    }
  };

  const fetchSchedules = async () => {
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
  };

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
        setSchedules(schedules.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, status: "approved" }
            : schedule
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUserCreated = () => {
    // Refresh the appropriate list based on active tab
    if (activeTab === "babysitters") {
      const fetchBabysitters = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:5000/api/babysitters",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const sortedBabysitters = response.data.sort((a, b) =>
            a.first_name.localeCompare(b.first_name)
          );
          setBabysitters(sortedBabysitters);
        } catch (err) {
          console.error("Error fetching babysitters:", err);
        }
      };
      fetchBabysitters();
    } else {
      const fetchManagers = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:5000/api/babysitters/users",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setManagers(response.data);
        } catch (err) {
          console.error("Error fetching managers:", err);
        }
      };
      fetchManagers();
    }
  };

  const openCreateForm = (userType) => {
    setCreateUserType(userType);
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  User Management
                </h1>
                <nav className="-mb-px flex space-x-8 mt-6">
                  {["babysitters", "managers"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`${
                        activeTab === tab
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize flex items-center`}
                    >
                      {tab === "babysitters" ? (
                        <FaUsers className="mr-2" />
                      ) : (
                        <FaUserTie className="mr-2" />
                      )}
                      {tab}
                    </button>
                  ))}
                </nav>

                {activeTab === "babysitters" && (
                  <nav className="-mb-px flex space-x-8 mt-6">
                    {["list", "payments", "schedules"].map((subTab) => (
                      <button
                        key={subTab}
                        onClick={() => setActiveSubTab(subTab)}
                        className={`${
                          activeSubTab === subTab
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                      >
                        {subTab}
                      </button>
                    ))}
                  </nav>
                )}

                {activeTab === "babysitters" && activeSubTab === "list" && (
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

                {activeTab === "managers" && (
                  <div className="mt-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search managers..."
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

              {/* Create User Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => openCreateForm("babysitter")}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="mr-2" />
                  Add Babysitter
                </button>
                <button
                  onClick={() => openCreateForm("manager")}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaPlus className="mr-2" />
                  Add Manager
                </button>
              </div>
            </div>
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
                  {activeTab === "babysitters" && activeSubTab === "list" && (
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
                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                                >
                                  <FaInfoCircle className="mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteBabysitter(babysitter.id)}
                                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                >
                                  <FaTrash className="mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "managers" && (
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Username
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
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Last Login
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredManagers.map((manager) => (
                          <tr key={manager.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {manager.username}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {manager.email}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                manager.is_active 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {manager.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {manager.last_login 
                                ? new Date(manager.last_login).toLocaleDateString()
                                : "Never"
                              }
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(manager.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "babysitters" && activeSubTab === "payments" && (
                    <BabysitterPayments />
                  )}

                  {activeTab === "babysitters" && activeSubTab === "schedules" && (
                    <BabysitterSchedules />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInfoPanel && selectedBabysitter && (
        <BabysitterInfoPanel
          babysitter={selectedBabysitter}
          onClose={() => setShowInfoPanel(false)}
          onDelete={handleDeleteBabysitter}
          onAssignChildren={handleAssignChildren}
        />
      )}

      {showCreateForm && (
        <CreateUserForm
          userType={createUserType}
          onClose={() => setShowCreateForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Payment Record
              </h2>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Babysitter
                </label>
                <select
                  name="babysitterId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select babysitter</option>
                  {babysitters.map((babysitter) => (
                    <option key={babysitter.id} value={babysitter.id}>
                      {babysitter.first_name} {babysitter.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <select
                  name="sessionType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="half-day">Half Day</option>
                  <option value="full-day">Full Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Children
                </label>
                <input
                  type="number"
                  name="childrenCount"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && selectedBabysitter && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Schedule for {selectedBabysitter.first_name} {selectedBabysitter.last_name}
              </h2>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
      )}
    </div>
  );
};

export default Babysitters;
