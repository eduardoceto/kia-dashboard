import React, { Suspense } from 'react';
import { SkeletonLoader } from '@/src/components/ui/skeleton-loader';
import AsyncDataComponent from '@/src/components/async-data-component';

export default function TestSuspensePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">React Suspense Test</h1>
        <p className="text-muted-foreground">
          Showing a skeleton loader while the async component loads.
        </p>
      </header>
      
      <div className="w-full max-w-lg p-6 rounded-lg shadow-xl bg-card">
        <h2 className="mb-4 text-xl font-semibold">Async Content Area</h2>
        <Suspense fallback={<SkeletonLoader />}>
          <AsyncDataComponent />
        </Suspense>
      </div>

      <section className="mt-12 text-center text-muted-foreground">
        <p>The content above is loaded asynchronously.</p>
        <p>While loading, you should see a skeleton UI with a pulsing animation.</p>
      </section>
    </div>
  );
}

TestSuspensePage.defaultProps = {};
