import { useEffect, useState } from "react";
import AddEmployee from "./AddEmployee";
import { Eye } from "lucide-react"; // Importing an eye icon from lucide-react

interface Employee {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  nickName?: string;
  suffix?: string;
  role: string;
  department: string;
  birthDate: string;
  maritalStatus: string;
  citizenship: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  isVerified: boolean;
}

const WorkForce = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const limit = 5; // Limit employees per page
  const [showModal, setShowModal] = useState(false);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch employees on page or search change
  useEffect(() => {
    fetchEmployees();
  }, [page, search]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/employee?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to fetch employees: ${response.statusText}`);

      const data: Employee[] = await response.json();

      // Set only verified employees
      const verifiedEmployees = data.filter((emp) => emp.isVerified);
      setEmployees(verifiedEmployees);

      // Filter based on search input
      if (search) {
        setFilteredEmployees(
          verifiedEmployees.filter((emp) =>
            `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.phone}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
        );
      } else {
        setFilteredEmployees(verifiedEmployees);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    console.log("Viewing employee:", employee);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async () => {
    try {
      const response = await fetch("http://localhost:4000/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) throw new Error(`Failed to add employee: ${response.statusText}`);

      setShowModal(false);
      fetchEmployees(); // Refresh the list after adding
    } catch (err: any) {
      console.error("Error adding employee:", err.message);
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-400">Employee</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search employees..."
            className="border p-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployee showModal={showModal} setShowModal={setShowModal} onAddEmployee={handleAddEmployee} />

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <th className="px-4 py-2 border">Employee Details</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Department</th>
              <th className="px-4 py-2 border">Contact Number</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
                  <td className="px-4 py-2 border">{employee.firstName} {employee.lastName}</td>
                  <td className="px-4 py-2 border">{employee.email}</td>
                  <td className="px-4 py-2 border">{employee.role}</td>
                  <td className="px-4 py-2 border">{employee.department}</td>
                  <td className="px-4 py-2 border">{employee.phone}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleViewEmployee(employee)}
                      className="px-3 py-1 bg-blue-500 text-white rounded flex items-center space-x-1 hover:bg-blue-700"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-2 border text-center">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WorkForce;
