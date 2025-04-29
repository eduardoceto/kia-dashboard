export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen w-full text-center">
      <h1 className="text-2xl font-semibold text-destructive">
        You are unauthorized to view this page.
      </h1>
    </div>
  );
}