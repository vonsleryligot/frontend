import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";
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
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);

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

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    if (isNaN(date.getTime())) return "12:00 AM";
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

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

  const handleApproveChange = async (actionId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/action-logs/${actionId}/approve`, {
        method: "PUT",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve change");
      }

      setShifts((prev) =>
        prev.map((shift) =>
          shift.id === data.shiftId
            ? { ...shift, timeIn: data.timeIn, timeOut: data.timeOut, status: "approved" }
            : shift
        )
      );

      const localKey = `shift_${data.shiftId}_status`;
      if (localStorage.getItem(localKey) === "pending") {
        localStorage.removeItem(localKey);
      }

      setActionLogs((prev) =>
        prev.map((log) =>
          log.id === actionId ? { ...log, status: "approved" } : log
        )
      );
    } catch (error) {
      console.error("Error approving change:", error);
    }
  };

  const getUserFullName = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:border-gray-800 dark:bg-white/[0.03] text-sm text-gray-700 dark:text-gray-200">
      <h2 className="text-xl font-semibold mb-4">Open Shifts</h2>

      {loading && <p className="text-center text-gray-500">Loading shifts...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

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
              shifts.map((shift) => {
                const pendingStatus = localStorage.getItem(`shift_${shift.id}_status`);
                const displayStatus = shift.status === "approved" ? "approved" : pendingStatus || shift.status;

                return (
                  <tr key={shift.id} className="hover:bg-gray-800">
                    <td className="border border-gray-300 p-3 text-sm">{getUserFullName(shift.userId)}</td>
                    <td className="border border-gray-300 p-3 text-sm">{shift.date}</td>
                    <td className="border border-gray-300 p-3 text-sm">{shift.timeIn ? formatTime(shift.timeIn) : "-"}</td>
                    <td className="border border-gray-300 p-3 text-sm">{shift.timeOut ? formatTime(shift.timeOut) : "-"}</td>
                    <td className="border border-gray-300 p-3 text-sm">{shift.totalHours || "-"}</td>
                    <td className="border border-gray-300 p-3 text-sm">{shift.shifts}</td>
                    <td className="border border-gray-300 p-3 text-sm font-semibold capitalize">{displayStatus}</td>
                    <td className="border border-gray-300 p-3 text-sm">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => setSelectedShift(shift)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  No shifts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Shift Edit Modal */}
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
            <label className="block mb-4">
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
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                onClick={() => setSelectedShift(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                onClick={handleUpdateShift}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Table */}
      {userId === 1 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
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
              {actionLogs
                .filter((log) => log.status === "pending")
                .map((log) => (
                  <tr key={log.id}>
                    <td className="border border-gray-300 p-3 text-sm">
                      {getUserFullName(log.userId)}
                    </td>
                    <td className="border border-gray-300 p-3 text-sm">{formatTime(log.timeIn)}</td>
                    <td className="border border-gray-300 p-3 text-sm">{formatTime(log.timeOut)}</td>
                    <td className="border border-gray-300 p-3 text-sm capitalize">{log.status}</td>
                    <td className="border border-gray-300 p-3 text-sm">
                      <button
                        onClick={() => handleApproveChange(log.id)}
                        className="text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
