import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const AddBudgetForm = ({ onClose, onBudgetAdded }) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period_type: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

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
      if (!formData.category || !formData.start_date) {
        Swal.fire("Error!", "Please fill in all required fields", "error");
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        amount: amount,
      };

      console.log("Submitting budget data:", submitData);

      const response = await axios.post(
        "http://localhost:5000/api/financial/budgets",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Budget created successfully") {
        Swal.fire("Success!", "Budget added successfully", "success");
        onBudgetAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error adding budget:", error);
      let errorMessage = "Failed to add budget";
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
            Add New Budget
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="Procurement of toys and play materials">
                    Procurement of toys and play materials
                  </option>
                  <option value="Center maintenance and repairs">
                    Center maintenance and repairs
                  </option>
                  <option value="Utility bills">Utility bills</option>
                  <option value="Babysitter salaries">
                    Babysitter salaries
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Period Type
                </label>
                <select
                  name="period_type"
                  value={formData.period_type}
                  onChange={(e) =>
                    setFormData({ ...formData, period_type: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
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
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                End Date (Optional)
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
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
                Add Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBudgetForm;
