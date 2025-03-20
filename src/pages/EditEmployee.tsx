// import { useState } from "react";

// const EditEmployee = ({ showEditModal, setShowEditModal, employee, onUpdateEmployee }) => {
//   const [editedEmployee, setEditedEmployee] = useState(employee);

//   const handleChange = (e) => {
//     setEditedEmployee({ ...editedEmployee, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await fetch(`http://localhost:4000/employee/${editedEmployee.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(editedEmployee),
//       });

//       onUpdateEmployee();
//       setShowEditModal(false);
//     } catch (error) {
//       console.error("Failed to update employee:", error);
//     }
//   };

//   return (
//     showEditModal && (
//       <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 p-4">
//         <div className="bg-white p-6 rounded-lg shadow-xl">
//           <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
//           <form onSubmit={handleSubmit}>
//             <input type="text" name="firstName" value={editedEmployee.firstName} onChange={handleChange} />
//             <input type="text" name="lastName" value={editedEmployee.lastName} onChange={handleChange} />
//             <input type="email" name="email" value={editedEmployee.email} onChange={handleChange} />
//             <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">Save</button>
//           </form>
//         </div>
//       </div>
//     )
//   );
// };

// export default EditEmployee;
