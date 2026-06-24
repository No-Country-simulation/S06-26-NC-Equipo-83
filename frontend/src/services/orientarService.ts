import api from "../config/axios";
import type { OrientarResponse } from "../types/api";

export interface OrientarRequestParams {
  perfil: string;
  nivel: string;
  region: string;
  idioma: string;
  lat: number;
  lng: number;
}

export const orientarService = {
  async getAnalysis(params: OrientarRequestParams): Promise<OrientarResponse> {
    const { data } = await api.post<OrientarResponse>("/orientar", params);
    return data;
  },
};
