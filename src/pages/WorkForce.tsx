import { useEffect, useState } from "react";
import AddEmployee from "./AddEmployee";
import { Eye } from "lucide-react";

interface Employee {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  nickName: string;
  suffix: string;
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
  const [users, setUsers] = useState<Employee[]>([]);
  const [filteredEmployee, setFilteredEmployee] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const limit = 5;

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployee();
  }, [page]);

  useEffect(() => {
    setFilteredEmployee(
      users.filter((employee) =>
        `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.phone} ${employee.department}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/accounts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch employee: ${response.statusText}`);
      }

      const data: Employee[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
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

      <AddEmployee 
        showModal={showModal} 
        setShowModal={setShowModal} 
        onAddEmployee={fetchEmployee} 
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
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
            {filteredEmployee.length > 0 ? (
              filteredEmployee.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
                  <td className="px-4 py-2 border">{employee.firstName} {employee.middleName} {employee.lastName}</td>
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
                      <span></span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-2 border text-center">No Employee found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-center">Employee Details</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
                <p><strong>Role:</strong> {selectedEmployee.role}</p>
                <p><strong>Department:</strong> {selectedEmployee.department}</p>
                <p><strong>Birth Date:</strong> {selectedEmployee.birthDate}</p>
                <p><strong>Gender:</strong> {selectedEmployee.gender}</p>
                <p><strong>Citizenship:</strong> {selectedEmployee.citizenship}</p>
                <p><strong>Address:</strong> {selectedEmployee.address}, {selectedEmployee.city}, {selectedEmployee.province}, {selectedEmployee.country}</p>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-all duration-200 shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkForce;
