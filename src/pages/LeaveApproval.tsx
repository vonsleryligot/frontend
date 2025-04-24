import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageBreadcrumb from "../components/common/PageBreadCrumb";

interface LeaveRequest {
  id: number;
  employeeId: number;
  action: string;
  type: string;
  units: string;
  nextAccrual: string;
  schedule: string;
  earned: string;
  approved: string;
  availableBalance: string;
  pendingApproval: string;
  dateFiled: string;
  period: string;
  requested: string;
  previousBalance: string;
  shift: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  paid: string;
  reason: string;
  remarks: string;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const LeaveApproval: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/leaves/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLeaveRequests(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('You are not authorized to view leave requests. Please log in as an admin.');
      } else {
        setError('Failed to fetch pending leave requests. Please try again later.');
      }
      console.error('Error fetching pending leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/leaves/${id}/approve`, 
        { remarks: 'Approved by admin' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await fetchPendingLeaves();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('You are not authorized to approve leave requests. Please log in as an admin.');
      } else {
        setError('Failed to approve leave request. Please try again.');
      }
      console.error('Error approving leave request:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoadingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/leaves/${id}/reject`, 
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRejectionReason('');
      setSelectedLeaveId(null);
      await fetchPendingLeaves();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('You are not authorized to reject leave requests. Please log in as an admin.');
      } else {
        setError('Failed to reject leave request. Please try again.');
      }
      console.error('Error rejecting leave request:', err);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Home / To Do / Leave Approval" />
      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-100 rounded-lg shadow-sm text-left">
            <thead className="bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:bg-white/[0.03]">
              <tr>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Employee</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Type</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Period</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Units</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Reason</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Status</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    No pending leave requests available.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-800">
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.employee.firstName} {request.employee.lastName}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.type}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.period}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.units}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.reason}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.status}
                    </td>
                    <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                      {request.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            className={`bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center justify-center ${
                              loadingId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleApprove(request.id)}
                            disabled={loadingId === request.id}
                          >
                            {loadingId === request.id ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center justify-center ${
                              loadingId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              setSelectedLeaveId(request.id);
                              setRejectionReason('');
                            }}
                            disabled={loadingId === request.id}
                          >
                            {loadingId === request.id ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {selectedLeaveId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Reject Leave Request</h3>
            <textarea
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => {
                  setSelectedLeaveId(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleReject(selectedLeaveId)}
                disabled={!rejectionReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveApproval;
