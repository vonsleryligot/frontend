import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UserMetaCard() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch(`http://localhost:4000/profile-uploads/${user?.id}`);
        if (!response.ok) throw new Error("Failed to fetch profile image");

        const data = await response.json();
        if (data.profile?.profile_image) {
          setProfileImage(`http://localhost:4000${data.profile.profile_image}`);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };

    if (user?.id) fetchProfileImage();
  }, [user?.id]);

  // Upload profile image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("profile_image", file);
    formData.append("account_id", user?.id ?? "");

    try {
      const response = await fetch("http://localhost:4000/profile-uploads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setProfileImage(`http://localhost:4000${data.profile.profile_image}?${Date.now()}`);
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
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
                e.currentTarget.src = "/images/default-profile.png";
              }}
              className="object-cover w-full h-full"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Upload profile image"
            >
              {isUploading ? "Uploading..." : profileImage ? "Change" : "Upload"}
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
            {user?.title || ""} {user?.firstName || "User"} {user?.lastName || ""}
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