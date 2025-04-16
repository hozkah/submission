import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaTrash,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUserFriends,
  FaUserTie,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const BabysitterInfoPanel = ({
  babysitter,
  onClose,
  onDelete,
  onAssignChildren,
}) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [assignedChildren, setAssignedChildren] = useState([]);

  // Fetch children data from backend
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/children", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChildren(response.data);
        setFilteredChildren(response.data);
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    };

    fetchChildren();
  }, []);

  // Update filtered children when search term changes
  useEffect(() => {
    const filtered = children.filter((child) =>
      child.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChildren(filtered);
  }, [searchTerm, children]);

  // Update assigned children when babysitter changes
  useEffect(() => {
    if (babysitter?.id) {
      const fetchAssignedChildren = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:5000/api/children?babysitterId=${babysitter.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setAssignedChildren(response.data.map((child) => child.id));
        } catch (error) {
          console.error("Error fetching assigned children:", error);
        }
      };
      fetchAssignedChildren();
    }
  }, [babysitter]);

  const handleDelete = async () => {
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
        await onDelete(babysitter.id);
        Swal.fire("Deleted!", "The babysitter has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete babysitter.", "error");
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // Update each child with the new babysitter ID
      for (const childId of selectedChildren) {
        await axios.put(
          `http://localhost:5000/api/children/${childId}`,
          {
            assignedBabysitterId: babysitter.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Update local state
      const updatedAssignedChildren = [
        ...assignedChildren,
        ...selectedChildren,
      ];
      setAssignedChildren(updatedAssignedChildren);
      onAssignChildren(babysitter.id, updatedAssignedChildren);

      // Reset form
      setShowAssignForm(false);
      setSelectedChildren([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error assigning children:", error);
    }
  };

  const toggleChildSelection = (childId) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleRemoveChild = async (childId) => {
    try {
      const token = localStorage.getItem("token");
      // Update the child to remove babysitter assignment
      await axios.put(
        `http://localhost:5000/api/children/${childId}`,
        {
          assignedBabysitterId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      const updated = assignedChildren.filter((id) => id !== childId);
      setAssignedChildren(updated);
      onAssignChildren(babysitter.id, updated);
    } catch (error) {
      console.error("Error removing child:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-40 animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-center min-h-full py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-4xl relative animate-slide-up my-12">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-purple-600 focus:outline-none focus:border-purple-500 cursor-pointer hover:animate-spin hover:scale-110"
          >
            <FaTimes className="text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Babysitter Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info and Next of Kin */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {babysitter.first_name} {babysitter.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{babysitter.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaPhone className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{babysitter.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaIdCard className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">NIN</p>
                  <p className="font-medium">{babysitter.nin}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaUserFriends className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{babysitter.age}</p>
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Next of Kin
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FaUserTie className="text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">
                        {babysitter.next_of_kin_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">
                        {babysitter.next_of_kin_phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Assigned Children */}
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Assigned Children
                  </h3>
                  <button
                    onClick={() => setShowAssignForm(!showAssignForm)}
                    className="text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Assign
                  </button>
                </div>

                {/* Assign Children Form */}
                {showAssignForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search children..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="mb-4 max-h-40 overflow-y-auto">
                      {filteredChildren.map((child) => (
                        <div
                          key={child.id}
                          className={`p-2 cursor-pointer rounded-md ${
                            selectedChildren.includes(child.id)
                              ? "bg-purple-50 text-purple-600"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleChildSelection(child.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedChildren.includes(child.id)}
                              onChange={() => toggleChildSelection(child.id)}
                              className="mr-2"
                            />
                            <span>
                              {child.full_name} (Age: {child.age})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAssignForm(false);
                          setSearchTerm("");
                          setSelectedChildren([]);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignSubmit}
                        className="px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Assign Selected
                      </button>
                    </div>
                  </div>
                )}

                {/* Assigned Children List */}
                {assignedChildren.length > 0 ? (
                  <div className="space-y-2">
                    {assignedChildren.map((childId) => {
                      const child = children.find((c) => c.id === childId);
                      return child ? (
                        <div
                          key={childId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center">
                            <FaUser className="text-gray-400 mr-2" />
                            <span>{child.full_name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveChild(childId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No children assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center px-4 py-2 
              border-1 rounded-md  text-sm font-medium text-red-600 
               hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
               focus:ring-red-500 cursor-pointer"
            >
              <FaTrash className="mr-2" />
              Delete Babysitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabysitterInfoPanel;
