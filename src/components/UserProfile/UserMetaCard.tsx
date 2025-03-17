import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UserMetaCard() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Access the uploaded file
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }

      setIsUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        // setProfileImage(reader.result);
        setIsUploading(false);

        // Here you can add an API call to save the image to the server
        // Example:
        // uploadImageToServer(file).then(() => {
        //   setIsUploading(false);
        // }).catch((error) => {
        //   console.error("Error uploading image:", error);
        //   setIsUploading(false);
        // });
      };
      reader.onerror = () => {
        console.error("Error reading file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {/* Profile Image with Upload Option */}
          <div className="relative w-35 h-35 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img
              src={
                profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.firstName?.charAt(0) || "U"
                )}&background=random&color=fff`
              }
              alt="User"
              onError={(e) => {
                e.currentTarget.src = "/images/default-profile.png"; // Fallback image
              }}
              className="object-cover w-full h-full"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Upload profile image"
            >
              {isUploading ? "Uploading..." : "Upload"}
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* User Details */}
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-2xl font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              <span>
                {user?.firstName || "User"} {user?.lastName || ""}
              </span>
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-base text-gray-500 dark:text-gray-400">
                {user?.role || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}