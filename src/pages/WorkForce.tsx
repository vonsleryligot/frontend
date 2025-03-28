import { useEffect, useState } from "react";
import AddEmployee from "./AddAccount";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

interface Account {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
  department: string;
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
  const [showModal, setShowModal] = useState(false);


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

      // Fetch profile images for each account
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

  return (
    <>
      <PageBreadcrumb pageTitle="WorkForce" />
      <div className="overflow-x-auto p-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg bg-white dark:bg-gray-900 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-400">Accounts</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search accounts..."
                className="w-full md:w-64 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-200 w-full md:w-auto"
              >
                + Add Account
              </button>
            </div>
          </div>

          <AddEmployee showModal={showModal} setShowModal={setShowModal} onAddAccount={fetchAccounts} />

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {loading ? (
            <p>Loading accounts...</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[640px] w-full border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm text-left">
                <thead className="bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-white/[0.03]">
                  <tr>
                    <th className="border border-gray-200 dark:border-gray-800 p-3 text-sm font-semibold">Profile</th>
                    <th className="border border-gray-200 dark:border-gray-800 p-3 text-sm font-semibold">Account Details</th>
                    <th className="border border-gray-200 dark:border-gray-800 p-3 text-sm font-semibold">Email</th>
                    <th className="border border-gray-200 dark:border-gray-800 p-3 text-sm font-semibold">Role</th>
                    <th className="border border-gray-200 dark:border-gray-800 p-3 text-sm font-semibold">Department</th>
                    <th className="border border-gray-200 dark:border-gray-800 p-3 text-sm font-semibold">Contact Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-200">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <td className="border border-gray-200 dark:border-gray-800 p-3 text-sm">
                          <img
                            src={
                              account.profile_image ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                account.firstName + " " + account.lastName
                              )}&background=random&color=fff`
                            }
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border"
                          />
                        </td>
                        <td className="border border-gray-200 dark:border-gray-800 p-3 text-sm">
                          {account.firstName} {account.middleName} {account.lastName}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-800 p-3 text-sm">{account.email}</td>
                        <td className="border border-gray-200 dark:border-gray-800 p-3 text-sm">{account.role}</td>
                        <td className="border border-gray-200 dark:border-gray-800 p-3 text-sm">{account.department}</td>
                        <td className="border border-gray-200 dark:border-gray-800 p-3 text-sm">{account.phone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 border text-center">No Accounts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkForce;