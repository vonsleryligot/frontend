import { useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

interface TimesheetEntry {
  id: number;
  user: {
    firstName: string;
    lastName: string;
  };
  shift: {
    timeIn: string | null;
    timeOut: string | null;
    timeInImage: string | null;  // URL for Time In Image
    timeOutImage: string | null; // URL for Time Out Image
  };
  status: string;
}

const Timesheet: React.FC = () => {
  const [timesheetData, setTimesheetData] = useState<TimesheetEntry[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [hoveredTimeIn, setHoveredTimeIn] = useState<string | null>(null);
  const [hoveredTimeOut, setHoveredTimeOut] = useState<string | null>(null);

  const fetchTimesheet = async () => {
    try {
      const response = await axios.get("http://localhost:4000/action-logs");
      console.log("Raw API Response:", response.data);
      const formattedData = response.data.map((entry: any) => {
        const user = entry.account
          ? { firstName: entry.account.firstName, lastName: entry.account.lastName }
          : { firstName: "Unknown", lastName: "" };

        const timeMatch = entry.details?.match(/Time In - (.*?), Time Out - (.*)/);
        const timeIn = timeMatch ? timeMatch[1] : null;
        const timeOut = timeMatch ? timeMatch[2] : null;

        // Assuming your database returns timeInImage and timeOutImage URLs
        const timeInImage = entry.timeInImage || null;  // Image URL for Time In
        const timeOutImage = entry.timeOutImage || null;  // Image URL for Time Out

        return {
          id: entry.id,
          user,
          shift: { timeIn, timeOut, timeInImage, timeOutImage },
          status: entry.status || "N/A",
        };
      });

      setTimesheetData(formattedData);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    }
  };

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    try {
      await axios.put(`http://localhost:4000/action-logs/${id}/approve`);
      await fetchTimesheet();
    } catch (error) {
      console.error("Error approving shift change:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setLoadingId(id);
    try {
      await axios.put(`http://localhost:4000/action-logs/${id}/reject`);
      await fetchTimesheet();
    } catch (error) {
      console.error("Error rejecting shift change:", error);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchTimesheet();
  }, []);

  return (
    <>
     <PageBreadcrumb pageTitle="Home / To Do / TimeSheet" />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">Timesheet</h2>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-sm text-left">
            <thead className="bg-gray-100 dark:text-gray-300 dark:bg-white/[0.03]">
              <tr>
                <th className="border border-gray-300 p-3 text-sm font-semibold">Employee</th>
                <th className="border border-gray-300 p-3 text-sm font-semibold">Time In</th>
                <th className="border border-gray-300 p-3 text-sm font-semibold">Time Out</th>
                <th className="border border-gray-300 p-3 text-sm font-semibold">Status</th>
                <th className="border border-gray-300 p-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
              {timesheetData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No timesheet data available.
                  </td>
                </tr>
              ) : (
                timesheetData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-800">
                    <td className="border border-gray-300 p-3 text-sm">
                      {entry.user.firstName !== "Unknown"
                        ? `${entry.user.firstName} ${entry.user.lastName}`
                        : "Unknown User"}
                    </td>
                    <td
                      className="border border-gray-300 p-3 text-sm relative"
                      onMouseEnter={() => setHoveredTimeIn(entry.shift.timeInImage)}
                      onMouseLeave={() => setHoveredTimeIn(null)}
                    >
                      {entry.shift.timeIn ? new Date(entry.shift.timeIn).toLocaleTimeString() : "N/A"}
                      {hoveredTimeIn === entry.shift.timeInImage && entry.shift.timeInImage && (
                        <div className="image-hover absolute top-0 left-0 mt-2">
                          <img src={entry.shift.timeInImage} alt="Time In" className="w-32 h-auto" />
                        </div>
                      )}
                    </td>
                    <td
                      className="border border-gray-300 p-3 text-sm relative"
                      onMouseEnter={() => setHoveredTimeOut(entry.shift.timeOutImage)}
                      onMouseLeave={() => setHoveredTimeOut(null)}
                    >
                      {entry.shift.timeOut ? new Date(entry.shift.timeOut).toLocaleTimeString() : "N/A"}
                      {hoveredTimeOut === entry.shift.timeOutImage && entry.shift.timeOutImage && (
                        <div className="image-hover absolute top-0 left-0 mt-2">
                          <img src={entry.shift.timeOutImage} alt="Time Out" className="w-32 h-auto" />
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-sm">
                      {entry.status || "N/A"}
                    </td>
                    <td className="border border-gray-300 p-3 text-sm">
                      {entry.status === "pending" ? (
                        <div className="flex space-x-2">
                          <button
                            className={`bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center justify-center ${
                              loadingId === entry.id ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() => handleApprove(entry.id)}
                            disabled={loadingId === entry.id}
                          >
                            {loadingId === entry.id ? (
                              <svg
                                className="animate-spin h-4 w-4 text-white"
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
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                ></path>
                              </svg>
                            ) : (
                              "Approve"
                            )}
                          </button>
                          <button
                            className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center justify-center ${
                              loadingId === entry.id ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() => handleReject(entry.id)}
                            disabled={loadingId === entry.id}
                          >
                            {loadingId === entry.id ? (
                              <svg
                                className="animate-spin h-4 w-4 text-white"
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
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                ></path>
                              </svg>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      ) : entry.status === "approved" ? (
                        <span className="text-green-600 font-medium">Approved</span>
                      ) : entry.status === "rejected" ? (
                        <span className="text-red-600 font-medium">Rejected</span>
                      ) : (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Timesheet;