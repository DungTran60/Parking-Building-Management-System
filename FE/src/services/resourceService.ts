import { createResource, deleteResource, listResource, type ResourceName, updateResource } from "@/services/mockRepository";
import { httpClient } from "@/api/httpClient";

export const resourceService = {
  list: async <T>(name: ResourceName): Promise<T[]> => {
    if (name === "slots") {
      const response = await httpClient.get<T[]>("/slots");
      return response.data;
    }
    if (name === "vehicleTypes") {
      const response = await httpClient.get<T[]>("/vehicle-types");
      return response.data;
    }
    return listResource<T>(name);
  },
  create: async <T extends { id: string }>(name: ResourceName, payload: Omit<T, "id">): Promise<T> => {
    if (name === "slots") {
      const response = await httpClient.post<T>("/slots", payload);
      return response.data;
    }
    if (name === "vehicleTypes") {
      const response = await httpClient.post<T>("/vehicle-types", payload);
      return response.data;
    }
    return createResource<T>(name, payload);
  },
  update: async <T extends { id: string }>(name: ResourceName, id: string, payload: Partial<T>): Promise<T> => {
    if (name === "slots") {
      const response = await httpClient.put<T>(`/slots/${id}`, payload);
      return response.data;
    }
    if (name === "vehicleTypes") {
      const response = await httpClient.put<T>(`/vehicle-types/${id}`, payload);
      return response.data;
    }
    return updateResource<T>(name, id, payload);
  },
  remove: async (name: ResourceName, id: string): Promise<void> => {
    if (name === "slots") {
      await httpClient.delete(`/slots/${id}`);
      return;
    }
    if (name === "vehicleTypes") {
      await httpClient.delete(`/vehicle-types/${id}`);
      return;
    }
    return deleteResource(name, id);
  }
};

export type { ResourceName };
