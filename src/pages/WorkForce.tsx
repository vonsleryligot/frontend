import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { EyeIcon } from "lucide-react";

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
}

const WorkForce = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

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

      const accountsWithImages = await Promise.all(
        data.map(async (account) => {
          try {
            const imgResponse = await fetch(`http://localhost:4000/profile-uploads/${account.id}`);
            if (!imgResponse.ok) throw new Error("No profile image");
            const imgData = await imgResponse.json();
            return { ...account, profile_image: `http://localhost:4000${imgData.profile.profile_image}` };
          } catch {
            return { ...account, profile_image: null };
          }
        })
      );

      setAccounts(accountsWithImages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  // Pagination Logic
  const indexOfLastAccount = currentPage * itemsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - itemsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Home / WorkForce" />
      <div className="overflow-x-auto p-4">
        <div className="p-6  rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-200 w-full md:w-auto"
            >
              <Link to="/add-account">+ Add Employee</Link>
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
                    <th className="p-3 text-sm font-semibold">Profile</th>
                    <th className="p-3 text-sm font-semibold">Account Details</th>
                    <th className="p-3 text-sm font-semibold">Email</th>
                    <th className="p-3 text-sm font-semibold">Role</th>
                    <th className="p-3 text-sm font-semibold">Department</th>
                    <th className="p-3 text-sm font-semibold">Employment Type</th>
                    <th className="p-3 text-sm font-semibold">Contact Number</th>
                    <th className="p-3 text-sm font-semibold">View Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-200">
                  {currentAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="p-3 text-sm">
                        <img
                          src={account.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.firstName + " " + account.lastName)}`}
                          alt="Profile"
                          className="w-15 h-15 rounded-full object-cover border"
                        />
                      </td>
                      <td className="p-3 text-sm">{account.firstName} {account.middleName} {account.lastName}</td>
                      <td className="p-3 text-sm">{account.email}</td>
                      <td className="p-3 text-sm">{account.role}</td>
                      <td className="p-3 text-sm">{account.department}</td>
                      <td className="p-3 text-sm">{account.employmentType}</td>
                      <td className="p-3 text-sm">{account.phone}</td>
                      <td className="p-3 text-sm text-center">
                        <button onClick={() => handleViewDetails(account)} className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="w-5 h-5" />
                        </button>
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
            <div className="text-sm">
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
      {showDetailsModal && selectedAccount && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Employee Details</h2>
            <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-red-500">
              ✖
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <img
              src={selectedAccount.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAccount.firstName + " " + selectedAccount.lastName)}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border shadow-md"
            />
            <h3 className="mt-2 text-lg font-semibold text-gray-800 dark:text-gray-300">
              {selectedAccount.firstName} {selectedAccount.middleName} {selectedAccount.lastName}
            </h3>
            <p className="text-sm text-gray-500">{selectedAccount.role} - {selectedAccount.department}</p>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> {selectedAccount.email}</p>
            <p><strong>Phone:</strong> {selectedAccount.phone}</p>
            <p><strong>Country:</strong> {selectedAccount.country}</p>
            <p><strong>City:</strong> {selectedAccount.city}</p>
            <p><strong>Postal Code:</strong> {selectedAccount.postalCode}</p>
          </div>

          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setShowDetailsModal(false)} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default WorkForce;