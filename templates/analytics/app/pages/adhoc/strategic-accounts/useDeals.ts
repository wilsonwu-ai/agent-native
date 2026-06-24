import { useQuery } from "@tanstack/react-query";
import { getIdToken } from "@/lib/auth";
import type { Deal } from "./AccountSections";

export function useDeals(companyId: string | undefined) {
  return useQuery<Deal[]>({
    queryKey: ["hubspot-deals", companyId],
    queryFn: async () => {
      if (!companyId) {
        return [];
      }

      const token = await getIdToken();
      const response = await fetch(`/api/hubspot/deals/${companyId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.statusText}`);
      }

      const data = await response.json();
      return data.deals || [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
