import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Select from "react-select";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    country: "",
    city: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        country: user.country || "",
        city: user.city || "",
        postalCode: String(user.postalCode || ""),
      });
    }
  }, [user]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch countries");
        return res.json();
      })
      .then((data: Array<{ name: { common: string } }>) => {
        const countryOptions = data.map((country) => ({
          label: country.name.common,
          value: country.name.common,
        }));
        setCountries(
          countryOptions.sort((a, b) => a.label.localeCompare(b.label))
        );
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
        // setError("Failed to load countries. Please try again later.");
      });
  }, []);

  useEffect(() => {
    if (formData.country) {
      fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: formData.country }),
      })
        .then((res) => res.json())
        .then((data: { error: boolean; msg: string; data: string[] }) => {
          const cityOptions = (data.data || []).map((city) => ({
            label: city,
            value: city,
          }));
          setCities(
            cityOptions.sort((a, b) => a.label.localeCompare(b.label))
          );
        })
        .catch((error) => console.error("Error fetching cities:", error));
    }
  }, [formData.country]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        employmentType: user.employmentType || "",
      };

      const response = await fetch(`http://localhost:4000/accounts/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update user info");
      }

      const refreshedUser = await fetch(
        `http://localhost:4000/accounts/${user.id}?_=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = await refreshedUser.json();

      setUser(updatedUser);
      setFormData(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Address updated successfully!");
      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
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
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] lg:inline-flex lg:w-auto"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z"
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Address
          </h4>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>Country<span className="text-error-500">*</span></Label>
                <Select
                  options={countries}
                  value={countries.find((c) => c.value === formData.country)}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      country: selected?.value || "",
                      city: "",
                    }))
                  }
                  placeholder="Select your country"
                  className="text-sm"
                />
              </div>

              {formData.country && (
                <div>
                  <Label>City/State<span className="text-error-500">*</span></Label>
                  <Select
                    options={cities}
                    value={cities.find((c) => c.value === formData.city)}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: selected?.value || "",
                      }))
                    }
                    placeholder="Select your city"
                    className="text-sm"
                  />
                </div>
              )}

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
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
