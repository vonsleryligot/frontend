import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa"; // Import the circular arrow icon

// Define the Shift and User types for TypeScript validation
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

export default function OpenShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null); // For editing

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    }
  }, []);

  const formatTime = (time: string) => {
    const date = new Date(`${time}`); // Ensure correct date format
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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

  const handleUpdateShift = async () => {
    if (!selectedShift || !selectedShift.id) {
      console.error("No shift selected or ID is missing.");
      return;
    }
  
    try {
      console.log("Updating shift:", selectedShift); // Debug log
  
      const response = await fetch(`http://localhost:4000/attendances/${selectedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeIn: selectedShift.timeIn,
          timeOut: selectedShift.timeOut,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update shift");
      }
  
      console.log("Shift updated successfully:", data);
      setShifts((prev) =>
        prev.map((shift) =>
          shift.id === selectedShift.id ? { ...shift, ...selectedShift } : shift
        )
      );
    } catch (error) {
      console.error("Error updating shift:", error);
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

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg shadow-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
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
          <tbody className="divide-y divide-gray-200">
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-600">
                  <td className="border border-gray-300 p-3">{getUserFullName(shift.userId)}</td>
                  <td className="border border-gray-300 p-3">{shift.date}</td>
                  <td className="border border-gray-300 p-3">{shift.timeIn ? formatTime(shift.timeIn) : "-"}</td>
                  <td className="border border-gray-300 p-3">{shift.timeOut ? formatTime(shift.timeOut) : "-"}</td>
                  <td className="border border-gray-300 p-3">{shift.totalHours ? parseFloat(shift.totalHours).toFixed(2) : "-"}</td>
                  <td className="border border-gray-300 p-3">{shift.shifts}</td>
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
      {/* Edit Shift Modal */}
{selectedShift && (
  <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 p-4 ">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      {/* Close Button */}
      <button 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setSelectedShift(null)}
      >
        ✕
      </button>

      <h3 className="text-xl font-semibold mb-4">Edit Shift</h3>

      <div className="mb-4">
        <label className="block font-medium mb-1">Time In:</label>
        <input
          type="time"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedShift.timeIn || ""}
          onChange={(e) => setSelectedShift({ ...selectedShift, timeIn: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Time Out:</label>
        <input
          type="time"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedShift.timeOut || ""}
          onChange={(e) => setSelectedShift({ ...selectedShift, timeOut: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => setSelectedShift(null)}
        >
          Cancel
        </button>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleUpdateShift}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}