import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const departments = ["Accountant", "IT", "Associate"];
const maritalStatuses = ["Married", "Single", "Divorced"];
const roles = ["Admin", "User"];
const genders = ["Male", "Female"];

type Employee = {
  firstName: string;
  middleName: string;
  lastName: string;
  nickName: string;
  suffix?: string;
  role: string;
  department: string;
  birthDate: Date | null;
  maritalStatus: string;
  citizenship: string;
  gender: string;
  email: string;
  phone: number | "";
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  password: string;
  confirmPassword: string;
};

type AddEmployeeProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onAddEmployee: (employee: Employee) => void;
};

const AddEmployee: React.FC<AddEmployeeProps> = ({ showModal, setShowModal, onAddEmployee }) => {
  const [newEmployee, setNewEmployee] = useState<Employee>({
    firstName: "",
    middleName: "",
    lastName: "",
    nickName: "",
    suffix: "",
    role: "",
    department: "",
    birthDate: null,
    maritalStatus: "",
    citizenship: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: any = value;

    if (name === "phone" && !/^\d*$/.test(value)) return;
    if (name === "phone") updatedValue = value === "" ? "" : Number(value);

    setNewEmployee((prev) => ({ ...prev, [name]: updatedValue }));

    if (name !== "suffix") {
      setErrors((prev) => ({ ...prev, [name]: value.trim() ? "" : "This field is required" }));
    }

    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          name === "confirmPassword" && value !== newEmployee.password
            ? "Passwords do not match"
            : "",
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setNewEmployee((prev) => ({ ...prev, birthDate: date }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.entries(newEmployee).forEach(([key, value]) => {
      if (key !== "suffix" && (!value || (typeof value === "string" && !value.trim()))) {
        newErrors[key] = "This field is required";
        isValid = false;
      }
    });

    if (newEmployee.password !== newEmployee.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm();
  }, [newEmployee]);

const handleAddEmployee = async () => {
    if (!isFormValid) return;

    const formattedEmployee = {
        ...newEmployee,
        birthDate: newEmployee.birthDate ? newEmployee.birthDate.toISOString().split("T")[0] : null,
        password: "defaultPassword123", // Temporary, dapat naa sa UI
        confirmPassword: "defaultPassword123", // Temporary
    };

    console.log("Sending Data:", formattedEmployee); // Debugging Output

    try {
        const response = await fetch("http://localhost:4000/employee/add-employee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formattedEmployee),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to add employee: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        onAddEmployee(data);
        setShowModal(false);
    } catch (error) {
        console.error("Error adding employee:", error);
    }
};


  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-[999999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-auto">
        <h3 className="text-lg font-bold mb-4">Add Employee</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(newEmployee).map((key) => (
            <div key={key} className="flex flex-col">
              {key === "birthDate" ? (
                <DatePicker
                  selected={newEmployee.birthDate || null}
                  onChange={handleDateChange}
                  className="border p-2 w-full border-gray-300 rounded"
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  maxDate={new Date()}
                  placeholderText="Select Birthdate"
                />
              ) : key === "role" || key === "gender" || key === "department" || key === "maritalStatus" ? (
                <select
                  name={key}
                  value={(newEmployee as any)[key]}
                  onChange={handleInputChange}
                  className={`border p-2 w-full ${errors[key] ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                  {(key === "role" ? roles : key === "gender" ? genders : key === "department" ? departments : maritalStatuses).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={key.includes("password") ? "password" : "text"}
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  className={`border p-2 w-full ${errors[key] ? "border-red-500" : "border-gray-300"}`}
                  value={(newEmployee as any)[key]}
                  onChange={handleInputChange}
                />
              )}
              {errors[key] && <span className="text-red-500 text-sm">{errors[key]}</span>}
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handleAddEmployee}
            className={`px-4 py-2 text-white rounded ${
              isFormValid ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
