"use client";

import { createContext, useContext, useState } from "react";

type UserContextType = {
  refreshUser: () => void;
  setRefreshUser: (refresh: () => void) => void;
};

const UserContext = createContext<UserContextType>({
  refreshUser: () => {},
  setRefreshUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [refreshUser, setRefreshUserState] = useState(() => () => {});

  return (
    <UserContext.Provider
      value={{
        refreshUser,
        setRefreshUser: setRefreshUserState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
