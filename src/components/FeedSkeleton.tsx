
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FeedSkeleton = () => {
  return (
    <div className="w-full flex justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-64 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    </div>
  );
};

export default FeedSkeleton;
