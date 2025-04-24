import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  department: string;
  employmentType: string; 
  status: string;
  email: string;
  position: string;
  rank: string;
  bank: string;
  rate: string;
  role: string;
  phone: number;
  country: string;
  city: string;
  postalCode: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null; // Add token here
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("Stored User Data:", parsedUser); // Debug log
        console.log("Stored Employment Type:", parsedUser.employmentType); // Debug log
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user"); // Remove corrupted data
      }
    }

    setLoading(false);
  }, []);
  

  const login = async (userData: User, token: string) => {
    try {
      // Ensure employmentType is properly set
      console.log("Login User Data:", userData); // Debug log
      console.log("Employment Type:", userData.employmentType); // Debug log
      
      // Fetch employment type from employments/account endpoint
      const response = await fetch(`http://localhost:4000/employments/account/${userData.id}`);
      if (!response.ok) throw new Error("Failed to fetch employment data");
      
      const employmentData = await response.json();
      console.log("Employment Data:", employmentData);
      
      // Update user data with employment type
      const updatedUserData = {
        ...userData,
        employmentType: employmentData.employmentType || userData.employmentType
      };
      
      console.log("Updated User Data:", updatedUserData); // Debug log
      
      // Store the updated user data
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error during login:", error);
      throw error; // Re-throw to handle in the calling component
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};