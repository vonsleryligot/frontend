// import { useState } from "react";

// // Attendance Log Type
// interface AttendanceLog {
//   id: number;
//   user_id: number;
//   check_in: string | null;
//   check_out: string | null;
//   status: "Present" | "Absent" | "Late" | "On Leave";
// }

// // Sample Data
// const initialLogs: AttendanceLog[] = [
//   { id: 1, user_id: 101, check_in: "08:30 AM", check_out: "05:00 PM", status: "Present" },
//   { id: 2, user_id: 102, check_in: "09:15 AM", check_out: "04:45 PM", status: "Late" },
//   { id: 3, user_id: 103, check_in: null, check_out: null, status: "Absent" },
// ];

// export default function Hours() {
//   const [logs] = useState<AttendanceLog[]>(initialLogs);

//   return (
//     <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px", maxWidth: "600px" }}>
//       <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Attendance Log</h2>
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
//             <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>User ID</th>
//             <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Check-in</th>
//             <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Check-out</th>
//             <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {logs.map((log) => (
//             <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
//               <td style={{ padding: "8px" }}>{log.user_id}</td>
//               <td style={{ padding: "8px" }}>{log.check_in || "N/A"}</td>
//               <td style={{ padding: "8px" }}>{log.check_out || "N/A"}</td>
//               <td
//                 style={{
//                   padding: "8px",
//                   fontWeight: "bold",
//                   color: log.status === "Present" ? "green" : log.status === "Late" ? "orange" : "red",
//                 }}
//               >
//                 {log.status}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
