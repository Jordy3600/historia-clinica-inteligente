import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Navigate } from "@/lib/react-router-dom";
import AppLayout from "@/pages/app-layout";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: ProtectedAppShell,
});

function ProtectedAppShell() {
  const { session, isDemoUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-blue/20 text-blue">
            <Stethoscope className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-text-2">Cargando sesión médica…</p>
        </div>
      </div>
    );
  }

  if (!session && !isDemoUser) return <Navigate to="/login" replace />;

  return <AppLayout />;
}
