// src/hooks/useAuth.ts
import { useState, useEffect } from "react";

interface User {
  role: string;
  employmentType: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Example: fetch user data from an API or localStorage
    const fetchUserData = async () => {
      // Replace this with actual fetching logic
      setUser({
        role: "Manager", // Example role
        employmentType: "Regular", // Example employment type
      });
    };

    fetchUserData();
  }, []);

  return { user };
};
