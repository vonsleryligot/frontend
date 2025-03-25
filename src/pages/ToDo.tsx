import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface ActionLog {
  id: number;
  user: {
    fullName: string;
  };
  shiftId: number;
  details: string;
  status: string;
  timestamp: string;
}

const ToDo: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActionLog[]>([]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/api/action-logs");
      setLogs(response.data.filter((log: ActionLog) => log.status === "pending")); // Show only pending
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.put(`/api/action-logs/${id}/approve`);
      fetchLogs(); // Refresh after approving
    } catch (error) {
      console.error("Error approving log:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.put(`/api/action-logs/${id}/reject`);
      fetchLogs(); // Refresh after rejecting
    } catch (error) {
      console.error("Error rejecting log:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <h2 className="text-2xl font-bold">ToDo</h2>

      <div className="mt-6 flex justify-start mb-4">
        <button onClick={() => navigate("/timesheet")} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <FileText size={40} />
          <span className="text-lg">Timesheet</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500">No pending shift change requests.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm border-b border-gray-300">
              <th className="p-2">User Full Name</th>
              <th className="p-2">Shift ID</th>
              <th className="p-2">Details</th>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-white/10">
                <td className="p-2">{log.user.fullName}</td>
                <td className="p-2">{log.shiftId}</td>
                <td className="p-2">{log.details}</td>
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleApprove(log.id)}
                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                  >
                    <CheckCircle size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(log.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ToDo;
