import { useAuth } from "../../context/AuthContext";

export default function UserMetaCard() {
  // const {openModal} = useModal();
  const { user } = useAuth(); 


  return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Profile Image */}
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName?.charAt(0) || "U")}&background=random&color=fff`}
              alt="User"
              onError={(e) => {
                e.currentTarget.src = "/images/default-profile.png"; // Fallback image
              }}
              className="object-cover w-full h-full"
            />
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  <span>{user?.firstName || "User"} {user?.lastName || ""}</span>
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
