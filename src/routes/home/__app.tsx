import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useRef, useState, DragEvent, ChangeEvent, useEffect } from 'react'
import { useConverterStore } from '@/stores/converterStore'
import {
  Upload,
  ArrowRight,
  Sparkles,
  Database,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Terminal,
  Server,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  HardDrive
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/home/__app')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: Home,
})

interface RecentFileMock {
  name: string
  size: string
  type: 'xlsx' | 'csv'
  time: string
  status: 'Completed' | 'Idle'
}

export function Home() {
  const navigate = useNavigate()
  const parseFile = useConverterStore((state) => state.parseFile)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [greeting, setGreeting] = useState('Welcome back')
  
  // Recent Mock History list
  const [recentFiles, setRecentFiles] = useState<RecentFileMock[]>([
    { name: 'sales_report_q1.xlsx', size: '142.4 KB', type: 'xlsx', time: '10 mins ago', status: 'Completed' },
    { name: 'user_leads_may26.csv', size: '28.8 KB', type: 'csv', time: '2 hours ago', status: 'Completed' },
    { name: 'inventory_items.xlsx', size: '1.2 MB', type: 'xlsx', time: 'Yesterday', status: 'Completed' },
  ])

  // Get dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const ext = droppedFile.name.split('.').pop()?.toLowerCase()
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        await parseFile(droppedFile)
        
        // Add to local recent list
        const newMockFile: RecentFileMock = {
          name: droppedFile.name,
          size: (droppedFile.size / 1024).toFixed(1) + ' KB',
          type: ext === 'csv' ? 'csv' : 'xlsx',
          time: 'Just now',
          status: 'Completed'
        }
        setRecentFiles(prev => [newMockFile, ...prev.slice(0, 4)])
        
        navigate({ to: '/convert' })
      } else {
        await parseFile(droppedFile)
        navigate({ to: '/convert' })
      }
    }
  }

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const ext = selectedFile.name.split('.').pop()?.toLowerCase()
      await parseFile(selectedFile)
      
      const newMockFile: RecentFileMock = {
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(1) + ' KB',
        type: ext === 'csv' ? 'csv' : 'xlsx',
        time: 'Just now',
        status: 'Completed'
      }
      setRecentFiles(prev => [newMockFile, ...prev.slice(0, 4)])
      
      navigate({ to: '/convert' })
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground pb-12">
      {/* ─── DYNAMIC BACKGROUND ELEMENT ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Subtle blur glowing orbits */}
        <div className="absolute left-[15%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute right-[10%] top-[30%] h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute left-[30%] bottom-[-5%] h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-3xl" />

        {/* Techno dot matrix grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              radial-gradient(currentColor 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ─── DASHBOARD HEADER ─── */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/20 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <Badge className="rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[10px] font-semibold text-primary backdrop-blur-sm">
                <Sparkles className="mr-1 h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                Platform v1.4.2
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 rounded-full px-2.5 py-0.5 border border-emerald-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ONLINE
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl mt-3 leading-none bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              {greeting}, developer
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Convert spreadsheet models directly to relational schemas, format arrays, inspect grids, and configure databases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-xl px-5 bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload spreadsheet
            </Button>
          </div>
        </header>

        {/* ─── MAIN ROW: CONTENT PANELS ─── */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* LEFT COLUMN: Tools & Actions */}
          <div className="space-y-8">
            {/* QUICK START PRESETS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Tool Presets</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: 'Excel ➔ SQL Script',
                    description: 'Auto-infer datatype structure and write batch inserts.',
                    icon: <Database className="h-5 w-5 text-blue-400" />,
                    color: 'hover:border-blue-500/30 hover:bg-blue-500/5',
                    badge: 'MySQL/PG/SQLite'
                  },
                  {
                    title: 'Spreadsheet ➔ JSON',
                    description: 'Transform worksheets into arrays of objects or keys.',
                    icon: <FileText className="h-5 w-5 text-purple-400" />,
                    color: 'hover:border-purple-500/30 hover:bg-purple-500/5',
                    badge: 'JSON/XML/CSV'
                  },
                  {
                    title: 'Data Validation Grid',
                    description: 'Inspect layout columns, paginate, and sort records.',
                    icon: <FileSpreadsheet className="h-5 w-5 text-emerald-400" />,
                    color: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
                    badge: 'TanStack Grid'
                  },
                  {
                    title: 'In-Memory Sandbox',
                    description: 'Secure client-side processing. 0 server storage footprint.',
                    icon: <ShieldCheck className="h-5 w-5 text-orange-400" />,
                    color: 'hover:border-orange-500/30 hover:bg-orange-500/5',
                    badge: '100% Private'
                  },
                ].map((preset, idx) => (
                  <Card
                    key={idx}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${preset.color}`}
                  >
                    <CardContent className="p-6 flex flex-col justify-between h-40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="rounded-xl bg-card border border-border/40 p-2.5 group-hover:scale-110 transition-transform">
                          {preset.icon}
                        </div>
                        <Badge variant="secondary" className="text-[9px] rounded-full px-2 border border-white/5 bg-background">
                          {preset.badge}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-1">
                          {preset.title}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* LIVE CONTEXT METRICS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Session Metrics</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Security Standard', value: 'Sandbox', sub: 'Client side only', icon: <HardDrive className="h-4 w-4 text-muted-foreground" /> },
                  { label: 'Extraction Latency', value: '< 1.2s', sub: 'Average parser speed', icon: <Zap className="h-4 w-4 text-amber-400" /> },
                  { label: 'Engine Core', value: 'SheetJS v0.18', sub: 'Active parser build', icon: <Server className="h-4 w-4 text-muted-foreground" /> },
                ].map((stat, idx) => (
                  <Card key={idx} className="rounded-[1.8rem] border border-border/40 bg-card/30 p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-black leading-none">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{stat.sub}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Interactive File Uploader Dropzone */}
          <div className="space-y-8 lg:sticky lg:top-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dropzone Center</h2>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/10 bg-emerald-500/5 px-2 py-0">
                  Ready
                </Badge>
              </div>

              <Card className="rounded-[2.5rem] border border-white/10 bg-card/40 shadow-2xl overflow-hidden relative group">
                {/* Glowing neon orbits inside card */}
                <div className="absolute -right-16 -top-16 h-36 w-36 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute -left-12 -bottom-12 h-28 w-28 bg-purple-500/5 rounded-full blur-2xl" />

                {/* Header indicators */}
                <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-muted/20">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    sandbox-session
                  </span>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* DROPZONE DOCK */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative cursor-pointer rounded-[2rem] border border-dashed text-center p-10 transition-all duration-300
                      ${
                        dragActive
                          ? 'border-primary bg-primary/5 scale-[0.98] shadow-inner'
                          : 'border-primary/20 bg-muted/40 hover:border-primary/50 hover:bg-muted/60'
                      }
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInput}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary shadow-inner">
                      <Upload className="h-7 w-7" />
                    </div>

                    <h3 className="text-xl font-bold tracking-tight">
                      Drop spreadsheet here
                    </h3>

                    <p className="mt-2 text-xs text-muted-foreground">
                      or click to explore workspace files
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 max-w-[240px] mx-auto">
                      {['.xlsx', '.xls', '.csv'].map((ext) => (
                        <Badge
                          key={ext}
                          variant="secondary"
                          className="rounded-full px-2.5 py-0.5 text-[9px] border border-white/5 bg-background/50 text-muted-foreground"
                        >
                          {ext}
                        </Badge>
                      ))}
                    </div>

                    <Button className="mt-6 h-10 rounded-xl px-6 text-xs shadow-md">
                      Browse Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* ─── BOTTOM ROW: MOCK CONVERSIONS RECENT LOGS ─── */}
        <section className="space-y-4 mt-12 border-t border-border/20 pt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Session Activites</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Stored locally on your sandbox
            </span>
          </div>

          <Card className="rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/20 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Spreadsheet Name</th>
                    <th className="p-4">File Size</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {recentFiles.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/15 transition-all">
                      <td className="p-4 pl-6 font-semibold flex items-center gap-2.5 truncate max-w-[240px]">
                        <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        {item.name}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{item.size}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] rounded-full uppercase px-2 py-0 border-white/5 bg-background">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{item.time}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 rounded-full px-2.5 py-0.5 border border-emerald-500/15">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 rounded-lg text-xs font-bold text-primary hover:bg-primary/10"
                        >
                          Quick Load
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}