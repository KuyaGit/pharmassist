"use client";

import { createContext, useContext, useState } from "react";

type ViewType = "retail" | "wholesale";

interface ViewContextType {
  view: ViewType;
  setView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewType>("retail");

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
