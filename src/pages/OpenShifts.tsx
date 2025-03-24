import { useState, useEffect } from "react";

// Define the Shift type to ensure proper TypeScript validation
interface Shift {
  id: number;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  totalHours: string | null;
  shifts: string;
  status: string;
}

export default function OpenShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]); // Explicitly typed useState

  // Fetch attendance records from backend
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("http://localhost:4000/attendances"); // Adjust API URL if needed
        if (!response.ok) throw new Error("Failed to fetch attendance records");

        const data: Shift[] = await response.json(); // Ensure response matches Shift type
        setShifts(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, []);

  // Function to handle Time Out
  const handleTimeOut = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/attendance/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeOut: new Date().toLocaleTimeString(),
          status: "Completed",
        }),
      });

      if (!response.ok) throw new Error("Time Out failed");

      // Refresh attendance records after timeout
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
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Open Shifts</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
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
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td className="border p-2">{shift.date}</td>
              <td className="border p-2">{shift.timeIn ?? "-"}</td>
              <td className="border p-2">{shift.timeOut ?? "-"}</td>
              <td className="border p-2">{shift.totalHours ?? "-"}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
