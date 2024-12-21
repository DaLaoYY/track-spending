import { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  signOut as signOutFireBase,
  signInWithEmailAndPassword,
} from "firebase/auth";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sign-in successful!");
    } catch (error) {
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      await signOutFireBase(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        onChange={(e) => setPassword(e.target.value)}
      />{" "}
      <button onClick={signIn}>Sign in</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
