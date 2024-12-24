"use client";

import React, { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to the dashboard
        router.push("/dashboard"); // Replace "/dashboard" with your dashboard route
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [router]);

  const createUserInFirestore = async (user) => {
    const userRef = doc(database, "users", user.uid); // Reference to the user's document
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create the user document if it doesn't exist
      try {
        await setDoc(userRef, {
          name: user.displayName || "Anonymous",
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        alert("Create new user failed. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      createUserInFirestore(user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Google Login with Firebase</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          background: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;
