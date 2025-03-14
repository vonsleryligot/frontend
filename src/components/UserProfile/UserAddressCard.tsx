import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    country: "",
    city: "",
    postalCode: "",
  });

  // Populate form fields when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        country: user.country || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      });
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
  const handleSave = async () => {
    if (!user) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Unauthorized: No token found");
      return;
    }
  
    try {
      // Step 1: Send the update request to the backend
      const response = await fetch(`http://localhost:4000/accounts/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Failed to update user info");
      }
  
      // Step 2: Fetch the updated user data from the backend
      const refreshedUser = await fetch(`http://localhost:4000/accounts/${user.id}?${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!refreshedUser.ok) {
        throw new Error("Failed to fetch updated user info");
      }
  
      const updatedUser = await refreshedUser.json();
  
      // Step 3: Update the UI directly with the backend response
      setFormData({
        country: updatedUser.country || "",
        city: updatedUser.city || "",
        postalCode: updatedUser.postalCode || "",
      });
  
      // Step 4: Update the global user state and local storage
      setUser(updatedUser); // Update global state
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Update local storage
  
      // Step 5: Show success message and close the modal
      toast.success("Profile updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              User Address
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Country</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.country || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">City/State</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.city || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Postal Code</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.postalCode || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex lg:w-auto"
          >
            Edit
          </button>
        </div>
      </div>

      {/* User Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Address
          </h4>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>City/State</Label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}