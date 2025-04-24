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
  token: string | null;
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

    if (storedToken && userData && userData !== "undefined") {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && typeof parsedUser === 'object') {
          console.log("Stored User Data:", parsedUser);
          console.log("Stored Employment Type:", parsedUser.employmentType);
          setUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          console.warn("Invalid user data format");
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    } else {
      // Clear any invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }

    setLoading(false);
  }, []);

  const login = async (userData: User, token: string) => {
    try {
      if (!userData || !token) {
        throw new Error("Invalid user data or token");
      }

      console.log("Login User Data:", userData);
      
      // Store initial account data
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setToken(token);
      setIsAuthenticated(true);

      // Then separately fetch employment data
      try {
        const employmentResponse = await fetch(`http://localhost:4000/employments/account/${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (employmentResponse.ok) {
          const employmentData = await employmentResponse.json();
          console.log("Employment Data:", employmentData);
          
          if (employmentData && employmentData.employmentType) {
            const updatedUserData = {
              ...userData,
              employmentType: employmentData.employmentType
            };
            
            // Update stored user data with employment info
            localStorage.setItem("user", JSON.stringify(updatedUserData));
            setUser(updatedUserData);
          }
        } else {
          console.warn("Could not fetch employment data:", await employmentResponse.text());
        }
      } catch (employmentError) {
        console.error("Error fetching employment data:", employmentError);
        // Continue with original user data if employment fetch fails
      }

    } catch (error) {
      console.error("Error during login:", error);
      // Clean up any partial data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw error;
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