import { createResource, deleteResource, listResource, type ResourceName, updateResource } from "@/services/mockRepository";
import { httpClient } from "@/api/httpClient";

export const resourceService = {
  list: async <T>(name: ResourceName): Promise<T[]> => {
    if (name === "slots") {
      const response = await httpClient.get<T[]>("/slots");
      return response.data;
    }
    return listResource<T>(name);
  },
  create: createResource,
  update: async <T extends { id: string }>(name: ResourceName, id: string, payload: Partial<T>): Promise<T> => {
    if (name === "slots") {
      const response = await httpClient.put<T>(`/slots/${id}`, payload);
      return response.data;
    }
    return updateResource<T>(name, id, payload);
  },
  remove: deleteResource
};

export type { ResourceName };
