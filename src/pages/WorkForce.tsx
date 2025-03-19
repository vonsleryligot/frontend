import { useEffect, useState } from "react";
import AddEmployee from "./AddEmployee";
import { Eye } from "lucide-react"; // Importing an eye icon from lucide-react

interface User {
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
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const limit = 5; // Limit users per page

  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [newEmployee, setNewEmployee] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    setFilteredUsers(
      users.filter((AddEmployee) =>
        `${AddEmployee.firstName} ${AddEmployee.lastName} ${AddEmployee.email} ${AddEmployee.phone}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/employees?page=${page}&limit=${limit}`, {

        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch employee: ${response.statusText}`);
      }

      const data: User[] = await response.json();
      setUsers(data.filter((user): user is User & { isVerified: boolean } => 'isVerified' in user && !!user.isVerified));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (employee: User) => {
    console.log("Viewing user:", employee);
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async () => {
    try {
      const response = await fetch("http://localhost:4000/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) {
        throw new Error(`Failed to add employee: ${response.statusText}`);
      }

      setShowModal(false);
      fetchUsers(); // Refresh the list after adding an employee
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
            onClick={() => setShowModal(true)} // Open modal
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            + Add Employee
          </button>
        </div>
      </div>
  
      {/* Render AddEmployee Modal */}
      <AddEmployee 
        showModal={showModal} 
        setShowModal={setShowModal} 
        onAddEmployee={handleAddEmployee} 
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((AddEmployee) => (
                <tr key={AddEmployee.id} className="hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
                  <td className="px-4 py-2 border">{AddEmployee.firstName} {AddEmployee.lastName}</td>
                  <td className="px-4 py-2 border">{AddEmployee.email}</td>
                  <td className="px-4 py-2 border">{AddEmployee.role}</td>
                  <td className="px-4 py-2 border">{AddEmployee.department}</td>
                  <td className="px-4 py-2 border">{AddEmployee.phone}</td>
                  <td className="px-4 py-2 border">
                    <button 
                      onClick={() => handleViewUser(AddEmployee)}
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
                <td colSpan={4} className="px-4 py-2 border text-center">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
  }

export default WorkForce;
