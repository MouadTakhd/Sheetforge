import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useAuth } from '@/stores/auth'
import api from '@/lib/api'

import {
  FileImage,
  UploadCloud,
  Loader2,
  Copy,
  Check,
  Code,
  Sparkles,
  Terminal,
  Eye,
  Download,
  ScanEye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ─── IMPORT YOUR CUSTOM ALERT COMPONENT MATRIX ───
import { AlertMatrix, AlertMessage } from '@/components/ui/AlertMatrix'

export const Route = createFileRoute('/image')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')
    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: ImageWorkspace,
})

export function ImageWorkspace() {
  const authenticatedUser = useAuth((state) => state.user)
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<'markdown' | 'html' | 'text'>('markdown')
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertedOutput, setConvertedOutput] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // ─── UNIFIED STATE USING YOUR ALERTMESSAGE OBJECT INTERFACE ───
  const [statusMessage, setStatusMessage] = useState<AlertMessage | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setStatusMessage(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const nameLower = droppedFile.name.toLowerCase()
      if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.webp')) {
        setFile(droppedFile)
        setPreviewUrl(URL.createObjectURL(droppedFile))
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Unsupported formatting layout. Please drop a valid PNG, JPG, JPEG, or WEBP image asset.'
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleTranspile = async () => {
    if (!file || !authenticatedUser?.id) return
    setIsProcessing(true)
    setConvertedOutput('')
    
    // 1. Fire up your custom alert's automated 'pending' layout stream
    setStatusMessage({
      type: 'pending',
      text: 'Executing neural OCR engine pipeline layers...'
    })
    
    const nameLower = file.name.toLowerCase()
    let detectedOrigin = 'jpeg' 
    if (nameLower.endsWith('.png')) detectedOrigin = 'png'
    if (nameLower.endsWith('.webp')) detectedOrigin = 'webp'
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetFormat', targetFormat)
    formData.append('originType', detectedOrigin) 
    formData.append('user', `/api/users/${authenticatedUser.id}`)

    try {
      const response = await api.post('/conversion_jobs/transpile_document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const resultText = response.data?.extractedContent || response.data?.content || ''
      setConvertedOutput(resultText)
      
      // 2. Transpilation success toast layout mapping
      setStatusMessage({
        type: 'success',
        text: 'Vision layout parsed and text matrix extracted successfully!'
      })
    } catch (err: any) {
      console.error("OCR transmission failure stacktrace:", err)
      
      // 3. Exception error layout routing
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || err.response?.data?.error || 'Vision model cluster rejected your extraction sequence.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = () => {
    if (!convertedOutput) return
    void navigator.clipboard.writeText(convertedOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadFile = () => {
    if (!convertedOutput || !file) return

    let extension = '.txt'
    if (targetFormat === 'markdown') extension = '.md'
    if (targetFormat === 'html') extension = '.html'

    const targetFileName = `${file.name.replace(/\.[^/.]+$/, "")}_ocr_parsed${extension}`
    const dataBlob = new Blob([convertedOutput], { type: 'text/plain;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(dataBlob)
    
    const virtualLink = document.createElement('a')
    virtualLink.href = downloadUrl
    virtualLink.download = targetFileName
    document.body.appendChild(virtualLink)
    virtualLink.click()
    
    document.body.removeChild(virtualLink)
    URL.revokeObjectURL(downloadUrl)
  }

  const outputLines = convertedOutput ? convertedOutput.split('\n') : Array(12).fill('')

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-background text-foreground flex flex-col overflow-hidden p-4 sm:p-6 relative select-none">
      
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute left-[20%] top-[-10%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 min-h-0">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-5 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-md shadow-primary/5">
              <FileImage className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-1.5 text-foreground">
                OCR Vision Transpiler
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mt-0.5">
                <span className="text-primary/90 font-bold bg-primary/5 border border-primary/20 px-1 py-0.25 rounded text-[9px]">v1.0</span>
                <span>•</span>
                <span className="tracking-wide uppercase">Pipeline: Matrix Pixel Extraction / Raster Text Analyzer</span>
              </div>
            </div>
          </div>
          
          {file && (
            <Badge variant="outline" className="text-[10px] font-mono rounded-lg border-primary/30 bg-primary/5 text-primary px-3 py-1 tracking-tight animate-fade-in shadow-xs">
              Selected Image: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </Badge>
          )}
        </header>

        {/* WORKSPACE CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-stretch flex-1 min-h-0 overflow-hidden mb-2">
          
          {/* LEFT SIDE INSTRUMENT PANEL CONTROLS */}
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto scrollbar-none justify-start">
            
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <UploadCloud className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">Source Graphical Asset</span>
              </div>

              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl border border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden group min-h-[140px] max-h-[180px] ${
                  dragActive 
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : file 
                      ? 'border-primary/20 bg-card/10' 
                      : 'border-border/60 bg-card/30 hover:bg-card/50 hover:border-primary/40'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full group/preview">
                    <img src={previewUrl} alt="OCR Resource" className="w-full h-full object-cover opacity-40 group-hover/preview:opacity-20 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/20 backdrop-blur-xs">
                      <Eye className="h-5 w-5 text-primary mb-1" />
                      <span className="text-[11px] font-black text-foreground truncate max-w-[240px]">{file?.name}</span>
                      <span className="text-[9px] font-mono text-muted-foreground mt-0.5">Click map zone to swap graphic</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border p-2.5 mb-2.5 text-muted-foreground border-border/40 bg-background group-hover:text-primary group-hover:border-primary/30 group-hover:scale-105 transition-all duration-200">
                      <FileImage className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-foreground block">Ingest imagery raster layers</span>
                    <span className="text-[9px] font-mono text-muted-foreground mt-1 block">Drop graphical layouts (.png, .jpg, .webp)</span>
                  </>
                )}
              </div>
            </div>

            {/* ─── YOUR RECTIFIED MATRIX ALERT INJECTION NODE RIGHT HERE ─── */}
            <AlertMatrix 
              message={statusMessage} 
              onClose={() => setStatusMessage(null)} 
            />

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">Compiler Config Map</span>
              </div>

              <Card className="rounded-2xl border border-border/40 bg-card/40 shadow-sm p-3.5 space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 block font-mono">Target Serialization Format</span>
                  <div className="grid grid-cols-3 gap-1 bg-background/60 border border-border/40 rounded-xl p-1">
                    {(['markdown', 'html', 'text'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setTargetFormat(fmt)}
                        className={`rounded-lg text-[10px] font-black py-1.5 px-1.5 font-mono uppercase tracking-tight transition-all ${
                          targetFormat === fmt 
                            ? 'bg-primary text-primary-foreground border border-primary/20 shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        {fmt === 'markdown' ? 'MD' : fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <Button
              onClick={handleTranspile}
              disabled={!file || isProcessing}
              className="w-full rounded-xl h-10 font-black text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 shadow-md shadow-primary/5 mt-auto shrink-0"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Neural OCR Engine...
                </>
              ) : (
                'Run Extraction Engine'
              )}
            </Button>
          </div>

          {/* IDE TARGET EDITOR BUFFER PREVIEW (RIGHT SIDE PANEL) */}
          <div className="flex flex-col gap-2 min-h-0 flex-1 h-full">
            <div className="flex items-center gap-1.5 px-1 py-0.5 shrink-0">
              <Code className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 font-mono">Transpiled Target Stream Preview</span>
            </div>

            <Card className="rounded-2xl border border-border/40 bg-[#070b13] flex-1 overflow-hidden flex flex-col shadow-lg relative group/editor ring-1 ring-white/5">
              
              <div className="border-b border-white/5 bg-[#0b1220]/80 px-4 py-2.5 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/40 border border-red-500/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                  </div>
                  <span className="h-4 w-[1px] bg-white/10 mx-2" />
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
                    {targetFormat === 'markdown' ? 'MARKDOWN_OUTPUT' : `${targetFormat.toUpperCase()}_STREAM`}
                  </span>
                </div>

                {convertedOutput && (
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadFile}
                      className="h-6 rounded-lg text-[9px] font-black font-mono text-slate-300 hover:text-white border border-white/10 px-2.5 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 shadow-xs transition-all"
                    >
                      <Download className="h-3 w-3 text-primary" />
                      DOWNLOAD FILE
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 rounded-lg text-[9px] font-black font-mono text-slate-300 hover:text-white border border-white/10 px-2.5 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 shadow-xs transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          BUFFER COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-primary" />
                          COPY BUFFER
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex overflow-hidden relative font-mono text-xs select-text">
                <div className="w-11 bg-[#090f1a] border-r border-white/5 py-4 text-right select-none pr-3 font-mono text-[10px] text-slate-600/80 space-y-1.5 font-bold tracking-tighter">
                  {outputLines.map((_, idx) => (
                    <div key={idx} className={`h-4 leading-4 ${convertedOutput ? 'group-hover/editor:text-slate-500/70 transition-colors' : ''}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-950/20 block scrollbar-none font-mono text-[11px] sm:text-xs leading-4 space-y-1.5 text-slate-200">
                  {convertedOutput ? (
                    <pre className="whitespace-pre-wrap font-mono tracking-wide pr-4 text-emerald-400/90 selection:bg-primary/30 selection:text-white leading-4">{convertedOutput}</pre>
                  ) : (
                    <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-slate-500/80 text-center uppercase tracking-wider text-[10px] gap-4 font-mono p-4">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse scale-150" />
                        <div className="h-12 w-12 rounded-xl bg-[#090f1a] border border-white/10 flex items-center justify-center text-primary relative z-10 shadow-lg">
                          <ScanEye className="h-5 w-5 text-primary/80 animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="space-y-1 max-w-[320px] relative z-10">
                        <p className="font-black text-slate-300 tracking-wide flex items-center justify-center gap-1.5">
                          {isProcessing ? "Analyzing Image Geometry" : "Awaiting Raster Injection"}
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                        </p>
                        <p className="text-[9px] lowercase tracking-normal normal-case text-slate-500 font-mono leading-normal max-w-[240px] mx-auto">
                          {isProcessing 
                            ? "Isolating high-contrast pixel boundaries and channeling spatial layer matrices down neural OCR chains..." 
                            : "Provide an optical text capture or graphic slice package to compile code values."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER METRICS */}
              <div className="border-t border-white/5 bg-[#090f1a] px-4 py-1.5 flex items-center justify-between text-[9px] font-mono text-slate-500 select-none shrink-0">
                <span className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  BUFFER_STATUS: {convertedOutput ? 'READY' : 'IDLE'}
                </span>
                <span>LINES: {convertedOutput ? outputLines.length : 0} • ENCODING: UTF-8</span>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}