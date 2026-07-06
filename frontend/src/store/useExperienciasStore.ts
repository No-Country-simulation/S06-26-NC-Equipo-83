import { create } from "zustand";
import type { ExperienciasRequest, ExperienciasResponse } from "../types/api";
import { experienciasService } from "../services/experienciasService";
import { extractErrorMessage } from "../lib/errorUtils";

interface ExperienciasState {
  data: ExperienciasResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchRecomendaciones: (params: ExperienciasRequest) => Promise<void>;
  clearData: () => void;
}

export const useExperienciasStore = create<ExperienciasState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchRecomendaciones: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await experienciasService.getRecomendaciones(params);
      set({ data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: extractErrorMessage(err) });
    }
  },

  clearData: () => set({ data: null, error: null }),
}));
