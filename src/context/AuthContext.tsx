import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nickName?: string;
  suffix?: string;
  role: string;
  department: string;
  birthDate: string;
  maritalStatus: string;
  citizenship: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  isVerified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: Employee | null;
  login: (userData: Employee, token: string) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<Employee | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = (userData: Employee, token: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, setUser }}>
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
