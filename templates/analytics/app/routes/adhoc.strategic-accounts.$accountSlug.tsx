import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AccountDetail from "@/pages/adhoc/strategic-accounts/AccountDetail";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function AccountDetailRoute() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AccountDetail />
    </Suspense>
  );
}
