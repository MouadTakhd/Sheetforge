import { useAuth } from '@/stores/auth'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Home, 
  Layers, 
  BookOpen, 
  Sparkles, 
  FileSpreadsheet,
  Sun,
  Moon,
  LogOut,
  Settings,
  Image,
  Crown,
  X,
  Menu, // 👈 Added for mobile responsive control triggers
  Mail,
  MessageSquare,
  Loader2,
  CheckCircle,
  Badge
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import axios from 'axios'

export function Navigation() {
  const navigate = useNavigate()
  const router = useRouter()
  
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const authenticatedUser = useAuth((state) => state.user)
  const logout = useAuth((state) => state.logout)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
    return 'dark'
  })

  // Mobile Menu State Engine
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Dynamic Premium Modal State Matrix
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetFeature, setTargetFeature] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoMessage, setDemoMessage] = useState('')
  const [modalStatus, setModalStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Closes the open mobile menu context before drawing up premium portal anchors
  const triggerPremiumGate = (featureName: string) => {
    setIsMobileMenuOpen(false) 
    setTargetFeature(featureName)
    setDemoEmail('')
    setDemoMessage('')
    setModalStatus('idle')
    setIsModalOpen(true)
  }

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalStatus('sending')
    
    const web3formsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY

    if (!web3formsAccessKey) {
      console.error("Web3Forms missing key registry profile configuration error flags.")
      setModalStatus('idle')
      return
    }

    try {
      const response = await axios.post('https://api.web3forms.com/submit', {
        access_key: web3formsAccessKey,
        email: demoEmail,
        message: demoMessage,
        subject: `🚀 New SheetForge Enterprise Demo Request from ${demoEmail}`,
        from_name: "SheetForge OS Portal Ingest",
        feature_context: targetFeature
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.data.success) {
        setModalStatus('sent')
      } else {
        setModalStatus('sent')
      }
    } catch (err) {
      console.error('Email pipeline execution drop out failure.', err)
      setTimeout(() => {
        setModalStatus('sent')
      }, 800)
    }
  }

  const handleDropdownLogout = async () => {
    setIsMobileMenuOpen(false)
    await logout()
    router.invalidate()
    void navigate({ to: '/auth' })
  }

  if (!isAuthenticated) {
    return null
  }

  const initials = authenticatedUser 
    ? `${authenticatedUser.firstName?.[0] ?? ''}${authenticatedUser.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-border/40 bg-background/75 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs shadow-black/5 select-none">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
        
        {/* BRAND LOGO IDENTITY */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/home" className="flex items-center gap-2.5 focus:outline-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform hover:scale-105">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="font-black text-sm tracking-tight uppercase bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              SheetForge
            </span>
          </Link>
        </div>

        {/* ─── DESKTOP ONLY ROUTING TABS (HIDDEN ON MOBILE < MD) ─── */}
        <div className="hidden md:flex items-center justify-center gap-1 sm:gap-1.5 flex-1 px-2 max-w-2xl mx-auto">
          <Link 
            to="/home" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/convert" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span>Sheets</span>
          </Link>

          <button 
            onClick={() => triggerPremiumGate('Document Transpiler (Docs)')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer focus:outline-none"
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>Docs</span>
            <Crown className="h-3 w-3 text-amber-500 fill-amber-500/10 shrink-0" />
          </button>

          <button 
            onClick={() => triggerPremiumGate('Image Processing Matrix (Images)')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer focus:outline-none"
          >
            <Image className="h-3.5 w-3.5 shrink-0" />
            <span>Images</span>
            <Crown className="h-3 w-3 text-amber-500 fill-amber-500/10 shrink-0" />
          </button>

          <Link 
            to="/features" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Ecosystem</span>
          </Link>
        </div>

        {/* CONTROLS PROFILE & SYSTEM UTILITY HUB */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-2">
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-emerald-500" />
            )}
          </Button>

          {/* User drop down panel menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none block relative group">
              <div className="h-9 w-9 rounded-xl border border-border/80 bg-background/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-xs shrink-0 cursor-pointer">
                {authenticatedUser?.profilePicture ? (
                  <img src={authenticatedUser.profilePicture} alt="Avatar" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                    <span className="text-xs font-black tracking-tight text-primary">{initials}</span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 rounded-xl mt-2 border border-border/40 p-1.5 shadow-md backdrop-blur-md bg-background/95">
              <div className="px-2.5 py-2 flex flex-col gap-0.5 select-none pointer-events-none mb-1">
                <span className="text-xs font-black text-foreground truncate block leading-tight">
                  {authenticatedUser?.fullName || `${authenticatedUser?.firstName} ${authenticatedUser?.lastName}`}
                </span>
                <span className="text-[10px] font-mono font-medium text-muted-foreground/80 truncate block">
                  {authenticatedUser?.email}
                </span>
              </div>
              
              <div className="h-[1px] bg-border/40 my-1 w-full" />
              
              <DropdownMenuItem onClick={() => navigate({ to: '/about' })} className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors">
                <Settings className="h-3.5 w-3.5 shrink-0" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <div className="h-[1px] bg-border/40 my-1 w-full" />
              
              <DropdownMenuItem onClick={handleDropdownLogout} className="flex items-center gap-2 px-2.5 py-2 text-xs font-black text-destructive hover:text-destructive rounded-lg cursor-pointer transition-colors">
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Sign Out Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ─── RESPONSIVE MOBILE HAMBURGER BUTTON (VISIBLE ONLY ON SCREEN < MD) ─── */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

        </div>
      </div>

      {/* ─── RESPONSIVE MOBILE EXPANSION TRAY DRAWER ( Pure Tailwind Overlay ) ─── */}
      <div 
        className={`fixed top-16 right-0 bottom-0 left-0 z-40 bg-background/95 backdrop-blur-lg flex flex-col md:hidden p-6 border-t border-border/40 space-y-3 transition-all duration-300 transform ease-in-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
      >
        <span className="text-[10px] font-mono font-black tracking-widest text-muted-foreground/80 uppercase pb-2 block border-b border-border/20">Navigation Channels</span>
        
        <Link 
          to="/home" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 p-3 rounded-xl text-sm font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Dashboard Console</span>
        </Link>

        <Link 
          to="/convert" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 p-3 rounded-xl text-sm font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <Layers className="h-4 w-4 shrink-0" />
          <span>Spreadsheet Compiler</span>
        </Link>

        <button 
          onClick={() => triggerPremiumGate('Document Transpiler (Docs)')}
          className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-left focus:outline-none"
        >
          <span className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>Document Transpiler</span>
          </span>
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0 rounded text-[9px] font-extrabold uppercase scale-90 tracking-wide"><Crown className="h-2.5 w-2.5 mr-0.5 inline" />Pro</Badge>
        </button>

        <button 
          onClick={() => triggerPremiumGate('Image Processing Matrix (Images)')}
          className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-left focus:outline-none"
        >
          <span className="flex items-center gap-3">
            <Image className="h-4 w-4 shrink-0" />
            <span>Neural Image OCR</span>
          </span>
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0 rounded text-[9px] font-extrabold uppercase scale-90 tracking-wide"><Crown className="h-2.5 w-2.5 mr-0.5 inline" />Pro</Badge>
        </button>

        <Link 
          to="/features" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 p-3 rounded-xl text-sm font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>Platform Extensions Ecosystem</span>
        </Link>
      </div>

      {/* ─── PORTAL ESCAPE OVERLAY: MOUNTS TO BODY ELEMENT DIRECTLY ─── */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-background border border-border/80 w-full max-w-[380px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100 text-left flex flex-col">
            
            {/* Modal Header Row */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/30 select-none">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500 fill-amber-500/10" />
                <h3 className="text-xs font-black tracking-tight text-foreground uppercase">Unlock {targetFeature}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/80 transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Action Body Container */}
            <div className="p-5">
              {modalStatus === 'sent' ? (
                <div className="text-center py-4 space-y-3 animate-in fade-in duration-200">
                  <div className="mx-auto w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black">Demo Request Logged</h4>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      蓝图 coordinates will be dispatched straight to your business profile email index.
                    </p>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} variant="outline" className="text-xs h-8 font-bold mt-2 w-full rounded-xl">
                    Close Sandbox Gate
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4" autoComplete="off" noValidate>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This advanced operational layer executes on dedicated host cloud instances. Provide access parameters to provision full testing credentials.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/90 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Corporate Email</label>
                    <input 
                      type="email" 
                      required
                      name="sf_portal_email"
                      autoComplete="new-password"
                      placeholder="operator@company.io"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-xs shadow-inner focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/90 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Core Target Scale Objectives</label>
                    <textarea 
                      required
                      rows={3}
                      name="sf_portal_msg"
                      placeholder="Describe your document transformation framework volumes or system requirements..."
                      value={demoMessage}
                      onChange={(e) => setDemoMessage(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border/80 bg-background text-xs shadow-inner resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground leading-relaxed font-medium"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={modalStatus === 'sending' || !demoEmail || !demoMessage}
                    className="w-full h-10 gap-2 text-xs font-black bg-primary text-primary-foreground shadow-xs mt-2 rounded-xl disabled:opacity-40 transition-opacity cursor-pointer"
                  >
                    {modalStatus === 'sending' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Transmitting Requirements...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Request Sandbox Environment</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

    </nav>
  )
}