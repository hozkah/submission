import React, { useState } from "react";
import {
  FaTimes,
  FaBaby,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaInfoCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/animations.css";
import BabysitterSection from "./child/BabysitterSection";
import IncidentReport from "./child/IncidentReport";
import BabysitterSearch from "./child/BabysitterSearch";

const ChildDetails = ({ child, onClose, setChildren, children, user }) => {
  const [isActive, setIsActive] = useState(child.is_active);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedChild, setEditedChild] = useState({
    full_name: child.full_name,
    age: child.age,
    parent_name: child.parent_name,
    parent_phone: child.parent_phone,
    parent_email: child.parent_email,
    special_care_needs: child.special_care_needs,
    session_type: child.session_type,
    assigned_babysitter_id: child.assigned_babysitter_id,
    babysitter_name: child.babysitter_name,
  });
  const [incidentData, setIncidentData] = useState({
    incidentType: "health",
    description: "",
    target: "parent", // Default to parent for manager
  });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/children/${child.id}`,
        {
          fullName: editedChild.full_name,
          age: editedChild.age,
          parentDetails: {
            fullName: editedChild.parent_name,
            phoneNumber: editedChild.parent_phone,
            email: editedChild.parent_email,
          },
          specialNeeds: editedChild.special_care_needs,
          sessionType: editedChild.session_type,
          assignedBabysitterId: editedChild.assigned_babysitter_id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the children list with the complete updated child data
      const updatedChildren = children.map((c) =>
        c.id === child.id
          ? {
              ...c,
              full_name: editedChild.full_name,
              age: editedChild.age,
              parent_name: editedChild.parent_name,
              parent_phone: editedChild.parent_phone,
              parent_email: editedChild.parent_email,
              special_care_needs: editedChild.special_care_needs,
              session_type: editedChild.session_type,
              assigned_babysitter_id: editedChild.assigned_babysitter_id,
              babysitter_name: editedChild.babysitter_name,
            }
          : c
      );
      setChildren(updatedChildren);

      // Update the child prop directly
      child.full_name = editedChild.full_name;
      child.age = editedChild.age;
      child.parent_name = editedChild.parent_name;
      child.parent_phone = editedChild.parent_phone;
      child.parent_email = editedChild.parent_email;
      child.special_care_needs = editedChild.special_care_needs;
      child.session_type = editedChild.session_type;
      child.assigned_babysitter_id = editedChild.assigned_babysitter_id;
      child.babysitter_name = editedChild.babysitter_name;

      setIsEditing(false);
      toast.success("Child details updated successfully!");
    } catch (error) {
      toast.error("Failed to update child details");
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = async (status) => {
    if (user.role === "manager") {
      toast.warning("Managers cannot change attendance status");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/children/${child.id}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      const data = await response.json();
      setIsActive(status === "check-in");

      // Update the children list immediately
      const updatedChildren = children.map((c) => {
        if (c.id === child.id) {
          return { ...c, is_active: status === "check-in" ? 1 : 0 };
        }
        return c;
      });
      setChildren(updatedChildren);

      // Show success toast
      if (status === "check-in") {
        toast.success(`${child.full_name} has been checked in successfully!`);
      } else {
        toast.success(`${child.full_name} has been checked out successfully!`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to update attendance: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingIncident(true);
    setError("");

    const requestData = {
      child_id: child.id,
      incident_type: incidentData.incidentType,
      description: incidentData.description,
      target: incidentData.target,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/incidents",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.message.includes("but email notification failed")) {
        toast.warning("Incident saved but email to parent failed to send");
      } else {
        toast.success("Incident report submitted and email sent to parent!");
      }

      // Reset form
      setIncidentData({
        incidentType: "health",
        description: "",
        target: "parent",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.error(
        err.response?.data?.message || "Failed to submit incident report"
      );
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleIncidentChange = (e) => {
    const { name, value } = e.target;
    setIncidentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedChild((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value,
    }));
  };

  const handleDeleteBabysitter = async () => {
    if (!window.confirm("Are you sure you want to remove this babysitter?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/children/${child.id}/babysitter`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the children list
      const updatedChildren = children.map((c) =>
        c.id === child.id
          ? { ...c, babysitter_id: null, babysitter_name: null }
          : c
      );
      setChildren(updatedChildren);
      toast.success("Babysitter removed successfully!");
    } catch (error) {
      toast.error("Failed to remove babysitter");
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChild = async () => {
    const result = await Swal.fire({
      title: "Delete Child",
      text: "Are you sure you want to delete this Child?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, I am sure",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/children/${child.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Remove the child from the list
        const updatedChildren = children.filter((c) => c.id !== child.id);
        setChildren(updatedChildren);
        onClose();
        Swal.fire("Deleted!", "The child has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete child.", "error");
        console.error("Delete error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBabysitterSelect = (babysitter) => {
    setEditedChild((prev) => ({
      ...prev,
      assigned_babysitter_id: babysitter.id,
      babysitter_name: `${babysitter.first_name} ${babysitter.last_name}`,
    }));
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-40 animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-center min-h-full py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-4xl relative animate-slide-up my-12">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 focus:outline-none focus:border-[#4299e1] cursor-pointer hover:animate-spin hover:scale-110"
          >
            <FaTimes className="text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Child Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Child Details */}
            <div className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={editedChild.full_name}
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={editedChild.age}
                      onChange={handleEditChange}
                      min="0"
                      max="18"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Name
                    </label>
                    <input
                      type="text"
                      name="parent_name"
                      value={editedChild.parent_name}
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Phone
                    </label>
                    <input
                      type="text"
                      name="parent_phone"
                      value={editedChild.parent_phone}
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      name="parent_email"
                      value={editedChild.parent_email}
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Special Care Needs
                    </label>
                    <textarea
                      name="special_care_needs"
                      value={editedChild.special_care_needs}
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Session Type
                    </label>
                    <select
                      name="session_type"
                      value={editedChild.session_type}
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="half-day">Half Day</option>
                      <option value="full-day">Full Day</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign Babysitter
                    </label>
                    <BabysitterSearch
                      onSelect={handleBabysitterSelect}
                      currentBabysitterId={editedChild.assigned_babysitter_id}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    {user.role === "manager" && (
                      <button
                        type="button"
                        onClick={handleDeleteChild}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                      >
                        Delete Child
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <FaBaby className="text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{child.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaInfoCircle className="text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{child.age} years old</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaUser className="text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">Parent Name</p>
                      <p className="font-medium">{child.parent_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">Parent Phone</p>
                      <p className="font-medium">{child.parent_phone}</p>
                    </div>
                  </div>

                  {child.parent_email && (
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-500">Parent Email</p>
                        <p className="font-medium">{child.parent_email}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Session Type</p>
                    <p className="font-medium capitalize">
                      {child.session_type}
                    </p>
                  </div>

                  {child.special_care_needs && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Special Care Needs
                      </p>
                      <p className="font-medium">{child.special_care_needs}</p>
                    </div>
                  )}

                  {/* Babysitter Section */}
                  <BabysitterSection
                    child={child}
                    setChildren={setChildren}
                    children={children}
                    user={user}
                    setIsLoading={setIsLoading}
                  />

                  {/* Update Button for Manager */}
                  {user.role === "manager" && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full px-4 py-2 border-1 border-indigo-600 text-indigo-600 rounded-lg
                         hover:bg-indigo-700 focus:outline-none focus:border-[#4299e1] flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <FaEdit />
                        <span>Update Child Details</span>
                      </button>
                    </div>
                  )}

                  {/* Attendance Section - Only for babysitters */}
                  {user.role === "babysitter" && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">
                        Attendance Status
                      </p>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="attendance"
                            value="check-in"
                            checked={isActive}
                            onChange={() => handleAttendanceChange("check-in")}
                            className="form-radio text-indigo-600 w-6 h-6 cursor-pointer"
                            disabled={isLoading}
                          />
                          <span className="flex items-center">
                            <FaSignInAlt className="text-green-500 mr-1" />
                            Check In
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="attendance"
                            value="check-out"
                            checked={!isActive}
                            onChange={() => handleAttendanceChange("check-out")}
                            className="form-radio text-indigo-600 w-6 h-6 cursor-pointer"
                            disabled={isLoading}
                          />
                          <span className="flex items-center">
                            <FaSignOutAlt className="text-red-500 mr-1" />
                            Check Out
                          </span>
                        </label>
                      </div>
                      {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column - Incident Report Section */}
            {(user.role === "manager" || user.role === "babysitter") && (
              <IncidentReport child={child} user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDetails;
