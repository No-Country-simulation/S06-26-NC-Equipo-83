import { create } from "zustand";
import type { SaludResponse, SaludRequest } from "../types/api";
import { saludService } from "../services/saludService";
import { extractErrorMessage } from "../lib/errorUtils";

interface SaludState {
  currentResponse: SaludResponse | null;
  isLoading: boolean;
  error: string | null;
  sendCheckin: (data: SaludRequest) => Promise<void>;
  clearResponse: () => void;
}

export const useSaludStore = create<SaludState>((set) => ({
  currentResponse: null,
  isLoading: false,
  error: null,

  sendCheckin: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await saludService.sendCheckin(data);
      set({ currentResponse: response, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: extractErrorMessage(err) });
    }
  },

  clearResponse: () => set({ currentResponse: null, error: null }),
}));
