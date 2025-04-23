import { useState, useEffect } from 'react';
import { FaArchive, FaUndo, FaEye } from 'react-icons/fa'; // Icons for Archive, Unarchive, and View
import axios from 'axios'; // For API requests
import { Link } from 'react-router-dom';
import PageBreadcrumb from "../components/common/PageBreadCrumb";

interface Item {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  employmentType: string;
  phone: string;
  profile_image: string;
  isArchived: boolean;
}

const Archive = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch items from the backend API
  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/items?page=${currentPage}&search=${search}`); // Adjust API endpoint as needed
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Archive/unarchive an item
  const toggleArchive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(`/api/items/${id}`, { isArchived: newStatus }); // Replace with your API endpoint
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, isArchived: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, search]);

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

          {loading ? (
            <p>Loading accounts...</p>
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
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="p-3 text-xs">
                        <img
                          src={item.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      </td>
                      <td className="p-3 text-xs">{item.name}</td>
                      <td className="p-3 text-xs">{item.email}</td>
                      <td className="p-3 text-xs">{item.role}</td>
                      <td className="p-3 text-xs">{item.department}</td>
                      <td className="p-3 text-xs">{item.employmentType}</td>
                      <td className="p-3 text-xs">{item.phone}</td>
                      <td className="p-3 text-xs text-center">
                        <Link to={`/employee-details/${item.id}`} className="text-blue-600 hover:text-blue-800">
                          <FaEye className="w-5 h-5" />
                        </Link>
                      </td>
                      <td className="p-3 text-xs">
                        <button
                          onClick={() => toggleArchive(item.id, item.isArchived)}
                          className="text-red-600 hover:text-red-800"
                          title={item.isArchived ? "Unarchive" : "Archive"}
                        >
                          {item.isArchived ? (
                            <FaUndo className="w-5 h-5" />
                          ) : (
                            <FaArchive className="w-5 h-5" />
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

export default Archive;
