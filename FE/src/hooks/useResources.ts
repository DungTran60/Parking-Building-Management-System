import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceService, type ResourceName } from "@/services/resourceService";

export function useResources<T>(name: ResourceName) {
  return useQuery({
    queryKey: [name],
    queryFn: () => resourceService.list<T>(name)
  });
}

export function useResourceMutations<T extends { id: string }>(name: ResourceName) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [name] });
  return {
    create: useMutation({ mutationFn: (payload: Omit<T, "id">) => resourceService.create<T>(name, payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<T> }) => resourceService.update<T>(name, id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => resourceService.remove(name, id), onSuccess: invalidate })
  };
}
