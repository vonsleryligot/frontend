import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface AddAccountProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onAddAccount: (account: any) => void;
}

const roles = ["Admin", "User"];

const AddAccount: React.FC<AddAccountProps> = ({ showModal, setShowModal, onAddAccount }) => {
  const [newAccount, setNewAccount] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    city: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found!");
      return;
    }

    try {
      // Debugging: Print raw token
      console.log("Raw JWT Token:", token);

      const base64Url = token.split(".")[1];
      if (!base64Url) {
        console.error("Invalid JWT format: Missing payload");
        return;
      }

      const decoded = JSON.parse(atob(base64Url));
      console.log("Decoded Token Payload:", decoded);

      if (decoded.role) {
        setUserRole(decoded.role);
        console.log("User Role Set:", decoded.role);
      } else {
        console.error("Role is missing in token payload");
      }
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
    const requiredFields = ["title", "firstName", "lastName", "phone", "role", "email", "password", "confirmPassword", "country", "city", "postalCode"];
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
    console.log("Submitting Data:", newAccount);

    // Validate form
    if (!isFormValid()) {
      console.error("Form has errors!", errors);
      return;
    }

    // Get authentication token
    const token = localStorage.getItem("token");
    console.log("Auth Token:", token);

    if (!token) {
      console.error("No authentication token found!");
      return;
    }

    // Check if user has Admin role
    if (!userRole) {
      console.error("User role is undefined! Check token decoding.");
      return;
    }

    console.log("👤 User Role:", userRole);

    if (userRole !== "Admin") {
      console.error("Unauthorized: Only admins can create new accounts.");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      console.log("Request Headers:", headers);

      const response = await fetch("http://localhost:4000/accounts", {
        method: "POST",
        headers,
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to add account: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      console.log("Account added successfully:", data);

      setShowModal(false);
      toast.success("Added Successfully", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error adding account:", error);
      toast.error("Failed to add account. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-[999999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-auto">
        <h3 className="text-lg font-bold mb-4">Add Account</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="font-semibold">Title</label>
            <select
              name="title"
              value={newAccount.title}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="">Select Title</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Miss">Miss</option>
              <option value="Ms">Ms</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="border p-2 w-full"
              value={newAccount.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="border p-2 w-full"
              value={newAccount.lastName}
              onChange={handleInputChange}
            />
             {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Role</label>
            <select
              name="role"
              value={newAccount.role}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="">Select Role</option>
              {roles.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="font-semibold">Department</label>
              <select
                name="department"
                value={newAccount.department}
                onChange={handleInputChange}
                className="border p-2 w-full"
                >
                <option value="">Select Department</option>
                <option value="Accountant">Accountant</option>
                <option value="IT">IT</option>
                <option value="Associate">Associate</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border p-2 w-full"
              value={newAccount.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Phone</label>
            <input
              type="phone"
              name="phone"
              placeholder="Phone"
              className="border p-2 w-full"
              value={newAccount.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Country</label>
            <input
              type="text"
              name="country"
              placeholder="Country"
              className="border p-2 w-full"
              value={newAccount.country}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              className="border p-2 w-full"
              value={newAccount.city}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              className="border p-2 w-full"
              value={newAccount.postalCode}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border p-2 w-full"
              value={newAccount.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="border p-2 w-full"
              value={newAccount.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleAddAccount} className="px-4 py-2 bg-blue-500 text-white rounded">Add Account</button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddAccount;