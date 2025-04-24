import React, { useState } from "react";
import axios from "axios";

interface LeaveFormProps {
  isOpen: boolean;
  closeModal: () => void;
}

const LeaveModal: React.FC<LeaveFormProps> = ({ isOpen, closeModal }) => {
  const [formData, setFormData] = useState({
    action: "",
    type: "",
    units: "",
    nextAccrual: "",
    schedule: "",
    earned: "",
    approved: "",
    availableBalance: "",
    pendingApproval: "",
    dateFiled: new Date().toISOString().split('T')[0],
    period: "",
    requested: "",
    previousBalance: "",
    shift: "",
    reason: "",
    remarks: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    if (!formData.action || !formData.type || !formData.units) {
      setError("Action, type, and units are required.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        setError("User information not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/leaves",
        {
          employeeId: user.id,
          action: formData.action,
          type: formData.type,
          units: formData.units,
          nextAccrual: formData.nextAccrual || null,
          schedule: formData.schedule || null,
          earned: formData.earned || null,
          approved: formData.approved || null,
          availableBalance: formData.availableBalance || null,
          pendingApproval: formData.pendingApproval || null,
          dateFiled: formData.dateFiled || null,
          period: formData.period || null,
          requested: formData.requested || null,
          previousBalance: formData.previousBalance || null,
          shift: formData.shift || null,
          reason: formData.reason || null,
          remarks: formData.remarks || null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Backend Response:', response.data);
      closeModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("You are not authorized to submit leave requests. Please log in.");
        } else if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("Failed to submit leave request. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error('Error submitting leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200 p-8 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">File a Leave</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="action"
              placeholder="Action"
              value={formData.action}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="type"
              placeholder="Leave Type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="units"
              placeholder="Units"
              value={formData.units}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="period"
              placeholder="Period"
              value={formData.period}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              name="dateFiled"
              value={formData.dateFiled}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="reason"
              placeholder="Reason for leave"
              value={formData.reason}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Leave'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );  
};

export default LeaveModal;
