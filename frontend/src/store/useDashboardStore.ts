import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JobMatchDetail } from "../types/api";

interface DashboardState {
  selectedVacancy: JobMatchDetail | null;
  selectVacancy: (vacancy: JobMatchDetail) => void;
  clearVacancy: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      selectedVacancy: null,
      selectVacancy: (vacancy) => set({ selectedVacancy: vacancy }),
      clearVacancy: () => set({ selectedVacancy: null }),
    }),
    { name: "bit-dashboard" }
  )
);
