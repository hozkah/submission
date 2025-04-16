import React, { useState } from 'react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report' },
    { id: 'financial', name: 'Financial Report' },
    { id: 'babysitter', name: 'Babysitter Performance' },
    { id: 'incidents', name: 'Incident Reports' },
  ];

  const attendanceData = [
    { date: '2024-04-01', present: 18, absent: 6, total: 24 },
    { date: '2024-04-02', present: 20, absent: 4, total: 24 },
    { date: '2024-04-03', present: 19, absent: 5, total: 24 },
    { date: '2024-04-04', present: 21, absent: 3, total: 24 },
  ];

  const financialData = [
    { month: 'January', income: 2400000, expenses: 1800000, net: 600000 },
    { month: 'February', income: 2600000, expenses: 1900000, net: 700000 },
    { month: 'March', income: 2500000, expenses: 1850000, net: 650000 },
    { month: 'April', income: 2700000, expenses: 1950000, net: 750000 },
  ];

  const babysitterData = [
    {
      name: 'Jane Doe',
      childrenAssigned: 3,
      attendance: '95%',
      incidents: 0,
      performance: 'Excellent',
    },
    {
      name: 'Mary Smith',
      childrenAssigned: 2,
      attendance: '90%',
      incidents: 1,
      performance: 'Good',
    },
  ];

  const incidentData = [
    {
      date: '2024-04-01',
      child: 'Sarah Johnson',
      type: 'Minor Injury',
      description: 'Scraped knee during outdoor play',
      reportedBy: 'Jane Doe',
      status: 'Resolved',
    },
    {
      date: '2024-04-03',
      child: 'Michael Brown',
      type: 'Allergic Reaction',
      description: 'Mild reaction to peanuts',
      reportedBy: 'Mary Smith',
      status: 'Resolved',
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
    }).format(amount);
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'attendance':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((row) => (
                  <tr key={row.date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((row.present / row.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'financial':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Income
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financialData.map((row) => (
                  <tr key={row.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(row.income)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(row.expenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'babysitter':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Children Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incidents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {babysitterData.map((row) => (
                  <tr key={row.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.childrenAssigned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.attendance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.incidents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.performance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'incidents':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidentData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.child}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.reportedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={`${
                      selectedReport === type.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="mt-8">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports; 