import React, { useState, useEffect } from "react";
import axios from "axios";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import LeaveModal from "../pages/LeaveModal";
import { PlusIcon } from "../icons";

// Interfaces for the props and data
interface LeaveType {
  action: string;
  type: string;
  units: string;
  nextAccrual: string;
  schedule: string;
  earned: string;
  approved: string;
  availableBalance: string;
  pendingApproval: string;
}

interface LeaveHistory {
  id: number;
  action: string;
  type: string;
  units: string;
  dateFiled: string;
  period: string;
  status: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const Leave: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);
  const [filteredLeaveHistory, setFilteredLeaveHistory] = useState<LeaveHistory[]>([]);
  const [leaveTypesPage, setLeaveTypesPage] = useState(1);
  const [leaveHistoryPage, setLeaveHistoryPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const leaveTypesPerPage = 5;
  const leaveHistoryPerPage = 5;

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        setError('User information not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:4000/leaves/employee/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Filter only approved leaves
      const approvedLeaves = response.data.filter((leave: LeaveHistory) => leave.status === 'Approved');
      setLeaveHistory(approvedLeaves);
      setFilteredLeaveHistory(approvedLeaves);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('You are not authorized to view leave history. Please log in.');
      } else {
        setError('Failed to fetch leave history. Please try again later.');
      }
      console.error('Error fetching leave history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  useEffect(() => {
    setFilteredLeaveHistory(
      leaveHistory.filter((leave) =>
        `${leave.action} ${leave.type} ${leave.units} ${leave.dateFiled} ${leave.period}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, leaveHistory]);

  const totalLeaveTypesPages = Math.ceil(leaveTypes.length / leaveTypesPerPage);
  const totalLeaveHistoryPages = Math.ceil(filteredLeaveHistory.length / leaveHistoryPerPage);

  const currentLeaveTypes = leaveTypes.slice(
    (leaveTypesPage - 1) * leaveTypesPerPage,
    leaveTypesPage * leaveTypesPerPage
  );

  const currentLeaveHistory = filteredLeaveHistory.slice(
    (leaveHistoryPage - 1) * leaveHistoryPerPage,
    leaveHistoryPage * leaveHistoryPerPage
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Hours / Leave History" />
      <div className="overflow-x-auto p-4">
        <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-200">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Leave History Table */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-400">Leave History</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search leaves..."
                  className="w-full md:w-64 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-200 w-full md:w-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="flex justify-center items-center w-full">
                    <PlusIcon className="text-lg text-white" />
                  </div>
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="min-w-[640px] w-full border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm text-left">
                <thead className="bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-white/[0.03]">
                  <tr>
                    <th className="p-3 text-xs font-semibold">Action</th>
                    <th className="p-3 text-xs font-semibold">Type</th>
                    <th className="p-3 text-xs font-semibold">Units</th>
                    <th className="p-3 text-xs font-semibold">Date Filed</th>
                    <th className="p-3 text-xs font-semibold">Period</th>
                    <th className="p-3 text-xs font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        <div className="flex justify-center items-center">
                          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="ml-2">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentLeaveHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-gray-500">
                        No approved leave requests found.
                      </td>
                    </tr>
                  ) : (
                    currentLeaveHistory.map((history) => (
                      <tr key={history.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <td className="p-3 text-xs">{history.action}</td>
                        <td className="p-3 text-xs">{history.type}</td>
                        <td className="p-3 text-xs">{history.units}</td>
                        <td className="p-3 text-xs">{history.dateFiled}</td>
                        <td className="p-3 text-xs">{history.period}</td>
                        <td className="p-3 text-xs">
                          <span className="px-2 py-1 text-xs font-semibold text-green-800">
                            {history.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setLeaveHistoryPage(Math.max(1, leaveHistoryPage - 1))}
                className="bg-gray-500 text-white px-4 py-2 rounded"
                disabled={leaveHistoryPage === 1}
              >
                Previous
              </button>
              <div className="text-xs">
                Page {leaveHistoryPage} of {totalLeaveHistoryPages}
              </div>
              <button
                onClick={() => setLeaveHistoryPage(Math.min(totalLeaveHistoryPages, leaveHistoryPage + 1))}
                className="bg-gray-500 text-white px-4 py-2 rounded"
                disabled={leaveHistoryPage === totalLeaveHistoryPages}
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
      
      {/* Modal Component */}
      <LeaveModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
    </>
  );
};

export default Leave;
