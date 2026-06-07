import { createResource, deleteResource, listResource, type ResourceName, updateResource } from "@/services/mockRepository";

export const resourceService = {
  list: listResource,
  create: createResource,
  update: updateResource,
  remove: deleteResource
};

export type { ResourceName };
