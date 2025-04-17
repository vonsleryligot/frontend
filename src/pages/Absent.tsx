import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../components/common/PageBreadCrumb";

interface AbsentRecord {
  id: number;
  employeeName: string;
  date: string;
  reason: string;
  status: "approved" | "pending" | "denied";
  remarks?: string;
}

// Commented out unused dummy data
// const dummyAbsentData: AbsentRecord[] = [
//   {
//     id: 1,
//     employeeName: "Juan Dela Cruz",
//     date: "2025-04-15",
//     reason: "Fever",
//     status: "pending",
//     remarks: "",
//   },
//   {
//     id: 2,
//     employeeName: "Maria Santos",
//     date: "2025-04-12",
//     reason: "Family Emergency",
//     status: "approved",
//     remarks: "Approved by HR",
//   },
//   {
//     id: 3,
//     employeeName: "Pedro Lopez",
//     date: "2025-04-10",
//     reason: "No show",
//     status: "denied",
//     remarks: "Unexcused absence",
//   },
// ];

const statusColors: Record<AbsentRecord["status"], string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  denied: "bg-red-100 text-red-800",
};

const Absent = () => {
  const [absentList, setAbsentList] = useState<AbsentRecord[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // Commented out dummy data initialization
  // useEffect(() => {
  //   setAbsentList(dummyAbsentData);
  // }, []);

  const handleSave = (id: number) => {
    setEditId(null);
    toast.success("Remarks updated!");
  };

  const handleChange = (id: number, value: string) => {
    const updated = absentList.map((item) =>
      item.id === id ? { ...item, remarks: value } : item
    );
    setAbsentList(updated);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Hours / Absent" />
      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        <div className="text-xl font-semibold mb-4">Absent Records</div>

        <div className="overflow-hidden mb-4">
          <table className="w-full border border-gray-100 rounded-lg shadow-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Employee</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Date</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Reason</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Status</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Remarks</th>
                <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
              {absentList.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                  <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{record.employeeName}</td>
                  <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{record.date}</td>
                  <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">{record.reason}</td>
                  <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                    {editId === record.id ? (
                      <textarea
                        className="w-full border rounded p-2 text-sm"
                        value={record.remarks}
                        onChange={(e) => handleChange(record.id, e.target.value)}
                      />
                    ) : (
                      <div className="line-clamp-2">{record.remarks || "-"}</div>
                    )}
                  </td>
                  <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                    {editId === record.id ? (
                      <button
                        className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                        onClick={() => handleSave(record.id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setEditId(record.id)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Absent;
