import axios from "../axios";
import React, { useContext, useEffect, useState } from "react";

const UserContext = React.createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        const res = await axios.get("/api/user", {
          withCredentials: true,
        });
        setCurrentUser({
          id: res.data.id,
          email: res.data.email,
          password: res.data.password,
          picture: res.data.picture,
        });
        setLoading(false);
      } catch (err) {
        setCurrentUser();
        setLoading(false);
      }
    }
    getUser();
  }, []);
  const value = { currentUser, setCurrentUser };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}
