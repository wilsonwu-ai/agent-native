import { useQuery } from "@tanstack/react-query";
import { getIdToken } from "@/lib/auth";

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  status: "completed" | "scheduled";
  builderAttendees: string[];
  customerAttendees: string[];
  notes?: string;
}

export function useMeetings(companyId: string | undefined) {
  return useQuery<Meeting[]>({
    queryKey: ["hubspot-meetings", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const token = await getIdToken();
      const response = await fetch(`/api/hubspot/meetings/${companyId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch meetings: ${response.statusText}`);
      }

      const data = await response.json();
      return data.meetings || [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
