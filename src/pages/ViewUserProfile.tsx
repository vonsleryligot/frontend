// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { Modal } from "../components/ui/modal";
// import Button from "../components/ui/button/Button";
// import Input from "../components/form/input/InputField";
// import Label from "../components/form/Label";
// import { toast } from "react-toastify";

// export default function ViewUserProfile() {
//   const { user, setUser } = useAuth();
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isFetchingImage, setIsFetchingImage] = useState(true); // Loading state for profile image
//   const [isOpen, setIsOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     phone: "",
//   });

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         phone: user.phone || "",
//       });
//       fetchProfileImage();
//     }
//   }, [user]);

//   const fetchProfileImage = async () => {
//     try {
//       const response = await fetch(`http://localhost:4000/profile-uploads/${user?.id}`);
//       if (!response.ok) throw new Error("Failed to fetch profile image");
//       const data = await response.json();
//       if (data.profile?.profile_image) {
//         setProfileImage(`http://localhost:4000${data.profile.profile_image}`);
//       }
//     } catch (error) {
//       console.error("Error fetching profile image:", error);
//     } finally {
//       setIsFetchingImage(false); // Stop loading after fetching
//     }
//   };

//   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith("image/")) {
//       alert("Please upload a valid image file.");
//       return;
//     }

//     setIsUploading(true);
//     const formData = new FormData();
//     formData.append("profile_image", file);
//     formData.append("account_id", user?.id ?? "");

//     try {
//       const response = await fetch("http://localhost:4000/profile-uploads", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setProfileImage(`http://localhost:4000${data.profile.profile_image}`);
//       } else {
//         console.error("Upload failed:", data.message);
//       }
//     } catch (error) {
//       console.error("Error uploading image:", error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = async (event: React.FormEvent) => {
//     event.preventDefault(); // Prevent form submission default action
//     if (!user) {
//       toast.error("User is not logged in or available.");
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:4000/accounts/${user.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
//       const updatedUser = await response.json();
//       if (!response.ok) throw new Error(updatedUser.message || "Failed to update user");
//       setUser(updatedUser);
//       toast.success("Profile updated successfully!");
//       setIsOpen(false);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "An error occurred");
//     }
//   };

//   return (
//     <div className="p-5 border rounded-2xl dark:border-gray-800 lg:p-6">
//       <div className="flex flex-col items-center gap-5 xl:flex-row">
//         <div className="relative w-35 h-35 border rounded-full overflow-hidden">
//           <img
//             src={
//               profileImage ||
//               `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || "U")}&background=random&color=fff`
//             }
//             alt="User"
//             className="object-cover w-full h-full"
//           />
//           {isFetchingImage && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm">Loading...</div>}
//           <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm cursor-pointer opacity-0 hover:opacity-100">
//             {isUploading ? "Uploading..." : "Upload"}
//             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
//           </label>
//         </div>
//         <div>
//           <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">{user?.firstName} {user?.lastName}</h4>
//           <p className="text-base text-gray-500 dark:text-gray-400">{user?.role || "N/A"}</p>
//         </div>
//       </div>
//       <Button type="button" onClick={() => setIsOpen(true)}>Edit Profile</Button>
//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
//         <div className="p-6 bg-white rounded-lg dark:bg-gray-900">
//           <h4 className="text-2xl font-semibold">Edit Profile</h4>
//           <form className="flex flex-col gap-4" onSubmit={handleSave}>
//             <Label htmlFor="firstName">First Name</Label>
//             <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
//             <Label htmlFor="lastName">Last Name</Label>
//             <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
//             <Label htmlFor="phone">Phone</Label>
//             <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
//             <Button type="submit" disabled={isUploading}>Save Changes</Button>
//           </form>
//         </div>
//       </Modal>
//     </div>
//   );
// }
