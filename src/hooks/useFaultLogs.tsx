import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export const useFaultLogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faultLogs = [], isLoading } = useQuery({
    queryKey: ["fault_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fault_logs")
        .select("*, machines(name)")
        .order("detected_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('fault-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fault_logs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["fault_logs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addFaultLog = useMutation({
    mutationFn: async (faultLog: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("fault_logs")
        .insert({
          ...faultLog,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fault_logs"] });
      toast({
        title: "Success",
        description: "Fault log added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFaultLog = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const { data, error } = await supabase
        .from("fault_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fault_logs"] });
      toast({
        title: "Success",
        description: "Fault log updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    faultLogs,
    isLoading,
    addFaultLog: addFaultLog.mutate,
    updateFaultLog: updateFaultLog.mutate,
  };
};