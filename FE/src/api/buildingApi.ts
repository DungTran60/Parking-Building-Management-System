import { httpClient } from "./httpClient";

export interface Building {
  id?: number;
  buildingName: string;
  address: string;
  totalFloors: number;
  createdAt?: string;
}

export const buildingApi = {
  getAll: async (): Promise<Building[]> => {
    const response = await httpClient.get<Building[]>("/buildings");
    return response.data;
  },

  getById: async (id: number): Promise<Building> => {
    const response = await httpClient.get<Building>(`/buildings/${id}`);
    return response.data;
  },

  create: async (building: Omit<Building, "id" | "createdAt">): Promise<Building> => {
    const response = await httpClient.post<Building>("/buildings", building);
    return response.data;
  },

  update: async (id: number, building: Omit<Building, "id" | "createdAt">): Promise<Building> => {
    const response = await httpClient.put<Building>(`/buildings/${id}`, building);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/buildings/${id}`);
  }
};
