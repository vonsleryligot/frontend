import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { formatTimeForDisplay, calculateTotalHours } from "../utils/timeUtils";

interface Shift {
  id: number;
  userId: number;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  totalHours: string | null;
  shifts: string;
  status: string;
  imageId: string | null;
  timeOutImageId: string | null;
  employmentType?: string;
}

interface ActionLog {
  id: number;
  userId: number;
  shiftId: number;
  timeIn: string;
  timeOut: string;
  status: string;
  details: string;
}

export default function RegularShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isRegularEmployee, setIsRegularEmployee] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      
      fetch(`http://localhost:4000/employments/account/${user.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch employment data: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((employmentData) => {
          if (employmentData.employmentType) {
            const isRegular = employmentData.employmentType.toLowerCase() === "regular";
            setIsRegularEmployee(isRegular);
          } else {
            setIsRegularEmployee(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching employment data:", error);
          setIsRegularEmployee(false);
        });
    }
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const response = await fetch(`http://localhost:4000/attendances?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch attendance records");
  
        const data: Shift[] = await response.json();

        const employmentResponse = await fetch(`http://localhost:4000/employments/account/${userId}`);
        if (!employmentResponse.ok) throw new Error("Failed to fetch employment data");
        const employmentData = await employmentResponse.json();
  
        const sortedShifts = data.sort((a, b) => {
          if (a.timeIn && b.timeIn) {
            return new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime();
          }
          return a.timeIn ? -1 : 1;
        });

        const shiftsWithEmploymentType = sortedShifts.map(shift => ({
          ...shift,
          employmentType: employmentData.employmentType
        }));
  
        setShifts(shiftsWithEmploymentType);
      } catch (error) {
        setError("Error fetching attendance records.");
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (userId !== null && isRegularEmployee) {
      fetchAttendance();
    }
  }, [userId, isRegularEmployee]);

  useEffect(() => {
    const fetchActionLogs = async () => {
      try {
        const response = await fetch("http://localhost:4000/action-logs");
        if (!response.ok) throw new Error("Failed to fetch action logs");
        const data: ActionLog[] = await response.json();
        setActionLogs(data);
      } catch (error) {
        console.error("Error fetching action logs:", error);
      }
    };
    fetchActionLogs();
  }, []);

  const handleUpdateShift = async () => {
    if (!selectedShift || !selectedShift.id) return;
  
    try {
      const shiftDate = selectedShift.date;
      const formattedTimeIn = `${shiftDate}T${selectedShift.timeIn}`;
      const formattedTimeOut = `${shiftDate}T${selectedShift.timeOut}`;
  
      const actionLogResponse = await fetch("http://localhost:4000/action-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftId: selectedShift.id,
          userId: selectedShift.userId,
          timeIn: formattedTimeIn,
          timeOut: formattedTimeOut,
          status: "pending",
        }),
      });
  
      const actionLogData = await actionLogResponse.json();
      if (!actionLogResponse.ok) {
        throw new Error(actionLogData.message || "Failed to create action log");
      }
  
      setShifts((prev) =>
        prev.map((shift) =>
          shift.id === selectedShift.id 
            ? { 
                ...shift, 
                status: "pending",
                employmentType: selectedShift.employmentType
              } 
            : shift
        )
      );
  
      const response = await fetch(`http://localhost:4000/attendances?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch updated attendance records");
  
      const data: Shift[] = await response.json();
  
      const employmentResponse = await fetch(`http://localhost:4000/employments/account/${userId}`);
      if (!employmentResponse.ok) throw new Error("Failed to fetch employment data");
      const employmentData = await employmentResponse.json();
  
      const sortedShifts = data.sort((a, b) => {
        if (a.timeIn && b.timeIn) {
          return new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime();
        }
        return a.timeIn ? -1 : 1;
      });
  
      const shiftsWithEmploymentType = sortedShifts.map(shift => ({
        ...shift,
        employmentType: employmentData.employmentType
      }));
  
      setShifts(shiftsWithEmploymentType);
  
      toast.success("Shift update request submitted!", {
        position: "bottom-right",
        autoClose: 3000,
      });
  
      setSelectedShift(null);
    } catch (error) {
      console.error("Error creating action log:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const getActionLogStatus = (shiftId: number, originalStatus: string) => {
    const log = actionLogs.find(log => {
      try {
        const details = JSON.parse(log.details);
        return details.shiftId === shiftId;
      } catch (e) {
        return false;
      }
    });
    return log ? log.status : originalStatus;
  };

  // Pagination Logic
  const indexOfLastShift = currentPage * itemsPerPage;
  const indexOfFirstShift = indexOfLastShift - itemsPerPage;
  const currentShifts = shifts.slice(indexOfFirstShift, indexOfLastShift);
  const totalPages = Math.ceil(shifts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (!isRegularEmployee) {
    return (
      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        <p className="text-center text-red-500">This page is only accessible to regular employees.</p>
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Hours / Regular Logs" />
      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        {loading && <p className="text-center text-gray-500">Loading shifts...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="overflow-hidden">
          <table className="w-full border border-gray-100 rounded-lg shadow-sm text-left">
            <thead className="bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:bg-white/[0.03]">
              <tr>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Date</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Time In</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Time Out</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Total Hours</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Employment Type</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Status</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentShifts.map((shift) => {
                const actionLogStatus = getActionLogStatus(shift.id, shift.status);
                const displayStatus = actionLogs.some(log => {
                  try {
                    const details = JSON.parse(log.details);
                    return details.shiftId === shift.id;
                  } catch (e) {
                    return false;
                  }
                }) ? actionLogStatus : shift.status;

                return (
                  <tr key={shift.id} className="hover:bg-gray-800">
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {new Date(shift.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm relative group">
                      {formatTimeForDisplay(shift.timeIn)}
                      {shift.imageId && (
                        <img
                          src={`http://localhost:4000/uploads/${shift.imageId}`}
                          alt="Time In"
                          className="absolute inset-0 w-20 h-20 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 ease-in-out"
                          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                        />
                      )}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm relative group">
                      {formatTimeForDisplay(shift.timeOut)}
                      {shift.timeOutImageId && (
                        <img
                          src={`http://localhost:4000/uploads/${shift.timeOutImageId}`}
                          alt="Time Out"
                          className="absolute inset-0 w-20 h-20 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 ease-in-out"
                          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                        />
                      )}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {calculateTotalHours(shift.timeIn, shift.timeOut)}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {shift.employmentType || "Not Available"}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        displayStatus === "approved" ? "bg-green-100 text-green-800" :
                        displayStatus === "rejected" ? "bg-red-100 text-red-800" :
                        displayStatus === "pending" ? " text-yellow-800" :
                        "text-gray-800"
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => setSelectedShift(shift)}
                        disabled={displayStatus === "approved"}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>

        {selectedShift && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm w-full text-sm">
              <h3 className="text-lg font-semibold mb-4">Edit Shift</h3>
              <label className="block mb-2">
                Time In:
                <input
                  type="time"
                  className="w-full border p-2 mt-1 text-sm"
                  value={selectedShift.timeIn || ""}
                  onChange={(e) =>
                    setSelectedShift({ ...selectedShift, timeIn: e.target.value })
                  }
                />
              </label>
              <label className="block mb-2">
                Time Out:
                <input
                  type="time"
                  className="w-full border p-2 mt-1 text-sm"
                  value={selectedShift.timeOut || ""}
                  onChange={(e) =>
                    setSelectedShift({ ...selectedShift, timeOut: e.target.value })
                  }
                />
              </label>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleUpdateShift}
                >
                  Submit
                </button>
                <button
                  className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setSelectedShift(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </>
  );
}