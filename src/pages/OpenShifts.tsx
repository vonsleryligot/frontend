import { useState, useEffect } from "react";

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

  // Fetch user ID from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    }
  }, []);

  const formatTime = (time: string) => {
    const date = new Date(`${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  

  // Fetch user details
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

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:4000/attendances");
        if (!response.ok) throw new Error("Failed to fetch attendance records");

        const data: Shift[] = await response.json();

        // If userId is 1 (admin), show all shifts; otherwise, show only user's shifts
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

  // Handle Time Out
  const handleTimeOut = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeOut: new Date().toLocaleTimeString(),
          status: "Completed",
        }),
      });

      if (!response.ok) throw new Error("Time Out failed");

      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === id
            ? { ...shift, timeOut: new Date().toLocaleTimeString(), status: "Completed" }
            : shift
        )
      );

      console.log("Time Out successful!");
    } catch (error) {
      console.error("Error during Time Out:", error);
      setError("Error updating time out.");
    }
  };

  // Helper function to get full name
  const getUserFullName = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:border-gray-800 dark:bg-white/[0.03] text-sm text-gray-500 dark:text-gray-400">
      <h2 className="text-xl font-semibold mb-4">Open Shifts</h2>

      {loading && <p>Loading shifts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Time In</th>
            <th className="border p-2">Time Out</th>
            <th className="border p-2">Total Hours</th>
            <th className="border p-2">Shifts</th> 
            <th className="border p-2">Status</th> 
            <th className="border p-2">Actions</th> 
          </tr>
        </thead>
        <tbody>
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <tr key={shift.id}>
                <td className="border p-2">{getUserFullName(shift.userId)}</td>
                <td className="border p-2">{shift.date}</td>
                <td className="border p-2">{shift.timeIn ? formatTime(shift.timeIn) : "-"}</td>
                <td className="border p-2">{shift.timeOut ? formatTime(shift.timeOut) : "-"}</td>
                <td className="border p-2">{shift.totalHours ? parseFloat(shift.totalHours).toFixed(2) : "-"}</td>
                <td className="border p-2">{shift.shifts}</td>
                <td className="border p-2">{shift.status}</td>
                <td className="border p-2">
                  {shift.status === "In Progress" && (
                    <button
                      onClick={() => handleTimeOut(shift.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Time Out
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center p-4">
                No open shifts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
