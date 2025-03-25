import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa"; // Import the circular arrow icon
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Shift {
  id: number;
  userId: number;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  totalHours: string | null;
  shifts: string;
  status: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface ActionLog {
  id: number;
  shiftId: number;
  userId: number;
  timeIn: string;
  timeOut: string;
  status: string; // 'pending' or 'approved'
}

export default function OpenShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null); // For editing
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]); // For admin to approve changes

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:4000/accounts");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:4000/attendances");
        if (!response.ok) throw new Error("Failed to fetch attendance records");
        const data: Shift[] = await response.json();
        const filteredShifts = userId === 1 ? data : data.filter((shift) => shift.userId === userId);
        setShifts(filteredShifts);
      } catch (error) {
        setError("Error fetching attendance records.");
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId !== null) {
      fetchAttendance();
    }
  }, [userId]);

  // Fetch action logs for admin approval
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

  // Function to format time to 12-hour AM/PM format
  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return "12:00 AM"; // Return default value if invalid
    }
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12; // Convert 24-hour time to 12-hour format
    hours = hours ? hours : 12; // 0 becomes 12
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handle updating a shift and logging the change for approval
  const handleUpdateShift = async () => {
    if (!selectedShift || !selectedShift.id) {
      console.error("No shift selected or ID is missing.");
      return;
    }
  
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
  
      toast.success("Shift update request submitted!", {
        position: "bottom-right",
        autoClose: 3000,
      });
  
      setShifts((prev) =>
        prev.map((shift) =>
          shift.id === selectedShift.id ? { ...shift, status: "pending" } : shift
        )
      );
  
      setSelectedShift(null);
    } catch (error) {
      console.error("Error creating action log:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };  
  // // Handle approving the change
  // const handleApproveChange = async (actionId: number) => {
  //   try {
  //     const response = await fetch(`http://localhost:4000/action-logs/${actionId}/approve`, {
  //       method: "PUT",
  //     });

  //     const data = await response.json();
  //     if (!response.ok) {
  //       throw new Error(data.message || "Failed to approve change");
  //     }

  //     console.log("Change approved successfully:", data);
  //     // Optionally, update the UI
  //     setActionLogs((prev) =>
  //       prev.map((log) =>
  //         log.id === actionId ? { ...log, status: "approved" } : log
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error approving change:", error);
  //   }
  // };
  const getUserFullName = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:border-gray-800 dark:bg-white/[0.03] text-sm text-gray-700 dark:text-gray-200">
      <h2 className="text-xl font-semibold mb-4">Open Shifts</h2>

      {loading && <p className="text-center text-gray-500">Loading shifts...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg shadow-sm text-left">
          <thead className="bg-gray-100 dark:text-gray-300 dark:bg-white/[0.03]">
            <tr>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Employee</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Date</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Time In</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Time Out</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Total Hours</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Shifts</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Status</th>
              <th className="border border-gray-300 p-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-800">
                  <td className="border border-gray-300 p-3 text-sm">{getUserFullName(shift.userId)}</td>
                  <td className="border border-gray-300 p-3 text-sm">{shift.date}</td>
                  <td className="border border-gray-300 p-3 text-sm">{shift.timeIn ? formatTime(shift.timeIn) : "-"}</td>
                  <td className="border border-gray-300 p-3 text-sm">{shift.timeOut ? formatTime(shift.timeOut) : "-"}</td>
                  <td className="border border-gray-300 p-3 text-sm">{shift.totalHours ? parseFloat(shift.totalHours).toFixed(2) : "-"}</td>
                  <td className="border border-gray-300 p-3 text-sm">{shift.shifts}</td>
                  <td className="border border-gray-300 p-4 items-center">
                    {shift.status}
                    <FaSyncAlt
                      className="text-blue-500 cursor-pointer ml-2"
                      onClick={() => setSelectedShift(shift)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-500">
                  No open shifts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Shift Modal */}
      {selectedShift && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedShift(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Update Shift</h2>

            <div className="mb-4">
              <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Time In
              </label>
              <input
                type="time"
                id="timeIn"
                value={selectedShift.timeIn || ""}
                onChange={(e) => setSelectedShift({ ...selectedShift, timeIn: e.target.value })}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Time Out
              </label>
              <input
                type="time"
                id="timeOut"
                value={selectedShift.timeOut || ""}
                onChange={(e) => setSelectedShift({ ...selectedShift, timeOut: e.target.value })}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              onClick={handleUpdateShift}
              className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Update Shift
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
