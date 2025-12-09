import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import api from "../lib/axios";

// Fetch all workspaces for current user
export function useWorkspaces() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const token = await getToken();
      const res = await api.get("/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
}

// Fetch single workspace by ID
export function useWorkspace(workspaceId) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const token = await getToken();
      const res = await api.get(`/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!workspaceId,
  });
}

// Create new workspace
export function useCreateWorkspace() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      const res = await api.post("/workspaces", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

// Update workspace
export function useUpdateWorkspace() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, data }) => {
      const token = await getToken();
      const res = await api.put(`/workspaces/${workspaceId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
    },
  });
}

// Delete (archive) workspace
export function useDeleteWorkspace() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId) => {
      const token = await getToken();
      const res = await api.delete(`/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
