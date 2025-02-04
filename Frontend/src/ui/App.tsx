import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"; // Corrected import
import Home from "./page/Home";
import { useUser } from "@clerk/clerk-react";
import axios, { AxiosResponse } from "axios";

// Define the shape of the API response
interface UserCheckResponse {
  success: boolean;
  // Add other fields if necessary
}

const App: React.FC = () => {
  const { user } = useUser(); // Destructure user from useUser hook
  const [redirect, setRedirect] = useState<boolean>(false); // State to manage redirection
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading status

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        try {
          const clerkRef: string = user.id;
          const response: AxiosResponse<UserCheckResponse> = await axios.post(
            "http://localhost:3000/api/usercheck",
            { clerkRef }
          );
          console.log(response.data.success);

          if (!response.data.success) {
            setRedirect(true); // Set redirect state if check fails
          }
        } catch (error) {
          console.error("Error checking user:", error);
        }
      }
      setLoading(false); 
    };

    checkUser();
  }, []); // Added user as a dependency

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator while checking
  }

  if (redirect) {
    return <Navigate to="/userdata" />; // Redirect if necessary
  }

  return (
    <header>
      <div>
        <Home />
      </div>
    </header>
  );
};

export default App;