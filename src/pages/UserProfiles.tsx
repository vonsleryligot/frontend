import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import UserEmploymentCard from "../components/UserProfile/UserEmploymentCard";
import UserCompensationCard from "../components/UserProfile/UserCompensationCard";

export default function UserProfiles() {
  return (
    <>
      <PageBreadcrumb pageTitle="Home / Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
          <UserEmploymentCard />
          <UserCompensationCard />
        </div>
      </div>
    </>
  );
}
