import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BabysitterSchedules = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/babysitters/schedules',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  const handleStatusUpdate = async (scheduleId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/babysitters/schedules/${scheduleId}/status`,
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === 'Status updated successfully') {
        setSchedules(schedules.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, status: 'approved' }
            : schedule
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Babysitter
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Session Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Children Assigned
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {schedule.first_name} {schedule.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(schedule.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {schedule.start_time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {schedule.end_time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {schedule.session_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {schedule.children_assigned_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleStatusUpdate(schedule.id, schedule.status)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    schedule.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200'
                  }`}
                >
                  {schedule.status}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BabysitterSchedules; 