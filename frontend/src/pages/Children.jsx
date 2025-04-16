import React, { useState, useContext, useEffect } from "react";
import { FaTimes, FaBaby, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import BabysitterActions from "../components/BabysitterActions";
import ChildDetails from "../components/ChildDetails";
import BabysitterSearch from "../components/child/BabysitterSearch";
import "../styles/auth.css";

const Children = () => {
  const { user } = useContext(AuthContext);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showChildDetails, setShowChildDetails] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [babysitters, setBabysitters] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    specialNeeds: "",
    duration: "full-day",
    assignedBabysitter: "",
  });

  const [errors, setErrors] = useState({
    parentEmail: "",
    parentPhone: "",
  });

  // Fetch children data when component mounts
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const url =
          user.role === "babysitter"
            ? `http://localhost:5000/api/children?babysitterId=${user.id}`
            : "http://localhost:5000/api/children";

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setChildren(response.data);
      } catch (error) {
        console.error("Error fetching children:", error);
        toast.error("Failed to fetch children data");
      }
    };

    fetchChildren();
  }, [user.id, user.role]);

  // Fetch babysitters when user is a manager
  useEffect(() => {
    if (user.role === "manager") {
      const fetchBabysitters = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/babysitters",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          // Map to include fullName for consistency
          const formattedBabysitters = response.data.map((babysitter) => ({
            ...babysitter,
            fullName: `${babysitter.first_name} ${babysitter.last_name}`,
          }));
          setBabysitters(formattedBabysitters);
        } catch (error) {
          console.error("Error fetching babysitters:", error);
          toast.error("Failed to fetch babysitters");
        }
      };
      fetchBabysitters();
    }
  }, [user.role]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email and phone
    const emailValid = formData.parentEmail
      ? validateEmail(formData.parentEmail)
      : true;
    const phoneValid = validatePhone(formData.parentPhone);

    if (!emailValid || !phoneValid) {
      setErrors({
        parentEmail: !emailValid ? "Please enter a valid email address" : "",
        parentPhone: !phoneValid ? "Please enter a valid phone number" : "",
      });
      setIsLoading(false);
      return;
    }

    const requestData = {
      fullName: formData.fullName,
      age: parseInt(formData.age),
      parentDetails: {
        fullName: formData.parentName,
        email: formData.parentEmail,
        phoneNumber: formData.parentPhone,
      },
      specialNeeds: formData.specialNeeds,
      sessionType: formData.duration,
      assignedBabysitter:
        user.role === "manager" ? formData.assignedBabysitter : user.id,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/children",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Child registered successfully!");
      setShowRegistrationForm(false);
      setFormData({
        fullName: "",
        age: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        specialNeeds: "",
        duration: "full-day",
        assignedBabysitter: "",
      });
      setErrors({
        parentEmail: "",
        parentPhone: "",
      });

      // Refresh the children list
      const updatedResponse = await axios.get(
        user.role === "babysitter"
          ? `http://localhost:5000/api/children?babysitterId=${user.id}`
          : "http://localhost:5000/api/children",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setChildren(updatedResponse.data);
    } catch (error) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to register child. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (name === "parentEmail" || name === "parentPhone") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleBabysitterSelect = (babysitter) => {
    setFormData((prevState) => ({
      ...prevState,
      assignedBabysitter: babysitter.id,
    }));
  };

  const handleChildDetails = async (childId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/children/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSelectedChild(response.data);
      setShowChildDetails(true);
    } catch (error) {
      console.error("Error fetching child details:", error);
      toast.error("Failed to fetch child details");
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Children</h1>
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg focus:outline-none focus:border-[#4299e1] border-2 border-transparent
             hover:bg-pink-700 transition cursor-pointer"
          >
            Register New Child
          </button>
        </div>

        {/* Slide-in Overlay */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-black/70 transition-transform duration-500 z-40 overflow-auto ${
            showRegistrationForm ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="max-w-xl mx-auto p-8 pt-16">
            <div className="bg-white rounded-lg shadow-lg relative">
              {/* Close Button */}
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="absolute top-4 right-4 w-8 h-8 flex 
                items-center justify-center rounded-full border border-pink-600
                focus:outline-none focus:border-[#4299e1] 
                 cursor-pointer hover:animate-spin hover:scale-110"
              >
                <FaTimes className="text-gray-500" />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center pt-4">
                Register New Child
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 p-8">
                <div className="space-y-1">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Child's Full Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Parent/Guardian Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="Parent/Guardian Email"
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-[#4299e1] ${
                      errors.parentEmail ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.parentEmail && (
                    <p className="text-red-500 text-sm">{errors.parentEmail}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Parent/Guardian Phone"
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-[#4299e1] ${
                      errors.parentPhone ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.parentPhone && (
                    <p className="text-red-500 text-sm">{errors.parentPhone}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <textarea
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleChange}
                    placeholder="Special Needs"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    rows="3"
                  />
                </div>
                <div className="space-y-1">
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                  >
                    <option value="half-day">Half Day</option>
                    <option value="full-day">Full Day</option>
                  </select>
                </div>
                {/* Conditional Babysitter Assignment Field for Managers */}
                {user.role === "manager" && (
                  <div className="space-y-1">
                    <span className="block text-sm font-medium text-gray-700">
                      Assign Child to
                    </span>
                    <BabysitterSearch
                      onSelect={handleBabysitterSelect}
                      currentBabysitterId={formData.assignedBabysitter}
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-pink-600 text-white rounded-lg focus:outline-none focus:border-[#4299e1] border-2 border-transparent ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-pink-700"
                    }`}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div className="mt-8">
          {children.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <FaBaby className="text-6xl text-pink-400" />
                <h3 className="text-xl font-medium text-gray-900">
                  No Children Assigned to you yet!
                </h3>
                <p className="text-gray-500">
                  Start by registering your first child now or contact manager
                  to assign you a child.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {children.map((child) => (
                  <li key={child.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                child.is_active === 1
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            />
                          </div>
                          <div className="ml-4">
                            <h2 className="text-lg font-medium text-gray-900">
                              {child.full_name}
                            </h2>
                            <p className="text-sm text-gray-500">
                              Age: {child.age} | Duration: {child.session_type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleChildDetails(child.id)}
                          className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg
                           hover:bg-pink-100 transition flex items-center space-x-2 cursor-pointer"
                        >
                          <FaInfoCircle className="text-xl" />
                          <span>View Details</span>
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Parent: {child.parent_name} ({child.parent_phone})
                        </p>
                        {child.special_care_needs && (
                          <p className="text-sm text-gray-500">
                            Special Needs: {child.special_care_needs}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Child Details Modal */}
      {showChildDetails && selectedChild && (
        <ChildDetails
          child={selectedChild}
          onClose={() => {
            setShowChildDetails(false);
            setSelectedChild(null);
          }}
          setChildren={setChildren}
          children={children}
          user={user}
        />
      )}
    </div>
  );
};

export default Children;
