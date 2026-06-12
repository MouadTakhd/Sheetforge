// src/routes/features.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  Eye, 
  Database, 
  RefreshCw, 
  Code2, 
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  Server,
  Monitor
} from 'lucide-react'

export const Route = createFileRoute('/features')({
  beforeLoad: () => {
    // 🛡️ Safe quote-stripping sanitization to prevent infinite auth redirects
    const isStaticMode = import.meta.env.VITE_API_BASE_URL?.replace(/['"]/g, '') === 'NO'
    const token = localStorage.getItem('sheetforge_jwt_token')

    if (!isStaticMode && !token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: FeaturesPage,
})

// ─── FRONTEND LAYER CORE FEATURES ───
const FRONTEND_FEATURES = [
  {
    icon: <Cpu className="h-5 w-5 text-amber-500" />,
    title: "In-Memory Sandbox Shield",
    description: "Process confidential data arrays fully client-side. Bypasses networks in static mode with zero persistence footprints, protecting business intelligence vectors instantly.",
    badge: "Client Isolation"
  },
  {
    icon: <RefreshCw className="h-5 w-5 text-indigo-400" />,
    title: "Dynamic Schema Mutators",
    description: "Alter detected data-types on the fly using responsive tabular wrappers. Explicitly modify column parameters, flag Primary Keys, or filter target exclusions visually.",
    badge: "Reactive UI"
  },
  {
    icon: <Code2 className="h-5 w-5 text-emerald-400" />,
    title: "Reactive Polyglot Grid Engine",
    description: "Driven by TanStack Table layout logic. Instantly query, multi-sort, and filter rows, while calculating real-time copyable code previews for multiple data targets.",
    badge: "State Optimization"
  }
] as const

// ─── BACKEND INFRASTRUCTURE LAYER FEATURES ───
const BACKEND_FEATURES = [
  {
    icon: <Eye className="h-5 w-5 text-purple-400" />,
    title: "Neural OCR Extraction Engine",
    description: "A secure Symfony orchestration worker running local operating system binary dependencies like Tesseract OCR to decompose flat text matrices out of images and unsearchable PDFs.",
    badge: "Server-Side Vision"
  },
  {
    icon: <Layers className="h-5 w-5 text-pink-400" />,
    title: "S3 Secure Data Pipeline",
    description: "Streams file buffers directly to MinIO or AWS S3 buckets using isolated multi-part uploads. Maps strict validation criteria before artifacts enter persistence states.",
    badge: "Object Archiving"
  },
  {
    icon: <Database className="h-5 w-5 text-blue-400" />,
    title: "Enterprise Multi-Dialect Compilers",
    description: "Automated relational table normalizers written to calculate custom entity definitions. Pre-compiles bulletproof DDL script templates matching Postgres, MySQL, and SQLite limits.",
    badge: "Relational Mapping"
  }
] as const

function FeaturesPage() {
  if (typeof document !== 'undefined') {
    document.title = 'System Architecture Capabilities | Sheetforge'
  }

  return (
    <main className="space-y-12 text-foreground pb-12 w-full max-w-none animate-in fade-in-50 duration-300 text-left">
      
      {/* ─── METADATA BANNER ─── */}
      <section className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute left-1/3 bottom-0 h-28 w-28 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" aria-hidden />
        
        <div className="space-y-3 sm:space-y-4 relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            <Sparkles className="mr-1 h-3 w-3 animate-pulse inline" />
            Core System Ecosystem
          </Badge>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none">
            Full-Stack Telemetry & Processing Matrix
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            SheetForge splits operation bounds between a secure, reactive frontend canvas interface and a high-throughput, containerized backend translation ecosystem.
          </p>
        </div>
      </section>

      {/* ─── SECTION 1: FRONTEND WORKSPACE ENVIRONMENT ─── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-border/30 pb-3">
          <div className="p-1.5 bg-muted rounded-lg border border-border/60 text-muted-foreground">
            <Monitor className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">Frontend Client Shell Workspace</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Native interface compilation, presentation schemas, and memory safety loops.</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {FRONTEND_FEATURES.map((feature, idx) => (
            <Card 
              key={idx} 
              className="group rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="rounded-xl bg-background border border-border/40 p-2 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-black rounded-full px-2.5 py-0 border border-white/5 bg-background text-muted-foreground/90 tracking-wide select-none">
                    {feature.badge}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardContent className="p-0 text-[11px] sm:text-xs leading-relaxed text-muted-foreground font-medium">
                    {feature.description}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── SECTION 2: BACKEND ENGINE INFRASTRUCTURE ─── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-border/30 pb-3">
          <div className="p-1.5 bg-muted rounded-lg border border-border/60 text-muted-foreground">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">Backend Infrastructure Ingestion Layer</h2>
            <p className="text-[11px] text-muted-foreground font-medium">File parsing microservices, OCR workers, and distributed object arrays.</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {BACKEND_FEATURES.map((feature, idx) => (
            <Card 
              key={idx} 
              className="group rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="rounded-xl bg-background border border-border/40 p-2 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-black rounded-full px-2.5 py-0 border border-white/5 bg-background text-muted-foreground/90 tracking-wide select-none">
                    {feature.badge}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardContent className="p-0 text-[11px] sm:text-xs leading-relaxed text-muted-foreground font-medium">
                    {feature.description}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </main>
  )
}