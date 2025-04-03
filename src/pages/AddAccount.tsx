import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AddAccountProps {
  onAddAccount: (account: any) => void;
}

const roles = ["Admin", "User"];
const department = ["Accountant", "IT", "Associate", "Operations"];

const AddAccount: React.FC<AddAccountProps> = ({ onAddAccount }) => {
  const [newAccount, setNewAccount] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    department: "",
    employmentType: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    city: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(false); // Para sa loading spinner

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role) setUserRole(decoded.role);
    } catch (error) {
      console.error("Token decoding error:", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let errorMessage = "";

    if (!value.trim()) {
      errorMessage = "This field is required";
    } else {
      if (name === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
        errorMessage = "Invalid email format";
      }
      if (name === "password" && value.length < 6) {
        errorMessage = "Password must be at least 6 characters";
      }
      if (name === "confirmPassword" && value !== newAccount.password) {
        errorMessage = "Passwords do not match";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const isFormValid = () => {
    const requiredFields = ["title", "firstName", "lastName", "phone", "role", "employmentType", "email", "password", "confirmPassword", "country", "city", "postalCode"];
    const newErrors: { [key: string]: string } = {};

    requiredFields.forEach((field) => {
      if (!newAccount[field as keyof typeof newAccount].trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (newAccount.password !== newAccount.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccount = async () => {
    if (!isFormValid()) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found!");
      return;
    }
  
    if (!userRole) {
      console.error("User role is undefined! Check token decoding.");
      return;
    }
  
    if (userRole !== "Admin") {
      console.error("Unauthorized: Only admins can create new accounts.");
      return;
    }
  
    try {
      setLoading(true); // Show loading spinner
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };
  
      const response = await fetch("http://localhost:4000/accounts", {
        method: "POST",
        headers,
        body: JSON.stringify(newAccount),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to add account: ${response.status} - ${errorMessage}`);
      }
  
      await response.json();
      toast.success("Added Successfully", {
        position: "bottom-right",
        autoClose: 2000,
      });
  
      setTimeout(() => {
        window.location.href = "/workforce"; // Refresh + Redirect to WorkForce page
      }, 1000); // Wait for 1 second before redirect
  
    } catch (error) {
      console.error("Error adding account:", error);
      toast.error("Failed to add account. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };
  
  return (
    <div className="p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 dark:text-gray-300">
      <h3 className="text-lg font-bold mb-4">Add Account</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Title", name: "title", type: "select", options: ["Mr", "Mrs", "Miss", "Ms"] },
          { label: "First Name", name: "firstName", type: "text" },
          { label: "Last Name", name: "lastName", type: "text" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "Role", name: "role", type: "select", options: roles },
          { label: "Employment Type", name: "employmentType", type: "select", options: ["Open Shifts", "Regular", "Part-Time", "Apprenticeship"] },
          { label: "Department", name: "department", type: "select", options: department },
          { label: "Email", name: "email", type: "email" },
          { label: "Password", name: "password", type: "password" },
          { label: "Confirm Password", name: "confirmPassword", type: "password" },
          { label: "Country", name: "country", type: "text" },
          { label: "City", name: "city", type: "text" },
          { label: "Postal Code", name: "postalCode", type: "text" },
        ].map(({ label, name, type, options }) => (
          <div key={name} className="flex flex-col">
            <label className="font-semibold dark:text-gray-300">{label}</label>
            {type === "select" ? (
              <select name={name} value={newAccount[name as keyof typeof newAccount]} onChange={handleInputChange} className="border p-2 w-full dark:bg-gray-800 dark:text-gray-300">
                <option value="">Select {label}</option>
                {options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                name={name}
                placeholder={label}
                className="border p-2 w-full dark:bg-gray-800 dark:text-gray-300"
                value={newAccount[name as keyof typeof newAccount]}
                onChange={handleInputChange}
              />
            )}
            {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded">
          Cancel
        </button>
        <button 
          onClick={handleAddAccount} 
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <span className="loader"></span> : "Add Account"}
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />
    </div>
  );
};

export default AddAccount;
