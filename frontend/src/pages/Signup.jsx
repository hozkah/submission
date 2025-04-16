import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaIdCard,
  FaBirthdayCake,
  FaUserFriends,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";
import TransitionalBackground from "../components/TransitionalBackground";
import "../styles/Auth.css";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nin: "",
    dateOfBirth: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelationship: "",
    password: "",
    confirmPassword: "",
  });

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validatePhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");
    // Check if it starts with 07 and has 10 digits
    return /^07\d{8}$/.test(cleanPhone);
  };

  const validateNIN = (nin) => {
    // Check if it's exactly 14 characters and contains only uppercase letters and numbers
    return /^[A-Z0-9]{14}$/.test(nin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate phone numbers
    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error("Invalid phone number");
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.nextOfKinPhone)) {
      toast.error("Invalid next of kin phone number");
      setIsLoading(false);
      return;
    }

    // Validate NIN
    if (!validateNIN(formData.nin)) {
      toast.error("Invalid NIN");
      setIsLoading(false);
      return;
    }

    // Validate age
    const age = calculateAge(formData.dateOfBirth);
    if (age < 21 || age > 35) {
      toast.error("Babysitter must be between 21 and 35 years old");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Validate next of kin information
    if (
      !formData.nextOfKinName ||
      !formData.nextOfKinPhone ||
      !formData.nextOfKinRelationship
    ) {
      toast.error("Please fill in all next of kin information");
      setIsLoading(false);
      return;
    }

    try {
      const response = await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        "babysitter",
        {
          phoneNumber: formData.phoneNumber.replace(/\D/g, ""), // Remove non-digits
          nin: formData.nin.toUpperCase(), // Ensure uppercase
          dateOfBirth: formData.dateOfBirth,
          nextOfKin: {
            name: formData.nextOfKinName,
            phone: formData.nextOfKinPhone,
            relationship: formData.nextOfKinRelationship,
          },
        }
      );

      toast.success("Registration successful!");
      navigate("/dashboard"); // Navigate directly to dashboard
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="signup-container">
      <TransitionalBackground />
      <div className="signup-content max-w-6xl w-full m-6">
        <div className="text-center mb-8">
          <h2 className="signup-title text-3xl font-extrabold mb-2">
            Babysitter Registration
          </h2>
          <p className="signup-subtitle text-sm">Join Daystar Daycare today</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FaUser className="text-purple-500 text-xl" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="signup-input w-full"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="nin"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    National ID Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="text-gray-400" />
                    </div>
                    <input
                      id="nin"
                      name="nin"
                      type="text"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter your NIN"
                      value={formData.nin}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBirthdayCake className="text-gray-400" />
                    </div>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      className="signup-input w-full pl-12 py-2 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-80"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Must be between 21-35 years old
                  </p>
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FaUserFriends className="text-purple-500 text-xl" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Next of Kin Information
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="nextOfKinName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Next of Kin Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      id="nextOfKinName"
                      name="nextOfKinName"
                      type="text"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter next of kin name"
                      value={formData.nextOfKinName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="nextOfKinPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Next of Kin Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      id="nextOfKinPhone"
                      name="nextOfKinPhone"
                      type="tel"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter next of kin phone"
                      value={formData.nextOfKinPhone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="nextOfKinRelationship"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUserFriends className="text-gray-400" />
                    </div>
                    <input
                      id="nextOfKinRelationship"
                      name="nextOfKinRelationship"
                      type="text"
                      required
                      className="signup-input w-full pl-12"
                      placeholder="Enter relationship"
                      value={formData.nextOfKinRelationship}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FaLock className="text-purple-500 text-xl" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Security
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="signup-input w-full pl-12 pr-10"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => togglePasswordVisibility("password")}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="signup-input w-full pl-12 pr-10"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                {/* <div className="flex items-center mt-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="custom-checkbox"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      I agree to the terms and conditions
                    </span>
                  </label>
                </div> */}
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <button
                  type="submit"
                  className="signup-button w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-md cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <span className="text-sm text-gray-600">
                    Already have an account?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-sm underline font-medium text-pink-600 hover:text-pink-500 focus:outline-none cursor-pointer"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
