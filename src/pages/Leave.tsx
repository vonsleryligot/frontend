import React from "react";

const Leave: React.FC = () => {
  // Placeholder for leave data
  const leaveData: any[] = []; // Replace with actual leave data when available

  return (
    <div className="p-6">
      <h2 className="text-gray-800 dark:text-white/90 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">Leave Balance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-gray-800 dark:text-white/90 rounded-2xl border dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <thead>
            <tr className="dark:border-gray-800 dark:bg-white/[0.03]">
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Units</th>
              <th className="px-4 py-2 border">Next Accrual</th>
              <th className="px-4 py-2 border">Schedule</th>
              <th className="px-4 py-2 border">Earned</th>
              <th className="px-4 py-2 border">Approved</th>
              <th className="px-4 py-2 border">Available Balance</th>
              <th className="px-4 py-2 border">Pending Approval</th>
            </tr>
          </thead>
          <tbody>
            {leaveData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No Data.
                </td>
              </tr>
            ) : (
              leaveData.map((leave, index) => (
                <tr key={index} className="border">
                  <td className="px-4 py-2 border">{leave.action}</td>
                  <td className="px-4 py-2 border">{leave.type}</td>
                  <td className="px-4 py-2 border">{leave.units}</td>
                  <td className="px-4 py-2 border">{leave.nextAccrual}</td>
                  <td className="px-4 py-2 border">{leave.schedule}</td>
                  <td className="px-4 py-2 border">{leave.earned}</td>
                  <td className="px-4 py-2 border">{leave.approved}</td>
                  <td className="px-4 py-2 border">{leave.availableBalance}</td>
                  <td className="px-4 py-2 border">{leave.pendingApproval}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leave;
