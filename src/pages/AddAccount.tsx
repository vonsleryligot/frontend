// AddAccount.tsx
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

const roles = ["Admin", "User"];
const department = ["Accountant", "IT", "Associate", "Operations"];

// interface AddAccountProps {
//   onAddAccount: (account: any) => void;
// }

const AddAccount: React.FC = () => {
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

  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  interface Country {
    name: {
      common: string;
    };
  }
  
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch countries");
        return res.json();
      })
      .then((data: Country[]) => {
        const countryNames = data.map((c) => ({
          label: c.name.common,
          value: c.name.common,
        }));
        setCountries(countryNames.sort((a, b) => a.label.localeCompare(b.label)));
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);
  

  useEffect(() => {
    if (newAccount.country) {
      fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: newAccount.country }),
      })
        .then((res) => res.json())
        .then((data) => {
          const cityOptions = (data.data || []).map((city: string) => ({
            label: city,
            value: city,
          }));
          setCities(cityOptions);
        })
        .catch((error) => console.error("Error fetching cities:", error));
    }
  }, [newAccount.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSelectChange = (name: string, selected: { label: string; value: string } | null) => {
    const value = selected?.value || "";
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
    const requiredFields = [
      "title", "firstName", "lastName", "phone", "role", "employmentType",
      "email", "password", "confirmPassword", "country", "city", "postalCode",
    ];
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
      setLoading(true);
      const response = await fetch("http://localhost:4000/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to add account: ${response.status} - ${errorMessage}`);
      }

      await response.json();
      toast.success("Added Successfully", { position: "bottom-right", autoClose: 2000 });

      setTimeout(() => {
        window.location.href = "/workforce";
      }, 1000);
    } catch (error) {
      console.error("Error adding account:", error);
      toast.error("Failed to add account. Please try again.", { position: "bottom-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <PageBreadcrumb pageTitle="Home / Work Force / Add Account" />
      <div className="p-8 rounded-xl shadow-xl w-full max-w-4xl mx-auto bg-gray-800 dark:text-gray-300">
        <h3 className="text-2xl font-semibold text-gray-100 mb-6">Add Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "Title", name: "title", type: "select", options: ["Mr", "Mrs", "Miss", "Ms"] },
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Role", name: "role", type: "select", options: roles },
            { label: "Employment Type", name: "employmentType", type: "select", options: ["Open-Shifts", "Regular", "Part-Time", "Apprenticeship"] },
            { label: "Department", name: "department", type: "select", options: department },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password" },
          ].map(({ label, name, type, options }) => (
            <div key={name} className="flex flex-col">
              <label className="font-semibold text-gray-300">{label}</label>
              {type === "select" ? (
                <select
                  name={name}
                  value={newAccount[name as keyof typeof newAccount]}
                  onChange={handleInputChange}
                  className="border p-3 w-full bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select {label}</option>
                  {options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  placeholder={label}
                  value={newAccount[name as keyof typeof newAccount]}
                  onChange={handleInputChange}
                  className="border p-3 w-full bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
          ))}

          {/* Country dropdown */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-300">Country</label>
            <Select
              options={countries}
              onChange={(selected) => handleSelectChange("country", selected)}
              className="text-black"
              placeholder="Select country"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          {/* City dropdown */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-300">City</label>
            <Select
              options={cities}
              onChange={(selected) => handleSelectChange("city", selected)}
              className="text-black"
              placeholder="Select city"
              isDisabled={!newAccount.country}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          {/* Postal Code */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-300">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={newAccount.postalCode}
              onChange={handleInputChange}
              className="border p-3 w-full bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-6 mt-6">
          <button onClick={() => window.history.back()} className="px-6 py-3 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200">
            Cancel
          </button>
          <button
            onClick={handleAddAccount}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : "Add Account"}
          </button>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />
      </div>
    </>
  );
};

export default AddAccount;
