import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth'
import api from '@/lib/api'

import {
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Sparkles,
  Clock,
  Zap,
  FileImage,
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

interface ConversionJobRealtime {
  id: string
  conversionType: string
  sourceFormat: string
  targetFormat: string
  createdAt: string
  status?: string
  mediaObjects?: Array<{
    id: string
    fileName: string
    sizeBytes: string
    role: string
  }>
}

export function Home() {
  const navigate = useNavigate()
  const authenticatedUser = useAuth((state) => state.user)

  const [recentJobs, setRecentJobs] = useState<ConversionJobRealtime[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [greeting, setGreeting] = useState('Welcome back')

  const fetchRecentJobs = async (silent = false) => {
    if (!authenticatedUser?.id) return
    if (!silent) setIsSyncing(true)
    
    try {
      const response = await api.get('/conversion_jobs', {
        params: { 
          order: { createdAt: 'desc' }, 
          page: 1,
          user: `/api/users/${authenticatedUser.id}` 
        },
      })
      const items = response.data['hydra:member'] || response.data || []
      setRecentJobs(items.slice(0, 3))
    } catch (err) {
      console.error('Sync error:', err)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    if (authenticatedUser?.id) {
      fetchRecentJobs()
    }
  }, [authenticatedUser?.id])

  useEffect(() => {
    if (!authenticatedUser?.id) return
    const timer = setInterval(() => fetchRecentJobs(true), 10000)
    return () => clearInterval(timer)
  }, [authenticatedUser?.id])

  const getRelativeTime = (isoString: string): string => {
    try {
      const date = new Date(isoString)
      const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
      const diffHours = Math.floor(diffMins / 60)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return 'Recent'
    }
  }

  const isDocType = (fmt: string) => ['doc', 'docx', 'txt'].includes((fmt || '').toLowerCase())
  const isImgType = (fmt: string) => ['png', 'jpg', 'jpeg', 'webp'].includes((fmt || '').toLowerCase())

  const navCards = [
    {
      title: 'Excel & Spreadsheets',
      description: 'Parse XLSX/CSV structures to JSON arrays or bulk SQL inserts.',
      route: '/convert',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      badge: 'SQL · JSON',
      hoverBorder: 'hover:border-blue-500/30',
      hoverBg: 'hover:bg-blue-500/5',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      title: 'Word Documents',
      description: 'Extract raw formatting patterns directly into Markdown or HTML.',
      route: '/word',
      icon: <FileText className="h-4 w-4" />,
      badge: 'MD · HTML',
      hoverBorder: 'hover:border-purple-500/30',
      hoverBg: 'hover:bg-purple-500/5',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    },
    {
      title: 'Images & Graphics',
      description: 'Map structured text layers out of imagery using neural OCR vectors.',
      route: '/images',
      icon: <FileImage className="h-4 w-4" />,
      badge: 'OCR VISION',
      hoverBorder: 'hover:border-emerald-500/30',
      hoverBg: 'hover:bg-emerald-500/5',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
  ]

  const initials = `${authenticatedUser?.firstName?.[0] ?? ''}${authenticatedUser?.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-background text-foreground flex flex-col overflow-hidden p-4 sm:p-6 relative select-none">

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute left-[5%] top-[-10%] h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-[5%] bottom-[-10%] h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      </div>

      <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 min-h-0 justify-center">

        {/* HEADER AREA */}
        <header className="flex items-center justify-between border-b border-border/20 pb-4 mb-5 shrink-0">
          <div className="flex items-center gap-4">
            {/* MATCHING COMPACT UPGRADED BORDER RING */}
            <div className="h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 shadow-sm relative group ring-1 ring-border/50">
              {authenticatedUser?.profilePicture ? (
                <img src={authenticatedUser.profilePicture} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-black tracking-wider text-primary">{initials}</span>
              )}
            </div>
            <div>
              {/* ─── EXTRA IMPRESSIVE BIG TYPOGRAPHY BUMP HERE ─── */}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-2 flex items-center gap-2 text-foreground">
                {greeting}, {authenticatedUser?.firstName || 'developer'}
                <Sparkles className="h-5 w-5 text-primary animate-pulse shrink-0" />
              </h1>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-wide">PIPELINE CONNECTIONS STABLE</span>
                <span>•</span>
                <span className="opacity-80">{authenticatedUser?.email}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchRecentJobs()}
            disabled={isSyncing}
            className="h-8 w-8 rounded-lg border-border/60 bg-card/20 shadow-xs"
          >
            <RefreshCw className={`h-3 w-3 text-muted-foreground ${isSyncing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </header>

        {/* WORKSPACE MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4 items-start flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT SIDE: ENGINES */}
          <div className="flex flex-col gap-2 w-full min-h-0">
            <div className="flex items-center gap-1.5 px-1 py-0.5">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/80 font-mono">Core Transpilers</span>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {navCards.map((card) => (
                <Card
                  key={card.route}
                  onClick={() => navigate({ to: card.route })}
                  className={`group rounded-xl border border-border/40 bg-card/40 cursor-pointer transition-all duration-150 shadow-xs ${card.hoverBorder} ${card.hoverBg}`}
                >
                  <CardContent className="p-3 flex items-center justify-between gap-4">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className={`rounded-lg border p-2 shrink-0 shadow-xs transition-transform duration-150 group-hover:scale-105 ${card.iconBg}`}>
                        {card.icon}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h3 className="font-bold text-xs tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                          {card.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-1 opacity-80 pr-2">
                          {card.description}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-[8px] font-black font-mono rounded-md px-1.5 py-0.5 border border-border/30 bg-background/50 shrink-0 select-none tracking-wider">
                      {card.badge}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: RECENT HISTORY PANEL */}
          <div className="flex flex-col gap-2 w-full min-h-0">
            <div className="flex items-center gap-1.5 px-1 py-0.5">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/80 font-mono">Your Recent Activity</span>
            </div>

            <Card className="rounded-xl border border-border/40 bg-card/40 max-h-[185px] overflow-hidden flex flex-col shadow-xs">
              <div className="overflow-y-auto block divide-y divide-border/10 scrollbar-none">
                {recentJobs.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-muted-foreground font-mono text-[9px] uppercase tracking-wider p-4 text-center">
                    {isSyncing ? 'Refreshing fields...' : 'No historical tracking logs.'}
                  </div>
                ) : (
                  recentJobs.map((item) => {
                    const filename = item.mediaObjects?.[0]?.fileName || 'Workspace Pipeline Session'
                    const isComplete = item.status === 'completed' || !item.status
                    
                    let destination = '/convert'
                    if (isDocType(item.sourceFormat)) destination = '/word'
                    if (isImgType(item.sourceFormat)) destination = '/images'

                    return (
                      <div key={item.id} className="p-2 flex items-center justify-between gap-3 bg-card/10 hover:bg-muted/5 transition-colors group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`rounded-lg border p-1 shrink-0 ${
                            isDocType(item.sourceFormat) ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                            isImgType(item.sourceFormat) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {isDocType(item.sourceFormat) ? <FileText className="h-3.5 w-3.5" /> : 
                             isImgType(item.sourceFormat) ? <FileImage className="h-3.5 w-3.5" /> : 
                             <FileSpreadsheet className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate text-foreground/90 group-hover:text-primary transition-colors leading-tight">{filename}</span>
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium mt-0.5">
                              <span className="font-mono text-primary font-bold bg-background/60 border border-border/30 px-1 py-0.25 rounded text-[8px] uppercase tracking-tight">{item.sourceFormat} ➔ {item.targetFormat}</span>
                              <span className="opacity-40">•</span>
                              <span className="opacity-90 font-mono text-[8px]">{getRelativeTime(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              sessionStorage.setItem('sheetforge_current_job_id', item.id)
                              navigate({ to: destination })
                            }}
                            className="h-5 rounded-md text-[9px] font-black text-primary border border-border/40 bg-background/50 px-2 shadow-xs hover:bg-primary/10 transition-all"
                          >
                            OPEN
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}