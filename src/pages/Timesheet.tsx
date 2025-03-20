import React from "react";

const Timesheet: React.FC = () => {
  // Sample timesheet data
  const timesheetData = [
    { date: "2025-03-21", hoursWorked: 8, status: "Approved" },
    { date: "2025-03-20", hoursWorked: 7, status: "Pending" },
    { date: "2025-03-19", hoursWorked: 9, status: "Approved" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Timesheet</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">Time In</th>
            <th className="border p-2">Time Out</th>
            <th className="border p-2">Hours Worked</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {timesheetData.map((entry, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">{entry.date}</td>
              <td className="border p-2">{entry.hoursWorked}</td>
              <td className="border p-2">{entry.status}</td>
              <td className="border p-2">{entry.status}</td>
              <td className="border p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Timesheet;
