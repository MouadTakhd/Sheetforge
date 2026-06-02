// src/routes/home.__app.tsx
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useRef, useState, DragEvent, ChangeEvent, useEffect } from 'react'
import { useConverterStore } from '@/stores/converterStore'
import { useAuth } from '@/stores/auth'
import {
  Upload,
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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/home/__app')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')

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
  const authenticatedUser = useAuth((state) => state.user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [greeting, setGreeting] = useState('Welcome back')
  
  const [recentFiles, setRecentFiles] = useState<RecentFileMock[]>([
    { name: 'sales_report_q1.xlsx', size: '142.4 KB', type: 'xlsx', time: '10 mins ago', status: 'Completed' },
    { name: 'user_leads_may26.csv', size: '28.8 KB', type: 'csv', time: '2 hours ago', status: 'Completed' },
    { name: 'inventory_items.xlsx', size: '1.2 MB', type: 'xlsx', time: 'Yesterday', status: 'Completed' },
  ])

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
    <div className="min-h-screen w-full bg-background text-foreground pb-12 relative px-4 sm:px-6 lg:px-8">
      
      {/* ─── BACKGROUND EFFECTS (RESPONSIVE BOUNDED) ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[5%] top-[-10%] h-[250px] sm:h-[500px] w-[250px] sm:w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="mx-auto w-full max-w-6xl py-6 sm:py-10">
        
        {/* ─── HEADER: AUTO-STACKING FLEX ─── */}
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/20 pb-6 mb-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-primary backdrop-blur-sm">
                <Sparkles className="mr-1 h-2.5 w-2.5 animate-spin" />
                v1.4.2
              </Badge>
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 rounded-full px-2 py-0.5 border border-emerald-500/15">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              {greeting}, {authenticatedUser?.firstName || 'developer'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Convert spreadsheet models directly to relational schemas, format arrays, inspect grids, and configure databases.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full md:w-auto h-10 rounded-xl px-4 bg-primary text-primary-foreground font-bold text-xs gap-2 shadow-sm transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Spreadsheet
            </Button>
          </div>
        </header>

        {/* ─── MAIN COLUMN SCAFFOLDING ─── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          
          {/* LEFT AREA: COMPACT FLEXIBLE PRESETS */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6 order-2 lg:order-1">
            
            <section className="space-y-3 w-full">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Quick Tool Presets</h2>
              </div>

              {/* Grid safely moving from 1 column to 2 on devices */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {[
                  {
                    title: 'Excel ➔ SQL Script',
                    description: 'Auto-infer datatype structure and write batch inserts.',
                    icon: <Database className="h-4 w-4 text-blue-400" />,
                    color: 'hover:border-blue-500/30 hover:bg-blue-500/5',
                    badge: 'SQL Script'
                  },
                  {
                    title: 'Spreadsheet ➔ JSON',
                    description: 'Transform worksheets into arrays of objects or keys.',
                    icon: <FileText className="h-4 w-4 text-purple-400" />,
                    color: 'hover:border-purple-500/30 hover:bg-purple-500/5',
                    badge: 'JSON Array'
                  },
                  {
                    title: 'Data Validation Grid',
                    description: 'Inspect layout columns, paginate, and sort records.',
                    icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" />,
                    color: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
                    badge: 'Grid Preview'
                  },
                  {
                    title: 'In-Memory Sandbox',
                    description: 'Secure client-side processing. 0 server storage footprint.',
                    icon: <ShieldCheck className="h-4 w-4 text-orange-400" />,
                    color: 'hover:border-orange-500/30 hover:bg-orange-500/5',
                    badge: 'Local Session'
                  },
                ].map((preset, idx) => (
                  <Card
                    key={idx}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group rounded-2xl border border-border/50 bg-card/40 cursor-pointer transition-all duration-200 flex flex-col justify-between p-4 min-h-[110px] ${preset.color}`}
                  >
                    <CardContent className="p-0 flex flex-col justify-between h-full w-full gap-3">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="rounded-lg bg-background border border-border/40 p-2 shrink-0">
                          {preset.icon}
                        </div>
                        <Badge variant="secondary" className="text-[8px] font-black rounded-full px-1.5 py-0 border border-white/5 bg-background">
                          {preset.badge}
                        </Badge>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                          {preset.title}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-[11px] text-muted-foreground leading-normal">{preset.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* FLUID SESSION METRICS */}
            <section className="space-y-3 w-full">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Session Metrics</h2>
              </div>

              {/* Stacks on mobile, splits to 3 rows side-by-side on tablet/desktop */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 w-full">
                {[
                  { label: 'Security Standard', value: 'Sandbox', sub: 'Client side only', icon: <HardDrive className="h-4 w-4 text-muted-foreground/60" /> },
                  { label: 'Extraction Latency', value: '< 1.2s', sub: 'Parser execution speed', icon: <Zap className="h-4 w-4 text-amber-500" /> },
                  { label: 'Engine Core', value: 'SheetJS', sub: 'Active web assemblies', icon: <Server className="h-4 w-4 text-muted-foreground/60" /> },
                ].map((stat, idx) => (
                  <Card key={idx} className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-lg font-black leading-none tracking-tight">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-none">{stat.sub}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: SELF-ADJUSTING DROPZONE SYSTEM */}
          <div className="w-full lg:w-[40%] flex flex-col gap-3 order-1 lg:order-2 lg:sticky lg:top-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Dropzone Center</h2>
              </div>
              <Badge variant="outline" className="text-[9px] font-bold text-emerald-400 border-emerald-500/20 bg-emerald-500/5 px-2 py-0">
                Ready
              </Badge>
            </div>

            <Card className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden shadow-md relative w-full">
              <div className="flex items-center justify-between border-b border-border/20 px-4 py-2.5 bg-muted/20">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500/60" />
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/60" />
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">sandbox-session</span>
              </div>

              <div className="p-4">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border border-dashed text-center p-6 sm:p-8 transition-all ${
                    dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-primary/20 bg-muted/30 hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".xlsx,.xls,.csv" className="hidden" />

                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Upload className="h-5 w-5" />
                  </div>

                  <h3 className="text-sm font-bold tracking-tight">Drop spreadsheet here</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">or click to browse local files</p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1 max-w-[200px] mx-auto">
                    {['.xlsx', '.xls', '.csv'].map((ext) => (
                      <Badge key={ext} variant="secondary" className="text-[8px] font-black rounded-full px-1.5 border border-white/5 bg-background">
                        {ext}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ─── BOTTOM ROW: DATA LOG SYSTEM (PROTECTED FROM CLIPPING) ─── */}
        <section className="space-y-3 mt-10 border-t border-border/20 pt-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent Session Activities</h2>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Stored locally on your sandbox</span>
          </div>

          <Card className="rounded-xl border border-border/50 bg-card/40 overflow-hidden shadow-sm w-full">
            <div className="w-full overflow-x-auto block scrollbar-none">
              {/* Force min-width boundary parameters inside container frame */}
              <table className="w-full border-collapse text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-border/20 bg-muted/30 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 pl-4">Spreadsheet Name</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10 font-medium">
                  {recentFiles.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3 pl-4 font-bold flex items-center gap-2 truncate max-w-[220px]">
                        <div className="rounded-md bg-primary/10 p-1 text-primary shrink-0">
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate text-xs text-foreground/90">{item.name}</span>
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">{item.size}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[8px] font-black rounded-full uppercase px-1.5 border-border/40 bg-background">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">{item.time}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 rounded-full px-1.5 py-0.5 border border-emerald-500/15">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-6 rounded-md text-[10px] font-black text-primary hover:bg-primary/10 px-2"
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