Aquí tienes todo el código de HistorIA (TanStack Start + Supabase). Copia archivo por archivo respetando las rutas. Al final tienes los pasos de instalación.

Nota: los archivos de shadcn/ui (button, card, input, label, tabs, textarea, sonner) y los helpers auto-generados de Supabase (`client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`, `types.ts`) se generan automáticamente en Lovable. En Base44/Replit tendrás que instalarlos: shadcn con `npx shadcn@latest add button card input label tabs textarea sonner`, y los clientes de Supabase creándolos con `createClient` a mano usando tus env vars.

---

## 1. `package.json`

```json
{
  "name": "historia",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ai-sdk/openai-compatible": "^3.0.12",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@supabase/supabase-js": "^2.110.7",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/react-start": "^1.168.26",
    "@tanstack/router-plugin": "^1.168.18",
    "ai": "^7.0.31",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "jspdf": "^4.2.1",
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "typescript": "^5.8.3",
    "vite": "^8.0.16",
    "vite-tsconfig-paths": "^6.0.2"
  }
}
```

## 2. Migración SQL (Supabase)

```sql
CREATE TABLE public.patient_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_code TEXT,
  raw_history TEXT NOT NULL,
  motivo_consulta TEXT NOT NULL DEFAULT '',
  antecedentes TEXT NOT NULL DEFAULT '',
  diagnostico TEXT NOT NULL DEFAULT '',
  alertas TEXT NOT NULL DEFAULT '',
  tratamiento TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_patient_summaries_doctor_created
  ON public.patient_summaries (doctor_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_summaries TO authenticated;
GRANT ALL ON public.patient_summaries TO service_role;
ALTER TABLE public.patient_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own summaries" ON public.patient_summaries
  FOR ALL TO authenticated
  USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);
```

## 3. `.env`

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_anon_key
LOVABLE_API_KEY=tu_api_key_de_lovable_ai
```

## 4. `src/styles.css`

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.16 0.015 220);
  --foreground: oklch(0.97 0.01 220);
  --card: oklch(0.21 0.018 220);
  --card-foreground: oklch(0.97 0.01 220);
  --popover: oklch(0.21 0.018 220);
  --popover-foreground: oklch(0.97 0.01 220);
  --primary: oklch(0.78 0.12 195);
  --primary-foreground: oklch(0.16 0.02 220);
  --secondary: oklch(0.27 0.02 220);
  --secondary-foreground: oklch(0.97 0.01 220);
  --muted: oklch(0.24 0.018 220);
  --muted-foreground: oklch(0.72 0.02 220);
  --accent: oklch(0.32 0.06 195);
  --accent-foreground: oklch(0.97 0.01 220);
  --destructive: oklch(0.62 0.22 25);
  --destructive-foreground: oklch(0.98 0.01 220);
  --border: oklch(0.3 0.02 220);
  --input: oklch(0.28 0.02 220);
  --ring: oklch(0.78 0.12 195);
}

@layer base {
  * { border-color: var(--color-border); }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}

@media print {
  body { background: white !important; color: black !important; }
  .no-print { display: none !important; }
  .print-card { border: 1px solid #ddd !important; page-break-inside: avoid; }
}
```

## 5. `src/integrations/supabase/client.ts` (crear a mano)

```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);
```

## 6. `src/integrations/supabase/auth-middleware.ts`

```ts
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const auth = getRequestHeader("authorization");
  if (!auth) throw new Response("Unauthorized", { status: 401 });
  const token = auth.replace(/^Bearer /, "");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Response("Unauthorized", { status: 401 });
  return next({ context: { supabase, userId: data.user.id, claims: data.user } });
});
```

## 7. `src/integrations/supabase/auth-attacher.ts`

```ts
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
```

## 8. `src/start.ts`

```ts
import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
```

