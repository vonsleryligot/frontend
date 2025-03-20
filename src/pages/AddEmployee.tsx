import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Employee = {
  firstName: string;
  middleName: string;
  lastName: string;
  nickName: string;
  suffix: string;
  role: string;
  department: string;
  birthDate: Date;  // Changed from string to Date
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
    birthDate: new Date(),  // Default to today's date
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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    let updatedValue: any = value;
  
    // Convert phone input to number (if applicable)
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return; // Prevent non-numeric input
      updatedValue = value === "" ? "" : Number(value); // Convert to number, allow empty string
    }
  
    setNewEmployee((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  
    setErrors((prev) => ({
      ...prev,
      [name]: value.trim() ? "" : "This field is required",
    }));
  };
  
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewEmployee((prev) => ({
        ...prev,
        birthDate: date, // Update birthDate with selected date
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.entries(newEmployee).forEach(([key, value]) => {
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[key] = "This field is required";
        isValid = false;
      }
    });

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
        birthDate: newEmployee.birthDate.toISOString().split("T")[0], // Convert Date to string
    };

    console.log("Sending data to backend:", JSON.stringify(formattedEmployee, null, 2));

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
        console.log("Employee added successfully:", data);

        // Update UI with new employee
        onAddEmployee(data);
        
        // Reset form
        setNewEmployee({
            firstName: "",
            middleName: "",
            lastName: "",
            nickName: "",
            suffix: "",
            role: "",
            department: "",
            birthDate: new Date(), // Reset to today's date
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
        });

        setErrors({});
        setShowModal(false);
    } catch (error) {
        console.error("Error adding employee:", error);
        if (error instanceof Error) {
          alert(`Error: ${error.message}`);
      } else {
          alert(`An unknown error occurred`);
      }
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
                  selected={newEmployee.birthDate}
                  onChange={handleDateChange}
                  className="border p-2 w-full border-gray-300 rounded"
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  maxDate={new Date()} // Prevent future dates
                />
              ) : (
                <input
                  type="text"
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
