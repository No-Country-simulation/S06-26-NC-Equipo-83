import api from "../config/axios";
import type { User, RegisterResponse, UserCreateRequest } from "../types/api";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  async register(userData: UserCreateRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/auth/register", userData);
    return data;
  },

  async checkEmail(email: string): Promise<boolean> {
    const { data } = await api.get<{ registered: boolean }>(
      "/auth/check-email",
      { params: { email } },
    );
    return data.registered;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
