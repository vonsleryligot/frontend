import { Link } from "react-router-dom";

interface BreadcrumbProps {
  pageTitle: string; // Example: "Home / To Do / TimeSheet"
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const pages = pageTitle.split(" / ");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pages[pages.length - 1]}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          {pages.map((page, index) => (
            <li key={index} className="flex items-center">
              {index < pages.length - 1 ? (
                <>
                  <Link
                    to="#"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    {page}
                  </Link>
                  <svg
                    className="stroke-current mx-1"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              ) : (
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {page}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
