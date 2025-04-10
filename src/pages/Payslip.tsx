import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { format } from "date-fns";

interface Payslip {
  id: number;
  payrollDate: string;
  periodFrom: string;
  periodTo: string;
  netAmount: number;
}

export default function Payslip() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await fetch("http://localhost:4000/payslips");
        if (!response.ok) throw new Error("Failed to fetch payslips");
        const data = await response.json();
        setPayslips(data);
        setFilteredPayslips(data);
      } catch (err) {
        setError("Error fetching payslips.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      setFilteredPayslips(payslips);
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const filtered = payslips.filter((p) => {
      const payroll = new Date(p.payrollDate);
      return payroll >= from && payroll <= to;
    });

    setFilteredPayslips(filtered);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Home / Payroll / Payslip" />

      <div className="p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <label className="block mb-1 text-sm">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm mt-1 sm:mt-0"
            // onClick={handleFilter}
            disabled
          >
            Search
          </button>
        </div>

        {/* Temporary Placeholder */}
        <div className="text-center text-gray-500">
          Payslip data will appear here once backend is ready.
        </div>

        {/* Uncomment this part when backend is ready */}
        
        {loading ? (
          <p className="text-center text-gray-500">Loading payslips...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-100 rounded-lg shadow-sm text-left">
              <thead className="bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:bg-white/[0.03]">
                <tr>
                  <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Payroll Date</th>
                  <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Period From</th>
                  <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Period To</th>
                  <th className="border border-gray-100 dark:border-gray-800 p-3 text-sm font-semibold">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
                {filteredPayslips.length > 0 ? (
                  filteredPayslips.map((payslip) => (
                    <tr key={payslip.id} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                      <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                        {format(new Date(payslip.payrollDate), "yyyy-MM-dd")}
                      </td>
                      <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                        {format(new Date(payslip.periodFrom), "yyyy-MM-dd")}
                      </td>
                      <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                        {format(new Date(payslip.periodTo), "yyyy-MM-dd")}
                      </td>
                      <td className="border border-gray-100 dark:border-gray-800 p-3 text-sm">
                        ₱{payslip.netAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4">
                      No payslips found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )} 
       
      </div>
    </>
  );
}
