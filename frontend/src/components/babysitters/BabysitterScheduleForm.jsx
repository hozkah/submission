import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BabysitterScheduleForm = ({ babysitterId, onScheduleCreated }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sessionType, setSessionType] = useState("full-day");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/babysitters/${babysitterId}/schedule`,
        {
          date: selectedDate,
          startTime: startTime,
          endTime: endTime,
          sessionType: sessionType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message with both schedule and payment details
      await Swal.fire({
        icon: "success",
        title: "Schedule Created",
        html: `
          <div class="text-left">
            <p><strong>Schedule Details:</strong></p>
            <p>Date: ${new Date(
              response.data.schedule.date
            ).toLocaleDateString()}</p>
            <p>Time: ${response.data.schedule.start_time} - ${
          response.data.schedule.end_time
        }</p>
            <p>Session Type: ${response.data.schedule.session_type}</p>
            <p>Children Count: ${
              response.data.schedule.children_assigned_count
            }</p>
            <hr class="my-2">
            <p><strong>Payment Details:</strong></p>
            <p>Amount: UGX ${response.data.payment.amount.toLocaleString()}</p>
            <p>Status: ${response.data.payment.status}</p>
          </div>
        `,
      });

      // Reset form
      setSelectedDate("");
      setStartTime("");
      setEndTime("");
      setSessionType("full-day");

      // Refresh schedules list
      if (onScheduleCreated) {
        onScheduleCreated();
      }
    } catch (error) {
      console.error("Error creating schedule:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Babysitter Not Found",
          text: "The selected babysitter could not be found or is inactive.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create schedule. Please try again.",
        });
      }
    }
  };

  return <div>{/* Form content */}</div>;
};

export default BabysitterScheduleForm;
