import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";

interface Account {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  title: string;
  role: string;
  country: string;
  city: string;
  postalCode: string;
  email: string;
  phone: string;
  profile_image?: string | null;
}

interface EmploymentDetails {
  accountId: number;
  status: string;
  position: string;
  rank: string;
  department: string;
  employmentType: string;
  rate: string;
  bank: string;
}

const EmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [showCompensationModal, setShowCompensationModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
    position: "",
    department: "",
    employmentType: "",
    rate: "",
    bank: "",
    rank: ""
  });

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:4000/accounts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch account details");
        const data = await response.json();
        const account = data.find((acc: Account) => acc.id === parseInt(id ?? ""));
        if (account) {
          setAccount(account);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchEmploymentDetails = async () => {
      try {
        const token = localStorage.getItem("token") || "";
    
        if (!token) {
          setError("No token found. Please log in.");
          return;
        }
    
        const response = await fetch(`http://localhost:4000/employments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) throw new Error("Failed to fetch employment details");
    
        const data = await response.json();
        const employment = data.find((emp: EmploymentDetails) => emp.accountId === parseInt(id ?? ""));
    
        if (employment) {
          setEmploymentDetails(employment);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };
    

    if (id) {
      fetchAccountDetails();
      fetchEmploymentDetails();
    }
  }, [id]);

  const handleEditClick = () => {
    if (account) {
      setFormData({
        firstName: account.firstName || "",
        lastName: account.lastName || "",
        email: account.email || "",
        phone: account.phone || "",
        country: account.country || "",
        city: account.city || "",
        postalCode: account.postalCode || "",
        position: employmentDetails?.position || "",
        department: employmentDetails?.department || "",
        employmentType: employmentDetails?.employmentType || "",
        rate: employmentDetails?.rate || "",
        bank: employmentDetails?.bank || "",
        rank: employmentDetails?.rank || ""
      });
      setShowEditModal(true);
    }
  };

  const handleEmploymentEditClick = () => {
    if (employmentDetails) {
      setFormData(prev => ({
        ...prev,
        position: employmentDetails.position || "",
        department: employmentDetails.department || "",
        employmentType: employmentDetails.employmentType || "",
        rank: employmentDetails.rank || ""
      }));
      setShowEmploymentModal(true);
    }
  };

  const handleCompensationEditClick = () => {
    if (employmentDetails) {
      setFormData(prev => ({
        ...prev,
        rate: employmentDetails.rate || "",
        bank: employmentDetails.bank || ""
      }));
      setShowCompensationModal(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      country: value,
      city: "" // Reset city when country changes
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleEmploymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Update employment details
      const employmentResponse = await fetch(`http://localhost:4000/employments/account/${account?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: account?.id,
          position: formData.position,
          department: formData.department,
          employmentType: formData.employmentType,
          rank: formData.rank,
          status: employmentDetails?.status,
          rate: employmentDetails?.rate,
          bank: employmentDetails?.bank
        }),
      });

      if (!employmentResponse.ok) throw new Error("Failed to update employment details");

      // Refetch employment details
      const refetchedEmploymentResponse = await fetch(`http://localhost:4000/employments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!refetchedEmploymentResponse.ok) throw new Error("Failed to refetch employment details");
      const refetchedEmploymentData = await refetchedEmploymentResponse.json();
      const updatedEmployment = refetchedEmploymentData.find((emp: EmploymentDetails) => emp.accountId === parseInt(id ?? ""));
      
      if (updatedEmployment) {
        setEmploymentDetails(updatedEmployment);
      }
      
      setShowEmploymentModal(false);
      toast.success("Employment details updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  const handleCompensationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Update employment details
      const employmentResponse = await fetch(`http://localhost:4000/employments/account/${account?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: account?.id,
          rate: formData.rate,
          bank: formData.bank,
          status: employmentDetails?.status,
          position: employmentDetails?.position,
          department: employmentDetails?.department,
          employmentType: employmentDetails?.employmentType,
          rank: employmentDetails?.rank
        }),
      });

      if (!employmentResponse.ok) throw new Error("Failed to update compensation details");

      // Refetch employment details
      const refetchedEmploymentResponse = await fetch(`http://localhost:4000/employments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!refetchedEmploymentResponse.ok) throw new Error("Failed to refetch employment details");
      const refetchedEmploymentData = await refetchedEmploymentResponse.json();
      const updatedEmployment = refetchedEmploymentData.find((emp: EmploymentDetails) => emp.accountId === parseInt(id ?? ""));
      
      if (updatedEmployment) {
        setEmploymentDetails(updatedEmployment);
      }
      
      setShowCompensationModal(false);
      toast.success("Compensation details updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Update account details
      const accountResponse = await fetch(`http://localhost:4000/accounts/${account?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: account?.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          postalCode: formData.postalCode,
          title: account?.title,
          role: account?.role
        }),
      });

      if (!accountResponse.ok) throw new Error("Failed to update account details");

      // Refetch account details
      const refetchedAccountResponse = await fetch(`http://localhost:4000/accounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!refetchedAccountResponse.ok) throw new Error("Failed to refetch account details");
      const refetchedAccountData = await refetchedAccountResponse.json();
      const updatedAccount = refetchedAccountData.find((acc: Account) => acc.id === parseInt(id ?? ""));
      
      if (updatedAccount) {
        setAccount(updatedAccount);
      }
      
      setShowEditModal(false);
      toast.success("Personal information updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  // Add this useEffect to handle modal state
  useEffect(() => {
    if (!showEditModal) {
      // Reset form data when modal is closed
      if (account) {
        setFormData({
          firstName: account.firstName || "",
          lastName: account.lastName || "",
          email: account.email || "",
          phone: account.phone || "",
          country: account.country || "",
          city: account.city || "",
          postalCode: account.postalCode || "",
          position: employmentDetails?.position || "",
          department: employmentDetails?.department || "",
          employmentType: employmentDetails?.employmentType || "",
          rate: employmentDetails?.rate || "",
          bank: employmentDetails?.bank || "",
          rank: employmentDetails?.rank || ""
        });
      }
    }
  }, [showEditModal, account, employmentDetails]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Work Force / Employee Details" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              {/* Profile Image */}
              <div className="relative w-35 h-35 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 hover:scale-110 transition-transform duration-300 ease-in-out">
                <img
                  src={
                    profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(account?.firstName?.charAt(0) || "U")}&background=random&color=fff`
                  }
                  alt="N/A"
                  onError={(e) => { e.currentTarget.src = "/images/default-profile.png"; }}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Employee Details */}
              <div className="order-3 xl:order-2">
                <div className="flex items-center gap-4">
                  <h4 className="mb-2 text-2xl font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {account?.title || ""} {account?.firstName || "N/A"} {account?.lastName || ""}
                  </h4>
                </div>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-base text-gray-500 dark:text-gray-400">{account?.role || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">First Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.firstName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Last Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.lastName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email address</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*User Address */}
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
               User Address
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Country</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.country || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">City/State</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.city || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Postal Code</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.postalCode || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Employment Information */}
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Employment Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employee ID</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {account?.id
                        ? `CBOPC-${String(account?.id).padStart(4, "0")}`
                        : "N/A"}
                    </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employment Status</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {employmentDetails?.status || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Job Position</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {employmentDetails?.position || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Rank</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {employmentDetails?.rank || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {employmentDetails?.department || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employment Type</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {employmentDetails?.employmentType || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEmploymentEditClick}
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
        {/* Compensation */}
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Compensation
              </h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Daily Rate</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {employmentDetails?.rate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Back Account</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {employmentDetails?.bank || "N/A"}
                    </p>
                  </div>
                </div>
            </div>
            <button
              onClick={handleCompensationEditClick}
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

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} className="max-w-[700px] m-4">
          <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Employee Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update employee details to keep the profile up-to-date.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                    disabled />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    disabled />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Input
                    id="employmentType"
                    type="text"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate</Label>
                  <Input
                    id="rate"
                    type="text"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bank">Bank</Label>
                  <Input
                    id="bank"
                    type="text"
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="rank">Rank</Label>
                  <Input
                    id="rank"
                    type="text"
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowEditModal(false)}>
                  Close
                </Button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Employment Modal */}
        <Modal isOpen={showEmploymentModal} onClose={() => setShowEmploymentModal(false)} className="max-w-[700px] m-4">
          <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Employment Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update employment details to keep the profile up-to-date.
            </p>
            <form onSubmit={handleEmploymentSubmit} className="flex flex-col">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Input
                    id="employmentType"
                    type="text"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="rank">Rank</Label>
                  <Input
                    id="rank"
                    type="text"
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowEmploymentModal(false)}>
                  Close
                </Button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Compensation Modal */}
        <Modal isOpen={showCompensationModal} onClose={() => setShowCompensationModal(false)} className="max-w-[700px] m-4">
          <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Compensation Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update compensation details to keep the profile up-to-date.
            </p>
            <form onSubmit={handleCompensationSubmit} className="flex flex-col">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <Label htmlFor="rate">Daily Rate</Label>
                  <Input
                    id="rate"
                    type="text"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bank">Bank Account</Label>
                  <Input
                    id="bank"
                    type="text"
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowCompensationModal(false)}>
                  Close
                </Button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default EmployeeDetails;