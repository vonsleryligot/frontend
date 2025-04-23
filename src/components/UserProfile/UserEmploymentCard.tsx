import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function UserEmploymentCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, setUser } = useAuth();
  const [role, setRole] = useState<string | null>(null);


  const [formData, setFormData] = useState({
    id: "",
    status: "",
    position: "",
    rank: "",
    department: "",
    employmentType: "",
  });

  // Populate form fields when `user` data changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        id: user.id || "",
      }));
  
      const token = localStorage.getItem("token");
      if (!token) return;
  
      // Fetch user role
      const fetchUserRole = async () => {
        try {
          const res = await fetch(`http://localhost:4000/accounts/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const data = await res.json();
          setRole(data.role); // assume response includes `role`
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        }
      };
  
      // Fetch employment details
      const fetchEmployment = async () => {
        try {
          const res = await fetch(`http://localhost:4000/employments/account/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          if (!res.ok) throw new Error("Failed to fetch employment data");
          const data = await res.json();
      
          setFormData((prev) => ({
            ...prev,
            status: data.status || "",
            position: data.position || "",
            rank: data.rank || "",
            department: data.department || "",
            employmentType: data.employmentType || "",
          }));
        } catch (error) {
          console.error("Failed to fetch employment data:", error);
        }
      };      
  
      fetchUserRole();
      fetchEmployment();
    }
  }, [user]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save user profile updates
const [loading, setLoading] = useState(false);

const handleSave = async () => {
  if (!user) return;

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Unauthorized: No token found");
    return;
  }

  setLoading(true);

  try {
    console.log("Sending to API:", JSON.stringify(formData)); // Log request

    const response = await fetch(`http://localhost:4000/accounts/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();
    console.log("API Response:", responseData); // Log API response

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update user info");
    }

    // Fetch updated data
    const refreshedUser = await fetch(`http://localhost:4000/accounts/${user.id}?_=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedUser = await refreshedUser.json();
    console.log("Updated User:", updatedUser); // Log fetched user data

    // Update both user and formData states
    setUser(updatedUser);
    setFormData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Profile updated successfully!");
    closeModal();
  } catch (error) {
    console.error("Error updating user info:", error);
    toast.error(error instanceof Error ? error.message : "An error occurred");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Employment Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employee ID</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.id
                    ? `CBOPC-${String(formData.id).padStart(4, "0")}`
                    : "N/A"}
                </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employment Status</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                 {formData.status || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Job Position</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.position || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Rank</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {formData.rank || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Department</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.department || "N/A"}
              </p>
            </div>


            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employment Type</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.employmentType || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {role === "Admin" && (
        <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] lg:inline-flex lg:w-auto"
        >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z"
                fill=""
            />
            </svg>
            Edit
        </button>
        )}
      </div>

      {/* Modal for Editing */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Employment Information
          </h4>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label htmlFor="id">Employee ID</Label>
                <Input id="id" type="text" name="id" value={formData.id  ? `CBOPC-${String(formData.id).padStart(4, "0")}`
                    : "N/A"} onChange={handleChange} disabled/>
              </div>

              <div>
                <Label htmlFor="status">Employment Status</Label>
                <Input id="status" type="text" name="status" value={formData.status} onChange={handleChange} disabled/>
              </div>

              <div>
                <Label htmlFor="position">Job Position</Label>
                <Input id="position" type="text" name="position" value={formData.position} onChange={handleChange}/>
              </div>

              <div>
                <Label htmlFor="rank">Rank</Label>
                <Input id="rank" type="text" name="rank" value={formData.rank} onChange={handleChange} />
              </div>

              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Input id="employmentType" type="text" name="employmentType" value={formData.employmentType} onChange={handleChange}/>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" type="text" name="department" value={formData.department} onChange={handleChange}/>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>Close</Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}