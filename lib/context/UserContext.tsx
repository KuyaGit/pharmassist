"use client";

import { createContext, useContext, useState } from "react";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  username: string;
  role: string;
  branch_id?: number;
  profile?: UserProfile;
  full_name?: string;
  email?: string;
}

type UserContextType = {
  refreshUser: () => void;
  setRefreshUser: (refresh: () => void) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType>({
  refreshUser: () => {},
  setRefreshUser: () => {},
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [refreshUser, setRefreshUserState] = useState(() => () => {});
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider
      value={{
        refreshUser,
        setRefreshUser: setRefreshUserState,
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
