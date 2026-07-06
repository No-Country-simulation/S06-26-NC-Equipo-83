import api from "../config/axios";
import type { ExperienciasRequest, ExperienciasResponse } from "../types/api";

export const experienciasService = {
  async getRecomendaciones(data: ExperienciasRequest): Promise<ExperienciasResponse> {
    const { data: response } = await api.post<ExperienciasResponse>("/experiencias", data);
    return response;
  },
};
