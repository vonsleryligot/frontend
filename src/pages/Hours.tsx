// import React from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Hours: React.FC = () => {
//   const { user } = useAuth(); // Get user info including employment type

//   // Determine which subnav items to show based on employment type
//   const subNavItems = [];

//   if (user?.employmentType === "Regular") {
//     subNavItems.push({ name: "Regular Shift", path: "/hours/regular-shifts" });
//   } else if (user?.employmentType === "Open Shift") {
//     subNavItems.push({ name: "Open Shifts", path: "/hours/open-shifts" });
//   }

//   // return (
//   //   <div className="hours-page">
//   //     <h1 className="text-2xl font-bold mb-4">Hours</h1>
//   //     <nav className="subnav">
//   //       <ul className="flex gap-4">
//   //         {subNavItems.map((item) => (
//   //           <li key={item.name}>
//   //             <Link to={item.path} className="text-blue-500 hover:underline">
//   //               {item.name}
//   //             </Link>
//   //           </li>
//   //         ))}
//   //       </ul>
//   //     </nav>
//   //   </div>
//   // );
// };

// export default Hours;