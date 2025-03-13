import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ roles }: { roles?: string[] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log("PrivateRoute - Loading:", loading);
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  console.log("PrivateRoute - User:", user);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    console.log("Redirecting to /signin");
    return <Navigate to="/signin" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log("Redirecting to /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};


export default PrivateRoute;
