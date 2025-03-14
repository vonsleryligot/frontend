import { useState, useEffect } from "react";
import { useModal } from "../hooks/useModal";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  role: "Admin" | "User";
}

const API_BASE_URL = "http://localhost:4000/accounts"; // Correct API endpoint

const ToDo: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [employeeConfirmPassword, setEmployeeConfirmPassword] = useState("");
  const [employeeRole, setEmployeeRole] = useState<"Admin" | "User">("User");
  const [employeePosition, setEmployeePosition] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState("");

  const { isOpen, openModal, closeModal } = useModal();

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleAddEmployee = async () => {
    if (employeePassword !== employeeConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const newEmployee = {
      firstName,
      lastName,
      email: employeeEmail,
      password: employeePassword,
      role: employeeRole,
      position: employeePosition,
      department: employeeDepartment,
    };

    try {
      const token = localStorage.getItem("token"); // Get JWT token if stored

      const response = await fetch(`${API_BASE_URL}/add-employee`, { // Correct API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ensure authorization
        },
        body: JSON.stringify(newEmployee),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add employee");
      }

      setEmployees((prevEmployees) => [...prevEmployees, responseData]); // Update UI
      resetForm();
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmployeeEmail("");
    setEmployeePassword("");
    setEmployeeConfirmPassword("");
    setEmployeeRole("User");
    setEmployeePosition("");
    setEmployeeDepartment("");
  };

  return (
    <div className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <h2 className="text-xl font-bold">Employee Task Manager</h2>
      <button onClick={openModal} className="btn btn-primary mt-4">
        Add Employee +
      </button>

      {/* Add Employee Form */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Add Employee</h3>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" />
        <input type="email" placeholder="Email" value={employeeEmail} onChange={(e) => setEmployeeEmail(e.target.value)} className="input" />
        <input type="password" placeholder="Password" value={employeePassword} onChange={(e) => setEmployeePassword(e.target.value)} className="input" />
        <input type="password" placeholder="Confirm Password" value={employeeConfirmPassword} onChange={(e) => setEmployeeConfirmPassword(e.target.value)} className="input" />
        <select value={employeeRole} onChange={(e) => setEmployeeRole(e.target.value as "Admin" | "User")} className="input">
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <input type="text" placeholder="Position" value={employeePosition} onChange={(e) => setEmployeePosition(e.target.value)} className="input" />
        <input type="text" placeholder="Department" value={employeeDepartment} onChange={(e) => setEmployeeDepartment(e.target.value)} className="input" />
        <button onClick={handleAddEmployee} className="btn btn-success mt-2">Add Employee</button>
      </div>
    </div>
  );
};

export default ToDo;
