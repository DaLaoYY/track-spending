// components/ProtectedRoute.js
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  useEffect(() => {
    // Add your authentication check here
    // For example: if (!currentUser) router.push('/login');
    // You'll need to implement your own auth state management
  }, []);

  return children;
};

export default ProtectedRoute;
