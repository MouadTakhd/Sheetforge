// src/routes/docs.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Code2, 
  Terminal, 
  ArrowUpRight 
} from 'lucide-react'

export const Route = createFileRoute('/docs')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')

    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: DocsPage,
})

const DOCS_SECTIONS = [
  {
    icon: <BookOpen className="h-4 w-4 text-blue-400" />,
    title: "Getting Started Blueprints",
    description: "Initialize your workspace context. Learn step-by-step how to mount binaries, execute initial sheet deserialization steps, and deploy schema adjustments.",
    badge: "Core Guide"
  },
  {
    icon: <Code2 className="h-4 w-4 text-purple-400" />,
    title: "API & Data Schema Mapping",
    description: "Deep dive into structural definitions. Understand our auto-inference engine, data-type overrides, dynamic JSON nested frameworks, and raw XML arrays.",
    badge: "Technical Specs"
  },
  {
    icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
    title: "Security & Cryptography Matrice",
    description: "Explore our zero-trust client sandbox limits, secure JWT authentication mechanisms, HttpOnly refresh cookie lifecycles, and SHA-256 validation rules.",
    badge: "Data Guard"
  },
  {
    icon: <Terminal className="h-4 w-4 text-amber-500" />,
    title: "CLI & Pipeline Orchestration",
    description: "Automate repetitive data tasks. Implement automated file drops via localized storage buckets and map batch outputs directly into continuous integration workflows.",
    badge: "Automation"
  },
  {
    icon: <FileText className="h-4 w-4 text-pink-400" />,
    title: "Dialect Refactoring Contexts",
    description: "Reference manual rules for compiling DDL scripts across PostgreSQL, corporate MySQL nodes, or lightweight runtime-optimized SQLite engines.",
    badge: "SQL Blueprints"
  }
] as const

function DocsPage() {
  return (
    <main className="space-y-6 sm:space-y-8 text-foreground pb-12 w-full max-w-none animate-in fade-in-50 duration-300">
      
      {/* ─── PREMIUM BRANDING HEADER ─── */}
      <section className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient Glows to maintain platform consistency */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 h-24 w-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 sm:space-y-4 relative z-10">
          <Badge className="bg-slate-500/10 text-slate-400 border-border/60 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            <Sparkles className="mr-1 h-3 w-3 inline text-primary" />
            Knowledge Base
          </Badge>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none">
            Your product docs and onboarding guide
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Find reference links, compilation parameters, database integration maps, and architectural practices for building automated pipelines with Sheetforge.
          </p>
        </div>
      </section>

      {/* ─── RESPONSIBLE COMPACT DOCUMENTATION BLOCKS ─── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {DOCS_SECTIONS.map((section, idx) => (
          <Card 
            key={idx} 
            className="group rounded-2xl border border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/50 cursor-pointer transition-all duration-200 flex flex-col justify-between p-4 min-h-[140px]"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full w-full gap-4">
              {/* Top Meta Row */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="rounded-xl bg-background border border-border/40 p-2 shrink-0 shadow-sm">
                  {section.icon}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-[8px] font-black rounded-full px-2 py-0 border border-white/5 bg-background text-muted-foreground/80 tracking-wide"
                >
                  {section.badge}
                </Badge>
              </div>

              {/* Textual Core Elements */}
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                  <span>{section.title}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-medium">
                  {section.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
    </main>
  )
}