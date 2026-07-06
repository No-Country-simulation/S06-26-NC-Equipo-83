import api from "../config/axios";
import type { EventCreateRequest, EventResponse, EventListResponse } from "../types/api";

export const eventsService = {
  async create(data: EventCreateRequest): Promise<EventResponse> {
    const { data: response } = await api.post<EventResponse>("/events", data);
    return response;
  },

  async list(cluster?: string): Promise<EventListResponse> {
    const params = cluster ? { cluster } : {};
    const { data } = await api.get<EventListResponse>("/events", { params });
    return data;
  },

  async getById(id: string): Promise<EventResponse> {
    const { data } = await api.get<EventResponse>(`/events/${id}`);
    return data;
  },
};
