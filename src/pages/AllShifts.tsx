import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../components/common/PageBreadCrumb";

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
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  employmentType?: string;
}

export default function AllShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [employmentTypes, setEmploymentTypes] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      setUserRole(user.role);
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
      if (userRole !== "Admin") return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:4000/attendances");
        if (!response.ok) throw new Error("Failed to fetch attendance records");
        const data: Shift[] = await response.json();
        const sortedShifts = data
          .sort((a, b) => {
            if (a.timeIn && b.timeIn) {
              return new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime();
            }
            return a.timeIn ? -1 : 1;
          });

        setShifts(sortedShifts);
      } catch (error) {
        setError("Error fetching attendance records.");
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "Admin" && userId !== null) {
      fetchAttendance();
    }
  }, [userId, userRole]);

  useEffect(() => {
    const fetchEmploymentTypes = async () => {
      const types: Record<number, string> = {};
      for (const shift of shifts) {
        if (!employmentTypes[shift.userId]) {
          const type = await getUserEmploymentType(shift.userId);
          types[shift.userId] = type;
        }
      }
      setEmploymentTypes(prev => ({ ...prev, ...types }));
    };

    if (shifts.length > 0) {
      fetchEmploymentTypes();
    }
  }, [shifts]);

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

  const getUserFullName = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getUserEmploymentType = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/employments/account/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch employment data");
      const data = await response.json();
      return data.employmentType || "Not Available";
    } catch (error) {
      console.error("Error fetching employment type:", error);
      return "Not Available";
    }
  };

  const indexOfLastShift = currentPage * itemsPerPage;
  const indexOfFirstShift = indexOfLastShift - itemsPerPage;
  const currentShifts = shifts.slice(indexOfFirstShift, indexOfLastShift);

  const totalPages = Math.ceil(shifts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Hours / All Shifts" />
      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        {loading && <p className="text-center text-gray-500">Loading shifts...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="overflow-hidden">
          <table className="w-full border border-gray-100 rounded-lg shadow-sm text-left">
            <thead className="bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:bg-white/[0.03]">
              <tr>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Employee</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Date</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Time In</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Time Out</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Total Hours</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Shifts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
              {currentShifts.length > 0 ? (
                currentShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{getUserFullName(shift.userId)}</td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{shift.date}</td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm relative group">
                      {shift.timeIn ? formatTime(shift.timeIn) : "-"}
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
                      {shift.timeOut ? formatTime(shift.timeOut) : "-"}
                      {shift.timeOutImageId && (
                        <img
                          src={`http://localhost:4000/uploads/${shift.timeOutImageId}`}
                          alt="Time Out"
                          className="absolute inset-0 w-20 h-20 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 ease-in-out"
                          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                        />
                      )}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{shift.totalHours ? Number(shift.totalHours).toFixed(2) : "-"}</td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{employmentTypes[shift.userId] || "Loading..."}</td>
                  </tr>
                ))
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

              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full"
                onClick={handleUpdateShift}
              >
                Update Shift
              </button>

              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mt-4 w-full"
                onClick={() => setSelectedShift(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}
