export function SkeletonLoader() {
  return (
    <div className="w-full max-w-md p-4 mx-auto border rounded-lg shadow-md border-border">
      <div className="flex space-x-4 animate-pulse">

        <div className="w-12 h-12 rounded-full bg-muted" />

        <div className="flex-1 py-1 space-y-3">
          <div className="h-3 rounded bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-3 col-span-2 rounded bg-muted" />
            <div className="h-3 col-span-1 rounded bg-muted" />

          </div>
          <div className="h-3 rounded bg-muted" />
        </div>
      </div>

      <div className="mt-6 space-y-3 animate-pulse">
        <div className="h-3 rounded bg-muted" />
        <div className="grid grid-cols-4 gap-3">
          <div className="h-3 col-span-3 rounded bg-muted" />
          <div className="h-3 col-span-1 rounded bg-muted" />
        </div>
        <div className="h-3 rounded bg-muted w-3/4" />
         <div className="h-3 rounded bg-muted w-1/2" />
      </div>
      
       <div className="flex items-center justify-between mt-8 animate-pulse">
        <div className="w-24 h-8 rounded bg-muted" />
        <div className="w-16 h-8 rounded bg-muted" />
      </div>
    </div>
  );
}
