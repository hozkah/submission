import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import ChildSearch from "./ChildSearch";

const AddTransactionForm = ({ onClose, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    child_id: null,
  });

  const [showChildSearch, setShowChildSearch] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error!", "Please log in to continue", "error");
        return;
      }

      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        Swal.fire("Error!", "Please enter a valid amount", "error");
        return;
      }

      // Validate required fields
      if (!formData.category || !formData.description) {
        Swal.fire("Error!", "Please fill in all required fields", "error");
        return;
      }

      // If category is parent-payment, child_id is required
      if (formData.category === "parent-payment" && !formData.child_id) {
        Swal.fire(
          "Error!",
          "Please select a child for parent payment",
          "error"
        );
        return;
      }

      // Prepare data for submission
      const submitData = {
        type: formData.type,
        category: formData.category,
        amount: amount,
        description: formData.description,
        date: formData.date,
        child_id:
          formData.category === "parent-payment" ? formData.child_id : null,
      };

      console.log("Submitting data:", submitData); // Debug log

      const response = await axios.post(
        "http://localhost:5000/api/financial/transactions",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data); // Debug log

      if (response.data.message === "Transaction recorded successfully") {
        Swal.fire("Success!", "Transaction added successfully", "success");
        onTransactionAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      console.error("Error response:", error.response?.data); // Debug log
      let errorMessage = "Failed to add transaction";
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Please log in to continue";
            break;
          case 400:
            errorMessage = error.response.data.error || "Invalid data provided";
            if (error.response.data.errors) {
              errorMessage = error.response.data.errors
                .map((err) => err.msg)
                .join(", ");
            }
            break;
          case 500:
            errorMessage = "Server error. Please try again later";
            break;
          default:
            errorMessage = error.response.data.error || errorMessage;
        }
      }
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const handleChildSelect = (child) => {
    console.log("Selected child:", child); // Debug log
    if (!child || !child.id) {
      console.error("Invalid child data received:", child);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      child_id: child.id,
    }));
    setSelectedChild({
      id: child.id,
      full_name: child.full_name, // Use full_name instead of first_name/last_name
    });
    setShowChildSearch(false);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    console.log("Type changed to:", newType); // Debug log
    setFormData({
      ...formData,
      type: newType,
      category: "", // Reset category when type changes
      child_id: null, // Reset child_id when type changes
    });
    setSelectedChild(null); // Reset selected child when type changes
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
            Add New Transaction
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {formData.type === "income" ? (
                    <option value="parent-payment">Parent Payment</option>
                  ) : (
                    <>
                      <option value="Procurement of toys and play materials">
                        Procurement of toys and play materials
                      </option>
                      <option value="Center maintenance and repairs">
                        Center maintenance and repairs
                      </option>
                      <option value="Utility bills">Utility bills</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                />
              </div>
            </div>

            {formData.category === "parent-payment" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Child
                </label>
                {showChildSearch ? (
                  <ChildSearch
                    onSelect={handleChildSelect}
                    currentChildId={formData.child_id}
                  />
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowChildSearch(true)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-indigo-500"
                    >
                      {selectedChild
                        ? "Change selected child"
                        : "Select a child"}
                    </button>
                    {selectedChild && (
                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <p className="text-sm text-indigo-700">
                          Selected: {selectedChild.full_name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                placeholder="Enter description"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none cursor-pointer"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionForm;
