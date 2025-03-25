import { useEffect, useState } from "react";
import axios from "axios";

interface TimesheetEntry {
  id: number;
  user: {
    fullName: string;
  };
  shift: {
    timeIn: string;
    timeOut: string;
  };
  status: string;
}

const Timesheet: React.FC = () => {
  const [timesheetData, setTimesheetData] = useState<TimesheetEntry[]>([]);

  const fetchTimesheet = async () => {
    try {
      console.log("Fetching action logs...");
      const response = await axios.get("http://localhost:4000/action-logs");
      console.log("Response Data:", response.data);
      setTimesheetData(response.data);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    }
  };

  useEffect(() => {
    fetchTimesheet();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Timesheet</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">User</th>
            <th className="border p-2">Time In</th>
            <th className="border p-2">Time Out</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {timesheetData.length === 0 ? (
            <tr>
              <td colSpan={4} className="border p-2 text-center text-gray-500">
                No timesheet data available.
              </td>
            </tr>
          ) : (
            timesheetData.map((entry) => (
              <tr key={entry.id} className="text-center">
                <td className="border p-2">{entry.user?.fullName || "Unknown"}</td>
                <td className="border p-2">
                  {entry.shift?.timeIn
                    ? new Date(entry.shift.timeIn).toLocaleTimeString()
                    : "N/A"}
                </td>
                <td className="border p-2">
                  {entry.shift?.timeOut
                    ? new Date(entry.shift.timeOut).toLocaleTimeString()
                    : "N/A"}
                </td>
                <td className="border p-2">{entry.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Timesheet;
