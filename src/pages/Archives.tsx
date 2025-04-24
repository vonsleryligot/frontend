import { useState, useEffect } from 'react';
import { FaArchive, FaUndo, FaEye } from 'react-icons/fa'; // Icons for Archive, Unarchive, and View
import axios from 'axios'; // For API requests
import { Link, useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { toast } from "react-toastify";

interface Account {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  employmentType: string;
  phone: string;
  profile_image?: string | null;
  archived: boolean;
  status: string;
  isArchived?: boolean;
}

const Archive = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch archived accounts from the backend API
  const fetchArchivedAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch accounts with includeArchived=true to get archived accounts
      const response = await axios.get('http://localhost:4000/accounts?includeArchived=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);
      
      // Filter for archived accounts
      const archivedAccounts = response.data.filter((account: Account) => 
        account.archived === true || account.status === 'Inactive'
      );
      
      console.log('Filtered archived accounts:', archivedAccounts);
      
      // Try to fetch employment details for each account
      let employments: any[] = [];
      try {
        const employmentResponse = await axios.get('http://localhost:4000/employments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (employmentResponse.status === 200) {
          employments = employmentResponse.data;
        }
      } catch (employmentError) {
        console.warn("Error fetching employments:", employmentError);
      }

      // Combine accounts with their corresponding employment details
      const accountsWithEmployment = archivedAccounts.map((account: Account) => {
        const employment = employments.find(
          (employment: any) => employment.accountId === account.id
        );
        return {
          ...account,
          department: employment ? employment.department : "Unknown",
          employmentType: employment ? employment.employmentType : "Unknown",
        };
      });
      
      setAccounts(accountsWithEmployment);
      setTotalPages(Math.ceil(accountsWithEmployment.length / 5));
    } catch (error) {
      console.error('Error fetching archived accounts:', error);
      setError('Failed to load archived accounts');
    } finally {
      setLoading(false);
    }
  };

  // Unarchive an account
  const handleUnarchive = async (id: number) => {
    try {
      setUnarchivingId(id);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await axios.put(`http://localhost:4000/accounts/${id}/unarchive`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        toast.success('Account restored successfully');
        // Remove the unarchived account from the list
        setAccounts(accounts.filter(account => account.id !== id));
      }
    } catch (error) {
      console.error('Error unarchiving account:', error);
      toast.error('Failed to restore account');
    } finally {
      setUnarchivingId(null);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filter accounts based on search
  const filteredAccounts = accounts.filter(account => 
    `${account.firstName} ${account.lastName} ${account.email} ${account.phone} ${account.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastAccount = currentPage * 5; // 5 items per page
  const indexOfFirstAccount = indexOfLastAccount - 5;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  useEffect(() => {
    fetchArchivedAccounts();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Work Force / Archive List" />
      <div className="overflow-x-auto p-4">
        <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-400">Archived Employees</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full md:w-64 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading ? (
            <p>Loading archived accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-center text-gray-500">No archived accounts found</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[640px] w-full border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm text-left">
                <thead className="bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-white/[0.03]">
                  <tr>
                    <th className="p-3 text-xs font-semibold">Profile</th>
                    <th className="p-3 text-xs font-semibold">Name</th>
                    <th className="p-3 text-xs font-semibold">Email</th>
                    <th className="p-3 text-xs font-semibold">Role</th>
                    <th className="p-3 text-xs font-semibold">Department</th>
                    <th className="p-3 text-xs font-semibold">Employment Type</th>
                    <th className="p-3 text-xs font-semibold">Phone</th>
                    <th className="p-3 text-xs font-semibold">View Details</th>
                    <th className="p-3 text-xs font-semibold">Actions</th>
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
                          <FaEye className="w-5 h-5" />
                        </Link>
                      </td>
                      <td className="p-3 text-xs">
                        <button
                          onClick={() => handleUnarchive(account.id)}
                          className={`text-green-600 hover:text-green-800 ${unarchivingId === account.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Unarchive"
                          disabled={unarchivingId === account.id}
                        >
                          {unarchivingId === account.id ? (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <FaUndo className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && accounts.length > 0 && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default Archive;
