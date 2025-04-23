import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

const roles = ["Admin", "User"];
const departments = ["Accountant", "IT", "Associate", "Operations"];
const employmentTypes = ["Open-Shifts", "Regular", "Part-Time", "Apprenticeship"];
const titles = ["Mr", "Mrs", "Miss", "Ms"];

const AddAccount: React.FC = () => {
  const [step, setStep] = useState(1);

  const [newAccount, setNewAccount] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    department: "",
    employmentType: "",
    rank: "",
    rate: "",
    bank: "",
    position: "",
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
      official: string;
      nativeName?: Record<string, { official: string; common: string }>;
    };
  }
  
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data: Country[]) => {
        const countryOptions = data.map((c) => ({
          label: c.name.common,
          value: c.name.common,
        }));
        setCountries(
          countryOptions.sort((a, b) => a.label.localeCompare(b.label))
        );
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
    let error = "";
    if (!value.trim()) error = "This field is required";
    else {
      if (name === "email" && !/^\S+@\S+\.\S+$/.test(value)) error = "Invalid email format";
      if (name === "password" && value.length < 6) error = "Password must be at least 6 characters";
      if (name === "confirmPassword" && value !== newAccount.password) error = "Passwords do not match";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isStepValid = () => {
    let requiredFields: string[] = [];

    if (step === 1) {
      requiredFields = ["title", "firstName", "lastName", "phone", "email", "password", "confirmPassword"];
    } else if (step === 2) {
      requiredFields = ["role", "employmentType", "department", "rank", "rate", "bank", "position"];
    } else if (step === 3) {
      requiredFields = ["country", "city", "postalCode"];
    }

    const newErrors: { [key: string]: string } = {};
    requiredFields.forEach((field) => {
      if (!newAccount[field as keyof typeof newAccount]?.trim()) newErrors[field] = "This field is required";
    });

    if (step === 1 && newAccount.password !== newAccount.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (isStepValid()) setStep((prev) => prev + 1);
  };

  const handlePrevious = () => setStep((prev) => prev - 1);

  const handleAddAccount = async () => {
    if (!isStepValid()) return;

    const token = localStorage.getItem("token");
    if (!token || userRole !== "Admin") {
      toast.error("Unauthorized or no token", { position: "bottom-right" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success("Account added successfully!", { position: "bottom-right" });
      setTimeout(() => (window.location.href = "/workforce"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add account", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            {[
              { label: "Title", name: "title", type: "select", options: titles },
              { label: "First Name", name: "firstName", type: "text" },
              { label: "Last Name", name: "lastName", type: "text" },
              { label: "Phone", name: "phone", type: "text" },
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
                    className="border p-3 bg-gray-700 text-gray-300 rounded-md"
                  >
                    <option value="">Select {label}</option>
                    {options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    name={name}
                    placeholder={label}
                    value={newAccount[name as keyof typeof newAccount]}
                    onChange={handleInputChange}
                    className="border p-3 bg-gray-700 text-gray-300 rounded-md"
                  />
                )}
                {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
              </div>
            ))}
          </>
        );

      case 2:
        return (
          <>
            {[
              { label: "Role", name: "role", options: roles },
              { label: "Employment Type", name: "employmentType", options: employmentTypes },
              { label: "Department", name: "department", options: departments },
              { label: "Rank", name: "rank" },
              { label: "Rate", name: "rate" },
              { label: "Bank", name: "bank" },
              { label: "Position", name: "position" },
            ].map(({ label, name, options }) => (
              <div key={name} className="flex flex-col">
                <label className="font-semibold text-gray-300">{label}</label>
                {options ? (
                  <select
                    name={name}
                    value={newAccount[name as keyof typeof newAccount]}
                    onChange={handleInputChange}
                    className="border p-3 bg-gray-700 text-gray-300 rounded-md"
                  >
                    <option value="">Select {label}</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name={name}
                    placeholder={label}
                    value={newAccount[name as keyof typeof newAccount]}
                    onChange={handleInputChange}
                    className="border p-3 bg-gray-700 text-gray-300 rounded-md"
                  />
                )}
                {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
              </div>
            ))}
          </>
        );

      case 3:
        return (
          <>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-300">Country</label>
              <Select
                options={countries}
                onChange={(selected) => handleSelectChange("country", selected)}
                className="text-black"
                placeholder="Select country"
              />
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-300">City</label>
              <Select
                options={cities}
                onChange={(selected) => handleSelectChange("city", selected)}
                className="text-black"
                placeholder="Select city"
                isDisabled={!newAccount.country}
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-300">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={newAccount.postalCode}
                onChange={handleInputChange}
                className="border p-3 bg-gray-700 text-gray-300 rounded-md"
              />
              {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
            </div>
          </>
        );
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Work Force / Add Account" />
      <div className="p-8 rounded-xl shadow-xl max-w-4xl mx-auto bg-gray-800 text-gray-300">
        <h3 className="text-2xl font-semibold mb-6 text-white">Add Account (Step {step} of 3)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderStep()}</div>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button onClick={handlePrevious} className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700">
              Previous
            </button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Next
            </button>
          ) : (
            <button
              onClick={handleAddAccount}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />
      </div>
    </>
  );
};

export default AddAccount;
