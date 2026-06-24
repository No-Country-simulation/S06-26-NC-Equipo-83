import api from "../config/axios";
import type { SaludRequest, SaludResponse } from "../types/api";

export const saludService = {
  async sendCheckin(data: SaludRequest): Promise<SaludResponse> {
    const { data: response } = await api.post<SaludResponse>("/salud", data);
    return response;
  },
};