## 9. `src/router.tsx`

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
```

## 10. `src/routes/__root.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HistorIA — Resúmenes clínicos con IA" },
      { name: "description", content: "Organiza el historial clínico de tus pacientes en un resumen profesional con IA." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: ({ children }: { children: ReactNode }) => (
    <html lang="es" className="dark"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
  ),
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN","SIGNED_OUT","USER_UPDATED"].includes(event)) queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  );
}
```

## 11. `src/routes/index.tsx` (landing)

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2"><Stethoscope className="h-6 w-6 text-primary" /><span className="text-lg font-semibold">HistorIA</span></div>
          <Link to="/auth"><Button>Ingresar</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Resúmenes clínicos asistidos por IA
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            El historial clínico, <span className="text-primary">ordenado en segundos.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            HistorIA convierte texto libre en un resumen profesional con cinco secciones: motivo, antecedentes, diagnóstico, alertas y tratamiento.
          </p>
          <div className="mt-8"><Link to="/auth"><Button size="lg">Comenzar ahora</Button></Link></div>
        </section>
        <section className="mt-24 grid gap-6 sm:grid-cols-3">
          {[
            { icon: FileText, title: "Cinco secciones estándar", body: "Motivo, antecedentes, diagnóstico, alertas y tratamiento." },
            { icon: ShieldCheck, title: "Privado por doctor", body: "Cada médico solo ve sus propios resúmenes, con RLS." },
            { icon: Sparkles, title: "PDF listo", body: "Descarga o imprime desde la consulta." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
```

## 12. `src/routes/auth.tsx`

Ver bloque completo en el mensaje anterior del asistente en este chat (usa `supabase.auth.signInWithPassword` y `signUp`, con Tabs de login/signup). El archivo tal cual está en el proyecto actual funciona sin cambios.

## 13. `src/routes/_authenticated/route.tsx`

```tsx
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, LayoutDashboard, ClipboardList } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  async function signOut() { qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }
  const nav = (to: string, label: string, Icon: typeof LayoutDashboard) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    return <Link to={to} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" />{label}</Link>;
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/dashboard" className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /><span className="font-semibold">HistorIA</span></Link>
          <nav className="flex items-center gap-1">{nav("/dashboard","Nuevo resumen",LayoutDashboard)}{nav("/historial","Historial",ClipboardList)}</nav>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="mr-1.5 h-4 w-4" />Salir</Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8"><Outlet /></main>
    </div>
  );
}
```

## 14. `src/lib/summary-ai.server.ts` (motor Gemini)

Copia el contenido EXACTO que ya viste arriba en el mensaje del asistente (bloque `===SUMMARYAI===`): system prompt en español, esquema Zod con las 5 secciones, `createOpenAICompatible` apuntando a `https://ai.gateway.lovable.dev/v1`, modelo `google/gemini-3.5-flash`, fallback `parseFallback` para `NoObjectGeneratedError`, y traducción de errores 429/402 al español.

## 15. `src/lib/summary.functions.ts`

```ts
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateSummarySections } from "./summary-ai.server";

const GenerateInput = z.object({
  patientName: z.string().trim().min(1).max(200),
  patientCode: z.string().trim().max(60).optional().nullable(),
  rawHistory: z.string().trim().min(20).max(20000),
});

export const generateSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => GenerateInput.parse(i))
  .handler(async ({ data, context }) => {
    const s = await generateSummarySections(data.rawHistory);
    const { data: row, error } = await context.supabase.from("patient_summaries").insert({
      doctor_id: context.userId, patient_name: data.patientName, patient_code: data.patientCode || null,
      raw_history: data.rawHistory, ...s,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listSummaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("patient_summaries")
      .select("id, patient_name, patient_code, created_at").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("patient_summaries")
      .select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Resumen no encontrado");
    return row;
  });
```

## 16. `src/lib/pdf.ts`, `src/components/summary-view.tsx`, `src/routes/_authenticated/dashboard.tsx`, `src/routes/_authenticated/historial.index.tsx`, `src/routes/_authenticated/historial.$id.tsx`

Los ves completos en los mensajes anteriores de este mismo chat (bloques `===PDF===`, `summary-view.tsx`, `dashboard.tsx`, `historial.index.tsx`, `historial.$id.tsx`). Cópialos tal cual — funcionan sin modificación.

## 17. Pasos para levantarlo en Base44 / Replit

1. `bun install` (o `npm install`).
2. Crear proyecto Supabase, ejecutar la migración SQL del paso 2.
3. Poner las env vars del paso 3 (usa tu URL/anon key de Supabase y tu `LOVABLE_API_KEY` — o cámbialo a otro proveedor OpenAI-compatible ajustando `baseURL` y el header en `summary-ai.server.ts`).
4. Instalar shadcn/ui: `npx shadcn@latest init` y luego `npx shadcn@latest add button card input label tabs textarea sonner`.
5. `bun dev` → abre `http://localhost:8080`.

---

Si quieres que también pegue **literalmente** aquí los ~15 archivos de shadcn/ui, `historial.*.tsx`, `dashboard.tsx` y `summary-view.tsx` completos (en vez de referenciarlos), dímelo y los divido en 2–3 mensajes por límite de tamaño.
