// import { ReactNode } from "react";

// interface DialogProps {
//   children: ReactNode;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const Dialog = ({ children, isOpen, onClose }: DialogProps) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
//         <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
//           &times;
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// };

// interface DialogTriggerProps {
//   children: ReactNode;
//   onClick: () => void;
// }

// export const DialogTrigger = ({ children, onClick }: DialogTriggerProps) => {
//   return (
//     <div onClick={onClick} className="cursor-pointer">
//       {children}
//     </div>
//   );
// };

// interface DialogContentProps {
//   children: ReactNode;
// }

// export const DialogContent = ({ children }: DialogContentProps) => {
//   return <div className="mt-4">{children}</div>;
// };

// interface DialogHeaderProps {
//   children: ReactNode;
// }

// export const DialogHeader = ({ children }: DialogHeaderProps) => {
//   return <div className="text-lg font-bold mb-2">{children}</div>;
// };

// interface DialogTitleProps {
//   children: ReactNode;
// }

// export const DialogTitle = ({ children }: DialogTitleProps) => {
//   return <h2 className="text-xl font-semibold">{children}</h2>;
// };

// interface DialogFooterProps {
//   children: ReactNode;
// }

// export const DialogFooter = ({ children }: DialogFooterProps) => {
//   return <div className="mt-4 flex justify-end gap-2">{children}</div>;
// };
