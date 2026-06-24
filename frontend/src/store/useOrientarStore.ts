import { create } from "zustand";
import type { OrientarResponse } from "../types/api";
import { orientarService, type OrientarRequestParams } from "../services/orientarService";
import { extractErrorMessage } from "../lib/errorUtils";

interface OrientarState {
  data: OrientarResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalysis: (params: OrientarRequestParams) => Promise<void>;
  clearData: () => void;
}

export const useOrientarStore = create<OrientarState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchAnalysis: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await orientarService.getAnalysis(params);
      set({ data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: extractErrorMessage(err) });
    }
  },

  clearData: () => set({ data: null, error: null }),
}));
