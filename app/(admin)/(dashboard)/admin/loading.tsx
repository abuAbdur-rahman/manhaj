import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="flex gap-3">
        <Skeleton className="h-11 w-36 rounded-lg" />
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>

      <div className="mt-8">
        <Skeleton className="h-5 w-32" />

        <div className="mt-4 space-y-1">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
