import { List, Briefcase, Clock4Icon, AlarmClockCheck, ClockFading } from "lucide-react"; // Imported new icons
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useNavigate } from "react-router-dom";

const ToDo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageBreadcrumb pageTitle="Home / To Do" />
      <div className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">

        {/* Inline buttons with separate background and border */}
        <div className="mt-6 flex flex-wrap justify-start gap-4 mb-4">
          <button
            onClick={() => navigate("/timesheet")}
            className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full sm:w-auto"
          >
            <List size={40} /> {/* Changed icon */}
            <span className="text-lg">Timesheet</span>
          </button>
          <button
            onClick={() => navigate("/leave-approval")}
            className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full sm:w-auto"
          >
            <List size={40} /> {/* Changed icon */}
            <span className="text-lg">Leave Approval</span>
          </button>

          <button
            onClick={() => navigate("/todo-open-shifts")}
            className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full sm:w-auto"
          >
            <Briefcase size={40} /> {/* Changed icon */}
            <span className="text-lg">Open Shift</span>
          </button>

          <button
            onClick={() => navigate("/todo-regular-shifts")}
            className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full sm:w-auto"
          >
            <Clock4Icon size={40} /> {/* Changed icon */}
            <span className="text-lg">Regular Shift</span>
          </button>

          <button
            onClick={() => navigate("/todo-part-time-shifts")}
            className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full sm:w-auto"
          >
            <AlarmClockCheck size={40} /> {/* Changed icon */}
            <span className="text-lg">Part Time Shift</span>
          </button>

          <button
            onClick={() => navigate("/todo-apprenticeship-shifts")}
            className="text-gray-800 dark:text-white/90 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full sm:w-auto"
          >
            <ClockFading size={40} /> {/* Changed icon */}
            <span className="text-lg">Apprenticeship</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ToDo;