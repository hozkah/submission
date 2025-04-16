import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const IncidentReport = ({ child, user }) => {
  const [incidentData, setIncidentData] = useState({
    incidentType: "health",
    description: "",
    target: user.role === "manager" ? "parent" : "manager",
  });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const handleIncidentChange = (e) => {
    const { name, value } = e.target;
    setIncidentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingIncident(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/incidents",
        {
          child_id: child.id,
          incident_type: incidentData.incidentType,
          description: incidentData.description,
          target: incidentData.target,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(
        user.role === "manager"
          ? "Notification sent successfully!"
          : "Incident report submitted successfully!"
      );
      setIncidentData({
        incidentType: "health",
        description: "",
        target: user.role === "manager" ? "parent" : "manager",
      });
    } catch (error) {
      toast.error(
        user.role === "manager"
          ? "Failed to send notification"
          : "Failed to submit incident report"
      );
      console.error("Incident error:", error);
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-200 md:border-t-0 md:border-l md:pl-6">
      <div className="flex items-center space-x-2 mb-4">
        <FaExclamationTriangle className="text-yellow-500" />
        <h3 className="text-lg font-medium">
          {user.role === "manager" ? "Send Notification" : "Report Incident"}
        </h3>
      </div>

      <form onSubmit={handleIncidentSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {user.role === "manager" ? "Notification Type" : "Incident Type"}
          </label>
          <select
            name="incidentType"
            value={incidentData.incidentType}
            onChange={handleIncidentChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
            required
          >
            <option value="health">Health</option>
            <option value="behavior">Behavior</option>
            <option value="well-being">Well-being</option>
            {user.role === "manager" && (
              <>
                <option value="payment-reminder">Payment Reminder</option>
                <option value="payment-overdue">Payment Overdue</option>
              </>
            )}
          </select>
        </div>

        {user.role === "babysitter" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target
            </label>
            <select
              name="target"
              value={incidentData.target}
              onChange={handleIncidentChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
              required
            >
              <option value="parent">Parent</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={incidentData.description}
            onChange={handleIncidentChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            rows="3"
            placeholder={
              user.role === "manager"
                ? "Describe the notification..."
                : "Describe the incident..."
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmittingIncident}
          className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-lg cursor-pointer
            ${
              isSubmittingIncident
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-indigo-700"
            }`}
        >
          {isSubmittingIncident
            ? user.role === "manager"
              ? "Sending..."
              : "Submitting..."
            : user.role === "manager"
            ? "Send Notification"
            : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default IncidentReport;