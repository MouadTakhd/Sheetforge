// src/routes/features.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Eye, 
  Database, 
  RefreshCw, 
  Code2, 
  Cpu,
  Layers
} from 'lucide-react'

export const Route = createFileRoute('/features')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')

    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: FeaturesPage,
})

const ADVANCED_FEATURES = [
  {
    icon: <Eye className="h-5 w-5 text-purple-400" />,
    title: "AI Intelligent Vision OCR",
    description: "Extract text, data matrix tables, invoices, and physical receipts instantly from raw images (PNG, JPEG, PDF) directly into editable spreadsheets or structured schemas.",
    badge: "AI Powered"
  },
  {
    icon: <Database className="h-5 w-5 text-blue-400" />,
    title: "Multi-Dialect Core Compiling",
    description: "Map column definitions out to optimized database scripts. Compiles ready-to-run DDL blueprints for PostgreSQL, MySQL, and isolated SQLite contexts.",
    badge: "Relational Engine"
  },
  {
    icon: <Code2 className="h-5 w-5 text-emerald-400" />,
    title: "Polyglot Object Matrix",
    description: "Transform row streams into structural JSON arrays, keyed nested object graphs, semantic XML documents, or optimized comma-separated value tables.",
    badge: "Format Agnostic"
  },
  {
    icon: <Cpu className="h-5 w-5 text-amber-500" />,
    title: "In-Memory Sandbox Shield",
    description: "Process confidential and regulated database parameters fully client-side. Zero persistence footprint, protecting your critical company intellectual assets.",
    badge: "Zero-Trust Data"
  },
  {
    icon: <RefreshCw className="h-5 w-5 text-indigo-400" />,
    title: "Dynamic Schema Mutators",
    description: "Alter detected data-types on the fly. Explicitly set custom type overrides, flag structural Primary Keys, or isolate and exclude unneeded data columns.",
    badge: "Total Management"
  },
  {
    icon: <Layers className="h-5 w-5 text-pink-400" />,
    title: "S3 Object Store Hub",
    description: "Stream raw asset binaries directly to localized high-performance object engines (MinIO/S3) for real-time tracking, validation, and conversion archiving.",
    badge: "Cloud Storage"
  }
] as const

function FeaturesPage() {
  return (
    <main className="space-y-6 sm:space-y-8 text-foreground pb-12 w-full max-w-none animate-in fade-in-50 duration-300">
      
      {/* ─── METADATA BANNER ─── */}
      <section className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-8 relative overflow-hidden">
        {/* Background Ambient Glowing Orbs */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-28 w-28 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 sm:space-y-4 relative z-10">
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            <Sparkles className="mr-1 h-3 w-3 animate-pulse text-purple-400 inline" />
            Core Platform Capabilities
          </Badge>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none">
            Everything you need to manage your conversion workflow
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Build reliable conversion pipelines with smart multi-format extraction, real-time code generation, machine learning vision text processing, and fully isolated secure clients.
          </p>
        </div>
      </section>

      {/* ─── DYNAMIC FEATURES ARCHITECTURE GRID ─── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {ADVANCED_FEATURES.map((feature, idx) => (
          <Card 
            key={idx} 
            className="group rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4 w-full">
              {/* Header Icon + Badge Row */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="rounded-xl bg-background border border-border/40 p-2 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                  {feature.icon}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-[9px] font-black rounded-full px-2 py-0 border border-white/5 bg-background text-muted-foreground/90 tracking-wide"
                >
                  {feature.badge}
                </Badge>
              </div>

              {/* Title & Description Context */}
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
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

    </main>
  )
}