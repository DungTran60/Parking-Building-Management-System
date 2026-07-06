import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceService, type ResourceName } from "@/services/resourceService";

export interface ResourceApi<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  create: (payload: Omit<T, "id">) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export function useResources<T extends { id: string }>(name: ResourceName, api?: ResourceApi<T>) {
  return useQuery({
    queryKey: [name],
    queryFn: () => api ? api.getAll() : resourceService.list<T>(name)
  });
}

export function useResourceMutations<T extends { id: string }>(name: ResourceName, api?: ResourceApi<T>) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [name] });
  return {
    create: useMutation({ mutationFn: (payload: Omit<T, "id">) => api ? api.create(payload) : resourceService.create<T>(name, payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<T> }) => api ? api.update(id, payload) : resourceService.update<T>(name, id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => api ? api.delete(id) : resourceService.remove(name, id), onSuccess: invalidate })
  };
}
