import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

// Base skeleton component with shimmer animation
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/50",
        className
      )}
    />
  );
}

// Job card skeleton
export function JobCardSkeleton() {
  return (
    <div className="border border-zinc-800 rounded-2xl p-4 md:p-6">
      <div className="flex items-start md:items-center gap-3 md:gap-4">
        {/* Logo */}
        <Skeleton className="size-12 rounded-xl shrink-0" />

        {/* Job Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/4 md:w-1/2" />
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 md:w-48" />
          </div>
        </div>

        {/* Button */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="sm:hidden shrink-0">
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Jobs list skeleton (multiple cards)
export function JobsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

// News card skeleton
export function NewsCardSkeleton() {
  return (
    <div className="group">
      {/* Image */}
      <Skeleton className="mb-3 rounded-xl aspect-[4/3]" />

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// News grid skeleton
export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// News sidebar skeleton
export function NewsSidebarSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Job sidebar item skeleton
export function JobSidebarItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Skeleton className="size-12 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

// Jobs sidebar skeleton (for news page)
export function JobsSidebarSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <JobSidebarItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Job detail skeleton
export function JobDetailSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
          <div className="flex items-center w-full">
            <div className="flex-[0_0_auto] min-w-0 p-3">
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <div className="flex-1 flex items-center justify-center p-3">
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex-[0_0_auto] min-w-0" style={{ width: '60px' }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Article */}
          <div className="flex-1 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
            <div className="max-w-[752px] space-y-8">
              <Skeleton className="h-9 w-3/4" />

              {/* Description */}
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
                <Skeleton className="h-5 w-2/3" />
              </div>

              {/* Section */}
              <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>

              {/* Another Section */}
              <div className="space-y-4">
                <Skeleton className="h-7 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>

              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-zinc-800">
            {/* Company Info */}
            <div className="px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <div className="flex items-start gap-3 mb-6">
                <Skeleton className="size-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Share */}
            <div className="border-t border-zinc-800 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="size-5 rounded" />
                ))}
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="border-t border-zinc-800 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-4 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="size-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// News detail skeleton
export function NewsDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center w-full">
          <div className="flex-[0_0_auto] min-w-0 p-3">
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex-[0_0_auto] min-w-0" style={{ width: '60px' }} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Image */}
        <Skeleton className="w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -mx-4 md:-mx-8 mb-8 aspect-[16/9] rounded-xl" />

        {/* Category */}
        <Skeleton className="h-7 w-20 rounded-full mb-6" />

        {/* Title */}
        <div className="space-y-3 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2 mb-8">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-12 pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Article content */}
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Filters skeleton (for news page filters)
export function FiltersSkeleton() {
  return (
    <div className="flex gap-2 pb-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-20 rounded-xl shrink-0" />
      ))}
    </div>
  );
}

// Hero section skeleton (for jobs page)
export function HeroSkeleton() {
  return (
    <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-24">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 md:h-14 w-3/4 mx-auto" />
          <Skeleton className="h-10 md:h-14 w-1/2 mx-auto" />
        </div>
        <div className="space-y-2 max-w-[480px] mx-auto">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4 mx-auto" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Full page skeleton for jobs
export function JobsPageSkeleton() {
  return (
    <div className="w-full">
      <HeroSkeleton />
      <div className="max-w-[896px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
        <JobsListSkeleton count={5} />
      </div>
    </div>
  );
}

// Full page skeleton for news
export function NewsPageSkeleton() {
  return (
    <div className="flex w-full pb-16 md:pb-0">
      <div className="flex-1 min-w-0">
        <div className="py-4 md:py-5 lg:py-5">
          {/* Filters */}
          <div className="mb-5 px-4 md:px-6 lg:px-8">
            <FiltersSkeleton />
          </div>

          {/* Grid */}
          <div className="px-4 md:px-6 lg:px-8">
            <NewsGridSkeleton count={6} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-[359px] border-l border-zinc-800 h-screen sticky top-0">
        {/* Search */}
        <div className="p-8 border-b border-zinc-800">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Top news */}
        <div className="p-8 border-b border-zinc-800">
          <Skeleton className="h-5 w-40 mb-6" />
          <NewsSidebarSkeleton />
        </div>

        {/* Recent jobs */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
          <JobsSidebarSkeleton count={4} />
        </div>
      </aside>
    </div>
  );
}

// Similar job skeleton (for detail page sidebar)
export function SimilarJobSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="size-12 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Similar jobs list skeleton
export function SimilarJobsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <SimilarJobSkeleton key={i} />
      ))}
    </div>
  );
}
