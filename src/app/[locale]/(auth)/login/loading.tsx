import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin" />
      <p className="text-lg font-medium mt-4">Cargando...</p>
    </main>
  );
}
