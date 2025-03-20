import { FileText } from "lucide-react"; 
import { useNavigate } from "react-router-dom"; // Import Router navigation

const ToDo: React.FC = () => {
  const navigate = useNavigate();

  const handleTimesheetClick = () => {
    navigate("/timesheet"); // Redirect to Timesheet page
  };

  return (
    <div className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <h2 className="text-2xl font-bold">ToDo</h2>
      <div className="mt-6 flex justify-start">
        <button onClick={handleTimesheetClick} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <FileText size={40} /> {/* Large icon */}
          <span className="text-lg">Timesheet</span>
        </button>
      </div>
    </div>
  );
};

export default ToDo;
