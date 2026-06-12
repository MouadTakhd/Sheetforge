// src/routes/home.__app.tsx
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' // 👈 Essential for bulletproof modal isolation
import { useAuth } from '@/stores/auth'
import api from '@/lib/api'

import {
  Sparkles,
  Terminal,
  Layers,
  Cpu,
  Database,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Clock,
  AlertCircle,
  Activity,
  ArrowRight,
  RefreshCw,
  X,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/home/__app')({
  // ─── STATIC ROUTE PASS-THROUGH GUARD ───
  beforeLoad: () => {
    const isStaticMode = import.meta.env.VITE_API_BASE_URL === 'NO'
    const token = localStorage.getItem('sheetforge_jwt_token')
    
    if (!isStaticMode && !token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: DashboardWorkspace,
})

interface ConversionJob {
  '@id': string
  id: string
  status: string
  conversionType: string
  sourceFormat: string
  targetFormat: string
  progressPct: number
  createdAt: string
  options?: Record<string, any>
}

interface ApiResponse {
  member: ConversionJob[]
  totalItems: number
}

// ─── STATIC WORKSPACE MOCK DATA ARRAYS ───
const MOCK_HISTORICAL_JOBS: ConversionJob[] = [
  {
    '@id': '/api/conversion_jobs/1',
    id: 'sf-job-bf482d91-x01',
    status: 'completed',
    conversionType: 'xlsx_to_json',
    sourceFormat: 'xlsx',
    targetFormat: 'json',
    progressPct: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    options: { sheet_name: 'Q2_Financial_Grid', parsed_rows: 842, encoding: 'UTF-8' }
  },
  {
    '@id': '/api/conversion_jobs/2',
    id: 'sf-job-ac1190ee-p44',
    status: 'completed',
    conversionType: 'csv_to_sql',
    sourceFormat: 'csv',
    targetFormat: 'sql',
    progressPct: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    options: { table_name: 'production_analytics_node', dialect: 'PostgreSQL', delimiter: ',' }
  },
  {
    '@id': '/api/conversion_jobs/3',
    id: 'sf-job-fa33118b-c09',
    status: 'failed',
    conversionType: 'ods_to_xml',
    sourceFormat: 'ods',
    targetFormat: 'xml',
    progressPct: 40,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    options: { compilation_error: 'Decompression layer chunk checksum boundary mismatch.' }
  }
]

export function DashboardWorkspace() {
  const authenticatedUser = useAuth((state) => state.user)
  const [jobs, setJobs] = useState<ConversionJob[]>([])
  const [totalJobs, setTotalJobs] = useState<number>(0)
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const isStaticMode = import.meta.env.VITE_API_BASE_URL === 'NO'

  // Sync Atomic Render Shield Guard (Stops structural layout leakage cascades)
  if (!isStaticMode && typeof window !== 'undefined' && !localStorage.getItem('sheetforge_jwt_token')) {
    return null
  }

  // ─── LOG HISTORY OVERLAY STREAM CONTROL STATES ───
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  const [activeModalView, setActiveModalView] = useState<'feed' | 'detail'>('feed')
  const [selectedJob, setSelectedJob] = useState<ConversionJob | null>(null)

  const fetchJobHistory = async () => {
    setIsRefreshing(true)

    // ─── OPTION A: HYBRID STATIC STREAM SIMULATOR ───
    if (isStaticMode) {
      await new Promise((resolve) => setTimeout(resolve, 600)) // Elegant layout sync buffer delay
      setJobs(MOCK_HISTORICAL_JOBS)
      setTotalJobs(MOCK_HISTORICAL_JOBS.length)
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    // ─── OPTION B: PRODUCTION SYSTEM GATEWAY LOOKUP ───
    if (!authenticatedUser?.id) return
    try {
      const response = await api.get<ApiResponse>(
        `/conversion_jobs?order[createdAt]=desc&user=/api/users/${authenticatedUser.id}`
      )
      setJobs(response.data.member || [])
      setTotalJobs(response.data.totalItems || 0)
    } catch (error) {
      console.error("Failed to sync matrix history log stream:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchJobHistory()
  }, [authenticatedUser?.id])

  const handleOpenHistoryFeed = () => {
    setActiveModalView('feed')
    setIsHistoryOpen(true)
  }

  const handleDrillDownToJob = (job: ConversionJob) => {
    setSelectedJob(job)
    setActiveModalView('detail')
  }

  const handleBackToFeed = () => {
    setSelectedJob(null)
    setActiveModalView('feed')
  }

  const handleCloseMasterModal = () => {
    setIsHistoryOpen(false)
    setSelectedJob(null)
    setActiveModalView('feed')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-background text-foreground flex flex-col justify-center overflow-x-hidden p-6 sm:p-12 relative select-none text-left">
      
      {/* GLOWING AMBIENT CORE BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute right-[5%] top-[-5%] h-[650px] w-[650px] rounded-full bg-emerald-500/10 blur-[140px] dark:bg-emerald-500/5" />
        <div className="absolute left-[-5%] top-[25%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[130px] dark:bg-blue-500/5" />
      </div>

      <div className="mx-auto w-full max-w-5xl flex flex-col gap-12 py-6">
        
        {/* ─── 1. HIGH-SCALE HERO TITLE HEADER ─── */}
        <header className="space-y-5 max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-mono font-black tracking-widest uppercase text-emerald-500">
              Core Architecture Operational Node
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-foreground leading-none">
            Transpile Data Grids <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500">
              & Document Vectors.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base font-medium text-muted-foreground leading-relaxed max-w-3xl">
            Welcome back, <span className="text-foreground font-bold">{authenticatedUser?.firstName || 'Operator'}</span>. 
            Deploy custom schema properties directly into isolated storage pools, run target conversions on legacy 
            spreadsheets, or analyze your execution pipeline footprint dynamically.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleOpenHistoryFeed}
              className="rounded-xl h-10 px-5 text-xs font-mono font-black uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 border border-border/60 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>View Execution Logs</span>
              <Badge className="h-4 min-w-4 bg-emerald-500 text-white font-mono text-[9px] px-1 font-bold flex items-center justify-center rounded-md border-none ml-1">
                {totalJobs}
              </Badge>
            </Button>
          </div>
        </header>

        {/* ─── 2. RE-ENGINEERED COMPILER FUNCTION CARDS GRID ─── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* CARD 1: SPREADSHEETS */}
          <Card className="rounded-2xl border border-border/40 bg-card/40 dark:border-white/5 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-emerald-500/40 hover:bg-card/70 shadow-xs transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
              <FileSpreadsheet className="h-24 w-24" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
                  Spreadsheet Ingestion
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Stream XLSX, CSV, or ODS objects into lightning-fast structured JSON arrays or custom analytical matrices.
                </p>
              </div>
            </div>
            <Link to="/convert" className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-500 hover:text-emerald-400 font-bold pt-6 mt-2 w-fit">
              Launch Matrix Pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>

          {/* CARD 2: DOCUMENT OCR */}
          <Card className="rounded-2xl border border-border/40 bg-card/40 dark:border-white/5 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-blue-500/40 hover:bg-card/70 shadow-xs transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 text-blue-500 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-24 w-24" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-foreground group-hover:text-blue-400 transition-colors">
                  Neural OCR Transpiler
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Decompose unreadable PDFs and image vectors straight into markdown structures or raw clean typography strings.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-500/60 font-bold pt-6 mt-2 w-fit select-none">
              Execute Ingestion Engine <ArrowRight className="h-3 w-3" />
            </span>
          </Card>

          {/* CARD 3: STORAGE LIFECYCLE */}
          <Card className="rounded-2xl border border-border/40 bg-card/40 dark:border-white/5 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-purple-500/40 hover:bg-card/70 shadow-xs transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 text-purple-500 group-hover:scale-110 transition-transform duration-300">
              <Database className="h-24 w-24" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-foreground group-hover:text-purple-400 transition-colors">
                  S3 Node Storage
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Every asset is assigned a unique relation hash pointer and backed up safely using automated lifecycle rules.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-500/60 font-bold pt-6 mt-2 w-fit select-none">
              Inspect Cloud Nodes <ArrowRight className="h-3 w-3" />
            </span>
          </Card>

        </section>
      </div>

      {/* ─── 3. PORTAL COMPILER MASTER TERMINAL OVERLAY MODAL ─── */}
      {isHistoryOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999999] animate-fade-in select-text">
          <Card className="w-full max-w-2xl rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden flex flex-col animate-scale-in max-h-[80vh] text-left">
            
            {/* TERMINAL HEADER TOP PROFILE CONTROLLER */}
            <div className="border-b border-border/40 p-4 flex items-center justify-between bg-muted/30 select-none shrink-0">
              <div className="flex items-center gap-2">
                {activeModalView === 'detail' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToFeed}
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground mr-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                )}
                
                <span className="text-xs font-mono font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  {activeModalView === 'feed' ? (
                    <>
                      System Log Stream Matrix 
                      <span className="text-[10px] font-normal px-2 py-0.5 bg-background border border-border rounded-md text-muted-foreground">
                        {totalJobs} jobs logged
                      </span>
                    </>
                  ) : (
                    "Artifact Configuration Field Map"
                  )}
                </span>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCloseMasterModal}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* VIEW TARGET A: TERMINAL LIST ENGINE COMPILER FEED */}
            {activeModalView === 'feed' && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background/40">
                <div className="px-4 py-2 bg-muted/10 border-b border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground select-none">
                  <span>DEPLOYED LOG PIPELINES</span>
                  <Button
                    variant="ghost"
                    onClick={() => void fetchJobHistory()}
                    disabled={isRefreshing}
                    className="h-5 text-[9px] font-mono font-black px-2 flex items-center gap-1 text-emerald-500 cursor-pointer"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    RE-SYNC FEED
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-none">
                  {isRefreshing && jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center font-mono text-[10px] text-muted-foreground gap-2 py-24 select-none">
                      <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />
                      COMPILING DATA LAYER METADATA BUFFER...
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center font-mono text-[10px] text-muted-foreground gap-2 py-24 select-none">
                      <AlertCircle className="h-5 w-5 text-muted-foreground/50" />
                      <span>Zero operational logs populated.</span>
                    </div>
                  ) : (
                    jobs.map((job) => {
                      const dateFormatted = new Date(job.createdAt).toLocaleString(undefined, {
                        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
                      })

                      return (
                        <div 
                          key={job.id} 
                          onClick={() => handleDrillDownToJob(job)}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors duration-150"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-8 w-8 rounded-lg border text-[9px] font-black font-mono uppercase flex items-center justify-center shrink-0 select-none ${
                              ['xlsx', 'csv', 'ods'].includes(job.sourceFormat)
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                                : 'bg-blue-500/5 border-blue-500/20 text-blue-500'
                            }`}>
                              {job.sourceFormat}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-foreground font-mono">{job.conversionType}</span>
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted border border-border/50 px-1.5 py-0.25 rounded select-none">{job.id.substring(0, 8)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono select-none">
                                <Clock className="h-3 w-3 text-muted-foreground/50" />
                                <span>{dateFormatted}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 select-none">
                            <div className={`text-[9px] font-mono font-black border px-2 py-0.5 rounded-md ${
                              job.status === 'completed' || job.status === 'done' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                              job.status === 'failed' ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                            }`}>
                              {job.status.toUpperCase()}
                            </div>
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-border/40 bg-muted/20 px-4 py-2 flex items-center justify-between text-[9px] font-mono text-muted-foreground select-none shrink-0">
                  <span className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    SECURE CONSOLE LINK OK
                  </span>
                  <span>CLICK ROW TO AUDIT OPTIONS</span>
                </div>
              </div>
            )}

            {/* VIEW TARGET B: CONFIGURATION DRILL DOWN DETAILS VIEW */}
            {activeModalView === 'detail' && selectedJob && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background">
                <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-3 border-b border-border/40 pb-2 text-muted-foreground text-[10px] uppercase font-bold select-none">
                    <span>Validation Parameter</span>
                    <span className="col-span-2">System Schema Reference</span>
                  </div>

                  <div className="grid grid-cols-3 py-2 border-b border-border/30">
                    <span className="text-muted-foreground select-none">Job Identity</span>
                    <span className="col-span-2 text-foreground font-bold break-all select-all">{selectedJob.id}</span>
                  </div>

                  <div className="grid grid-cols-3 py-2 border-b border-border/30">
                    <span className="text-muted-foreground select-none">Conversion Match</span>
                    <span className="col-span-2 text-foreground font-bold">{selectedJob.conversionType}</span>
                  </div>

                  <div className="grid grid-cols-3 py-2 border-b border-border/30">
                    <span className="text-muted-foreground select-none">Source Format</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className="font-mono text-[10px] rounded uppercase select-none">{selectedJob.sourceFormat}</Badge>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 py-2 border-b border-border/30">
                    <span className="text-muted-foreground select-none">Target Format</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className="font-mono text-[10px] rounded uppercase border-emerald-500/30 text-emerald-500 bg-emerald-500/5 select-none">{selectedJob.targetFormat}</Badge>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 py-2 border-b border-border/30">
                    <span className="text-muted-foreground select-none">Timestamp Logs</span>
                    <span className="col-span-2 text-foreground font-bold">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold select-none">
                      <SlidersHorizontal className="h-3 w-3 text-emerald-500" />
                      <span>Denormalization Option Schema Metadata</span>
                    </div>
                    
                    {selectedJob.options && Object.keys(selectedJob.options).length > 0 ? (
                      <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 space-y-1.5 text-[11px]">
                        {Object.entries(selectedJob.options).map(([key, val]) => (
                          <div key={key} className="flex justify-between border-b border-border/20 last:border-none py-1">
                            <span className="text-muted-foreground font-bold">{key}:</span>
                            <span className="text-foreground font-black">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/20 border border-border/40 text-center text-muted-foreground py-4 rounded-xl text-[10px] tracking-tight uppercase select-none">
                        No custom options parsed for this transactional pipeline node.
                      </div>
                    )}
                  </div>
                </div>

                {/* MODAL BOTTOM ACTION ROW */}
                <div className="border-t border-border/60 p-4 bg-muted/20 flex items-center justify-between shrink-0 select-none">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToFeed}
                    className="rounded-xl h-9 text-xs font-bold px-3.5 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to History</span>
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleCloseMasterModal} className="rounded-xl h-9 text-xs font-bold px-3.5 cursor-pointer">Dismiss View</Button>
                    <Link to="/convert" onClick={handleCloseMasterModal}>
                      <Button className="rounded-xl h-9 text-xs font-black bg-emerald-500 hover:opacity-90 text-white px-4 tracking-wide flex items-center gap-1.5 shadow-xs cursor-pointer">
                        <span>Open Workspace</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </Card>
        </div>,
        document.body
      )}

    </div>
  )
}