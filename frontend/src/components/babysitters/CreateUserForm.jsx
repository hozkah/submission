import React, { useState } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendar, FaUserFriends } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const CreateUserForm = ({ userType, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    ...(userType === "babysitter" && {
      phoneNumber: "",
      nin: "",
      dateOfBirth: "",
      nextOfKin: {
        name: "",
        phoneNumber: "",
        relationship: "",
      },
    }),
    ...(userType === "manager" && {
      username: "",
    }),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (userType === "babysitter") {
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
      if (!formData.nin.trim()) newErrors.nin = "NIN is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.nextOfKin.name.trim()) newErrors["nextOfKin.name"] = "Next of kin name is required";
      if (!formData.nextOfKin.phoneNumber.trim()) newErrors["nextOfKin.phoneNumber"] = "Next of kin phone is required";
      if (!formData.nextOfKin.relationship.trim()) newErrors["nextOfKin.relationship"] = "Next of kin relationship is required";
    }

    if (userType === "manager") {
      if (!formData.username.trim()) newErrors.username = "Username is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved:", token ? "Token exists" : "No token found");
      
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      const endpoint = userType === "babysitter" ? "http://localhost:5000/api/babysitters" : "http://localhost:5000/api/babysitters/manager";
      
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        ...(userType === "babysitter" && {
          phoneNumber: formData.phoneNumber,
          nin: formData.nin,
          dateOfBirth: formData.dateOfBirth,
          nextOfKin: formData.nextOfKin,
        }),
        ...(userType === "manager" && {
          username: formData.username,
        }),
      };

      console.log("Sending request to:", endpoint);
      console.log("Request data:", requestData);
      console.log("Authorization header:", `Bearer ${token}`);
      
      const response = await axios.post(endpoint, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await Swal.fire({
        icon: "success",
        title: `${userType === "babysitter" ? "Babysitter" : "Manager"} Created Successfully!`,
        text: response.data.message,
      });

      onUserCreated();
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error.response?.data?.message || "Failed to create user";
      
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBabysitterFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter phone number"
            />
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            National ID (NIN)
          </label>
          <div className="relative">
            <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="nin"
              value={formData.nin}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.nin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter NIN"
            />
          </div>
          {errors.nin && <p className="text-red-500 text-sm mt-1">{errors.nin}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <div className="relative">
          <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.dateOfBirth ? "border-red-500" : "border-gray-300"
            }`}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaUserFriends className="mr-2 text-indigo-500" />
          Next of Kin Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="nextOfKin.name"
              value={formData.nextOfKin.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors["nextOfKin.name"] ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter name"
            />
            {errors["nextOfKin.name"] && <p className="text-red-500 text-sm mt-1">{errors["nextOfKin.name"]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="nextOfKin.phoneNumber"
              value={formData.nextOfKin.phoneNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors["nextOfKin.phoneNumber"] ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter phone number"
            />
            {errors["nextOfKin.phoneNumber"] && <p className="text-red-500 text-sm mt-1">{errors["nextOfKin.phoneNumber"]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              name="nextOfKin.relationship"
              value={formData.nextOfKin.relationship}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors["nextOfKin.relationship"] ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
            {errors["nextOfKin.relationship"] && <p className="text-red-500 text-sm mt-1">{errors["nextOfKin.relationship"]}</p>}
          </div>
        </div>
      </div>
    </>
  );

  const renderManagerFields = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Username
      </label>
      <div className="relative">
        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.username ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter username"
        />
      </div>
      {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New {userType === "babysitter" ? "Babysitter" : "Manager"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-indigo-500" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {userType === "manager" && renderManagerFields()}
            {userType === "babysitter" && renderBabysitterFields()}
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Security
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : `Create ${userType === "babysitter" ? "Babysitter" : "Manager"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;
