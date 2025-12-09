import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useStartAISession = () => {
  const result = useMutation({
    mutationKey: ["startAISession"],
    mutationFn: sessionApi.startAISession,
    onSuccess: () => toast.success("AI Interview session started!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to start AI session"),
  });

  return result;
};

export const useSendAIMessage = () => {
  const result = useMutation({
    mutationKey: ["sendAIMessage"],
    mutationFn: sessionApi.sendAIMessage,
    onError: (error) => toast.error(error.response?.data?.message || "Failed to send message"),
  });

  return result;
};

export const useEndAISession = () => {
  const result = useMutation({
    mutationKey: ["endAISession"],
    mutationFn: sessionApi.endAISession,
    onSuccess: () => toast.success("Interview completed! Check your feedback."),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useAISessionById = (id) => {
  const result = useQuery({
    queryKey: ["aiSession", id],
    queryFn: () => sessionApi.getAISession(id),
    enabled: !!id,
    refetchInterval: false, // No need to poll for AI sessions
  });

  return result;
};
