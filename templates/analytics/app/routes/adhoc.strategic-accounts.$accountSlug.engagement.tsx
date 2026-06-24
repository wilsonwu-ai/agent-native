import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import EngagementAnalysis from "@/pages/adhoc/strategic-accounts/EngagementAnalysis";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function EngagementAnalysisRoute() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EngagementAnalysis />
    </Suspense>
  );
}
