import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  roles?: string[];
}

const PrivateRoute = ({ roles }: PrivateRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log("PrivateRoute - Loading:", loading);
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  console.log("PrivateRoute - User:", user);

  // Show loading state if authentication data is still loading
  if (loading) return <div>Loading...</div>;

  // Redirect to sign-in page if not authenticated
  if (!isAuthenticated || !user) {
    console.log("Redirecting to /signin");
    return <Navigate to="/signin" replace />;
  }

  // Redirect to unauthorized page if user role doesn't match
  if (roles && !roles.includes(user.role)) {
    console.log("Redirecting to /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and role is valid (if provided), render the children route
  return <Outlet />;
};

export default PrivateRoute;
