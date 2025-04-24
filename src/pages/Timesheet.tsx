import { useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { formatTimeForDisplay } from "../utils/timeUtils";

interface TimesheetEntry {
  id: number;
  user: {
    firstName: string;
    lastName: string;
  };
  shift: {
    date: string;
    timeIn: string;
    timeOut: string;
    timeInImage: string | null;
    timeOutImage: string | null;
  };
  status: string;
  requestTime: string | null;
}

interface RawTimesheetEntry {
  id: number;
  account?: {
    firstName: string;
    lastName: string;
  };
  details?: string;
  timeInImage?: string;
  timeOutImage?: string;
  status?: string;
  createdAt?: string;
}

const formatDateTime = (datetime: string | null) => {
  if (!datetime) return "N/A";
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return "N/A";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

const Timesheet: React.FC = () => {
  const [timesheetData, setTimesheetData] = useState<TimesheetEntry[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [hoveredTimeIn, setHoveredTimeIn] = useState<string | null>(null);
  const [hoveredTimeOut, setHoveredTimeOut] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);  // current page number
  const [totalPages, setTotalPages] = useState(1);    // total number of pages
  const itemsPerPage = 4;  // number of items per page

  const fetchTimesheet = async () => {
    try {
      const response = await axios.get("http://localhost:4000/action-logs", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
  
      console.log("Raw API Response:", response.data);
  
      const rawData = response.data.data || response.data; // fallback if array
      const total = response.data.total || rawData.length;
  
      const formattedData = rawData
        .map((entry: RawTimesheetEntry) => {
          const user = entry.account
            ? { firstName: entry.account.firstName, lastName: entry.account.lastName }
            : { firstName: "Unknown", lastName: "" };
  
          let shiftData = {
            date: "",
            timeIn: "",
            timeOut: "",
            timeInImage: entry.timeInImage || null,
            timeOutImage: entry.timeOutImage || null
          };
  
          try {
            if (entry.details) {
              const parsedDetails = JSON.parse(entry.details);
              shiftData = {
                date: parsedDetails.date || "",
                timeIn: parsedDetails.timeIn || "",
                timeOut: parsedDetails.timeOut || "",
                timeInImage: entry.timeInImage || null,
                timeOutImage: entry.timeOutImage || null
              };
            }
          } catch (error) {
            console.error("Error parsing details:", error);
          }
  
          return {
            id: entry.id,
            user,
            shift: shiftData,
            status: entry.status || "N/A",
            requestTime: entry.createdAt || null,
          };
        })
        .sort((a: TimesheetEntry, b: TimesheetEntry) => {
          if (!a.requestTime) return 1;
          if (!b.requestTime) return -1;
          return new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime();
        });
  
      setTimesheetData(formattedData);
      setTotalPages(Math.ceil(total / itemsPerPage)); // this is important!
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    }
  };
  

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    try {
      await axios.put(`http://localhost:4000/action-logs/${id}/approve`);
      setTimesheetData([]); // Clear the history
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
      setTimesheetData([]); // Clear the history
      await fetchTimesheet();
    } catch (error) {
      console.error("Error rejecting shift change:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchTimesheet();
  }, [currentPage]);

  return (
    <>
      <PageBreadcrumb pageTitle="Home / To Do / Timesheet" />
      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-100 rounded-lg shadow-sm text-left">
           <thead className="bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:bg-white/[0.03]">
              <tr>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Employee</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Time In</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Time Out</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Request Time</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Status</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
              {timesheetData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    No timesheet data available.
                  </td>
                </tr>
              ) : (
                timesheetData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-800">
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {entry.user.firstName !== "Unknown"
                        ? `${entry.user.firstName} ${entry.user.lastName}`
                        : "Unknown User"}
                    </td>
                    <td
                      className="border border-gray-100 dark:border-gray-800 p-3 text-sm relative"
                      onMouseEnter={() => setHoveredTimeIn(entry.shift.timeInImage)}
                      onMouseLeave={() => setHoveredTimeIn(null)}
                    >
                      {formatDateTime(entry.shift.timeIn)}
                      {hoveredTimeIn === entry.shift.timeInImage && entry.shift.timeInImage && (
                        <div className="image-hover absolute top-0 left-0 mt-2">
                          <img src={entry.shift.timeInImage} alt="Time In" className="w-32 h-auto" />
                        </div>
                      )}
                    </td>
                    <td
                      className="border border-gray-100 dark:border-gray-800 p-3 text-sm relative"
                      onMouseEnter={() => setHoveredTimeOut(entry.shift.timeOutImage)}
                      onMouseLeave={() => setHoveredTimeOut(null)}
                    >
                      {formatDateTime(entry.shift.timeOut)}
                      {hoveredTimeOut === entry.shift.timeOutImage && entry.shift.timeOutImage && (
                        <div className="image-hover absolute top-0 left-0 mt-2">
                          <img src={entry.shift.timeOutImage} alt="Time Out" className="w-32 h-auto" />
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {formatDateTime(entry.requestTime)}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {entry.status || "N/A"}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
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

        {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Previous
          </button>
          <div className="flex items-center justify-center">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Timesheet;