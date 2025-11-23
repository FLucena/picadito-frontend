interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ count = 1, className = '' }: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}
        >
          <div className="animate-pulse space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full"></div>
            <div className="flex gap-2 pt-2">
              <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
              <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const LoadingSkeletonCard = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} count={1} />
      ))}
    </div>
  );
};

