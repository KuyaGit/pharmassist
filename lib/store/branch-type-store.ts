import { create } from "zustand";
import { persist } from "zustand/middleware";

type BranchTypeStore = {
  branchType: "retail" | "wholesale";
  setBranchType: (type: "retail" | "wholesale") => void;
};

export const useBranchTypeStore = create<BranchTypeStore>()(
  persist(
    (set) => ({
      branchType: "retail",
      setBranchType: (type) => set({ branchType: type }),
    }),
    {
      name: "branch-type-storage",
    }
  )
);
