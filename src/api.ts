import axios from "axios";

// Backend API URL (update if your backend runs on a different port)
const API_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Sign In Function
export const signIn = async (email: string, password: string) => {
  try {
    const response = await api.post("/accounts/authenticate", { email, password });
    console.log("Login Response:", response.data);

    if (response.data?.jwtToken) {
      localStorage.setItem("token", response.data.jwtToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Ensure the auth state updates immediately
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

// Sign Up Function
export const signUp = async (data: {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  city: string;
  postalCode: string;
  acceptTerms: boolean;
}) => {
  console.log("SignUp Request Payload:", data); // Log the payload for debugging

  try {
    const response = await api.post("/accounts/register", data);
    console.log("SignUp Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Signup Error:", error.response?.data || error.message);
    throw error;
  }
};

// Forgot Password Function
export async function forgotPassword(email: string) {
  return api.post("/accounts/forgot-password", { email });
}

export default api;
