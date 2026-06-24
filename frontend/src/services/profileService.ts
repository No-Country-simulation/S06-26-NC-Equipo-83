import api from "../config/axios";
import type { User } from "../types/api";

export const profileService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const { data: response } = await api.put<User>(`/users/${userId}`, data);
    return response;
  },
};
