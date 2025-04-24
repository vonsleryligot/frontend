import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { EyeIcon } from "lucide-react";
import { ArchiveIcon, AddIcon, ArchiveListIcon } from "../icons";
import { toast } from "react-toastify";

interface Account {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
  country: string;
  city: string;
  department: string;
  employmentType: string;
  postalCode: string;
  email: string;
  phone: string;
  profile_image?: string | null;
  archived: boolean;
  status: string;
}

interface Employment {
  accountId: number;
  department: string;
  employmentType: string;
}

const WorkForce = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    setFilteredAccounts(
      accounts.filter((account) =>
        `${account.firstName} ${account.lastName} ${account.email} ${account.phone} ${account.department}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, accounts]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/accounts`);
      if (!response.ok) throw new Error(`Failed to fetch accounts`);
      const data: Account[] = await response.json();

      console.log('All accounts from API:', data);
      
      // Log detailed information about each account
      data.forEach((account: Account, index: number) => {
        console.log(`Account ${index + 1}:`, account);
        console.log(`Account ${index + 1} archived status:`, account.archived);
        console.log(`Account ${index + 1} status:`, account.status);
      });

      // Filter out archived accounts - check both archived flag and status
      const activeAccounts = data.filter(account => 
        account.archived !== true && account.status !== 'Inactive'
      );

      console.log('Active accounts after filtering:', activeAccounts);

      // Try to fetch employment details for each account
      let employments: Employment[] = [];
      try {
        const employmentResponse = await fetch(`http://localhost:4000/employments`);
        if (employmentResponse.ok) {
          employments = await employmentResponse.json();
        } else {
          console.warn("Failed to fetch employments, using default values");
        }
      } catch (employmentError) {
        console.warn("Error fetching employments:", employmentError);
      }

      // Combine accounts with their corresponding employment details
      const accountsWithEmployment = activeAccounts.map((account) => {
        const employment = employments.find(
          (employment: Employment) => employment.accountId === account.id
        );
        return {
          ...account,
          department: employment ? employment.department : "Unknown",
          employmentType: employment ? employment.employmentType : "Unknown",
        };
      });

      const accountsWithImages = await Promise.all(
        accountsWithEmployment.map(async (account) => {
          try {
            const imgResponse = await fetch(`http://localhost:4000/profile-uploads/${account.id}`);
            if (imgResponse.ok) {
              const imgData = await imgResponse.json();
              return { ...account, profile_image: `http://localhost:4000${imgData.profile.profile_image}` };
            }
            return { ...account, profile_image: null };
          } catch {
            return { ...account, profile_image: null };
          }
        })
      );

      setAccounts(accountsWithImages);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastAccount = currentPage * itemsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - itemsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleArchive = async (accountId: number) => {
    try {
      // Find the account to check its role
      const accountToArchive = accounts.find(account => account.id === accountId);
      
      if (accountToArchive?.role.toLowerCase() === 'admin') {
        toast.error('Admin accounts cannot be archived');
        return;
      }

      setArchivingId(accountId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`http://localhost:4000/accounts/${accountId}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to archive account");
      }

      // Log the response data
      const responseData = await response.json();
      console.log('Archive response:', responseData);

      // Update local state to remove the archived account
      setAccounts(accounts.filter(account => account.id !== accountId));
      setFilteredAccounts(filteredAccounts.filter(account => account.id !== accountId));
      
      toast.success('Account archived successfully');
    } catch (err) {
      console.error("Archive failed", err);
      toast.error(err instanceof Error ? err.message : 'Failed to archive account');
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Work Force" />
      <div className="overflow-x-auto p-4">
        <div className="p-6  rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-400">Employees</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full md:w-64 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-200 w-full md:w-auto"
              >
                <Link to="/add-account" className="flex justify-center items-center w-full">
                  <AddIcon className="text-lg" />
                </Link>
              </button>
              <button
                className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-200 w-full md:w-auto"
              >
                <Link to="/archive-list" className="flex justify-center items-center w-full">
                  <ArchiveListIcon className="text-lg" />
                </Link>
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {loading ? (
            <p>Loading accounts...</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[640px] w-full border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm text-left">
                <thead className="bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-white/[0.03]">
                  <tr>
                    <th className="p-3 text-xs font-semibold">Profile</th>
                    <th className="p-3 text-xs font-semibold">Account Details</th>
                    <th className="p-3 text-xs font-semibold">Email</th>
                    <th className="p-3 text-xs font-semibold">Role</th>
                    <th className="p-3 text-xs font-semibold">Department</th>
                    <th className="p-3 text-xs font-semibold">Employment Type</th>
                    <th className="p-3 text-xs font-semibold">Contact Number</th>
                    <th className="p-3 text-xs font-semibold">View Details</th>
                    <th className="p-3 text-xs font-semibold">Actions</th>
                    <th className="p-3 text-xs font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-200">
                  {currentAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="p-3 text-xs">
                        <img
                          src={account.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.firstName + " " + account.lastName)}`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      </td>
                      <td className="p-3 text-xs">{account.firstName} {account.middleName} {account.lastName}</td>
                      <td className="p-3 text-xs">{account.email}</td>
                      <td className="p-3 text-xs">{account.role}</td>
                      <td className="p-3 text-xs">{account.department}</td>
                      <td className="p-3 text-xs">{account.employmentType}</td>
                      <td className="p-3 text-xs">{account.phone}</td>
                      <td className="p-3 text-xs text-center">
                        <Link to={`/employee-details/${account.id}`} className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                      </td>
                      <td className="p-3 text-xs">
                        <button
                          onClick={() => handleArchive(account.id)}
                          className={`text-red-600 hover:text-red-800 ${archivingId === account.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Archive"
                          disabled={archivingId === account.id}
                        >
                          {archivingId === account.id ? (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <ArchiveIcon className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-xs">
                        {account.archived ? (
                          <span className="text-red-500 font-medium">Inactive</span>
                        ) : (
                          <span className="text-green-600 font-medium">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <div className="text-xs">
              Page {currentPage} of {totalPages}
            </div>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkForce;
