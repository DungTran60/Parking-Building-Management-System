import { httpClient } from "@/api/httpClient";

export type ResourceName = "buildings" | "vehicleTypes" | "floors" | "slots" | "pricingPolicies" | "sessions" | "reservations" | "payments" | "feedbackTickets" | "vehicles" | "users";

const API_MAP: Record<ResourceName, string> = {
  buildings: "/buildings",
  vehicleTypes: "/vehicle-types",
  floors: "/floors",
  slots: "/slots",
  pricingPolicies: "/pricing",
  sessions: "/sessions",
  reservations: "/reservations",
  payments: "/payments",
  feedbackTickets: "/feedbacks",
  vehicles: "/vehicles",
  users: "/users"
};

export const resourceService = {
  list: async <T>(name: ResourceName): Promise<T[]> => {
    const response = await httpClient.get<T[]>(API_MAP[name]);
    return response.data;
  },

  create: async <T extends { id: string }>(name: ResourceName, payload: Omit<T, "id">): Promise<T> => {
    const response = await httpClient.post<T>(API_MAP[name], payload);
    return response.data;
  },

  update: async <T extends { id: string }>(name: ResourceName, id: string, payload: Partial<T>): Promise<T> => {
    const response = await httpClient.put<T>(`${API_MAP[name]}/${id}`, payload);
    return response.data;
  },

  remove: async (name: ResourceName, id: string): Promise<void> => {
    await httpClient.delete(`${API_MAP[name]}/${id}`);
  }
};
