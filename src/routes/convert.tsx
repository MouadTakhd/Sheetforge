import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useMemo, useRef, ChangeEvent, DragEvent, useEffect } from 'react'
import { useConverterStore } from '@/stores/converterStore'
import { generateSql } from '@/utils/sqlGenerator'
import { exportToCsv, exportToJson, exportToXml } from '@/utils/dataExporter'
import api from '@/lib/api'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertMatrix, type AlertMessage } from '@/components/ui/AlertMatrix'

import {
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Upload,
  Database,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Copy,
  Check,
  Download,
  Trash2,
  Table as TableIcon,
  Code,
  FileCode,
  FileJson,
  X,
  Loader2,
  Play
} from 'lucide-react'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState
} from '@tanstack/react-table'

export const Route = createFileRoute('/convert')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')
    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: ConvertPage,
})

type ConversionTargetFormat = 'sql' | 'json' | 'csv' | 'xml'

function ConvertPage() {
  const {
    file,
    fileName,
    fileSize,
    sheets,
    currentSheet,
    columns,
    rawRows,
    tableName,
    dbDialect,
    inferredTypes,
    customTypes,
    columnExclusions,
    primaryKey,
    jsonFormat,
    isLoading,
    error,
    setSheet,
    setDbDialect,
    setTableName,
    toggleColumnExclusion,
    setColumnType,
    setPrimaryKey,
    setJsonFormat,
    reset,
    parseFile,
  } = useConverterStore()

  // Local UI States
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'sql' | 'json' | 'csv' | 'xml'>('preview')
  const [copied, setCopied] = useState(false)
  const [columnSearch, setColumnSearch] = useState('')
  const [rowSearch, setRowSearch] = useState('')
  const [alert, setAlert] = useState<AlertMessage | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // ─── STAGE TARGET CONFIGURATION EXTRACTIONS ───
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [chosenTargetFormat, setChosenTargetFormat] = useState<ConversionTargetFormat>('json')

  // XML Custom Elements
  const [xmlRootElement, setXmlRootElement] = useState('dataset')
  const [xmlRowElement, setXmlRowElement] = useState('row')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Synchronize internal store parsing exceptions straight down onto the AlertMatrix system
  useEffect(() => {
    if (error) {
      setAlert({ type: 'error', text: error })
    }
  }, [error])

  // ─── STAGE CORRELATION ARCHITECTURE: S3 AUTOMATED PIPELINE ───
  const processDocumentPipeline = async () => {
    if (!stagedFile) return
    
    setIsUploading(true)
    setAlert({ type: 'pending', text: 'Initializing conversion tracking metadata matrix...' })

    try {
      const preservedFileBlob = stagedFile.slice(0, stagedFile.size, stagedFile.type);
      const stableFilePayload = new File([preservedFileBlob], stagedFile.name, {
        type: stagedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // 1. Create the base job tracking node anchor using the custom selected choice parameter
      const ext = stableFilePayload.name.split('.').pop()?.toLowerCase() || 'xlsx'
      
      const jobResponse = await api.post('/conversion_jobs', {
        conversionType: `${ext}_to_${chosenTargetFormat}`,
        sourceFormat: ext,
        targetFormat: chosenTargetFormat,
        options: { delimiter: ';', sheet_name: currentSheet || 'Sheet1', encoding: 'UTF-8' }
      })

      const registeredJobId = jobResponse.data.id

      // 2. Stream raw binary data directly down onto our unified S3 bucket object action
      setAlert({ type: 'pending', text: 'Streaming binary document packages securely down into S3 storage container...' })
      
      const multipartPayload = new FormData()
      multipartPayload.append('file', stableFilePayload)
      multipartPayload.append('jobId', registeredJobId)
      multipartPayload.append('role', 'input')

      await api.post('/media_objects', multipartPayload)

      // 3. Complete localized parse parsing into the reactive spreadsheet store engine
      await parseFile(stableFilePayload)
      
      // Auto toggle navigation tab to match user's intentional pipeline destination format choice
      setActiveTab(chosenTargetFormat)

      setAlert({ type: 'success', text: 'Document successfully optimized. Architecture key logs generated on S3 storage.' })
    } catch (err: any) {
      console.error(err)
      setAlert({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Asset pipeline transfer lookup dropped out. Please try again.' 
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle local workspace clearing safely
  const handleClearWorkspace = () => {
    setStagedFile(null)
    reset()
  }

  // ─── Drag & Drop Event Handlers ───
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleStageValidation = (target: File) => {
    const ext = target.name.split('.').pop()?.toLowerCase()
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setStagedFile(target)
      setAlert(null)
    } else {
      setAlert({ type: 'error', text: "Unsupported file type. Please upload .xlsx, .xls, or .csv configuration records." })
    }
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleStageValidation(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleStageValidation(e.target.files[0])
    }
  }

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ─── TanStack Table Setup ───
  const tableColumns = useMemo(() => {
    return columns
      .filter((col) => !columnExclusions[col])
      .map((col) => ({
        accessorKey: col,
        header: col,
        cell: (info: any) => {
          const val = info.getValue()
          if (val === null || val === undefined) {
            return <span className="text-muted-foreground/50 italic font-light text-xs">null</span>
          }
          if (typeof val === 'boolean') {
            return (
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${val ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {val ? 'true' : 'false'}
              </span>
            )
          }
          if (val instanceof Date) {
            return val.toLocaleDateString()
          }
          return String(val)
        },
      }))
  }, [columns, columnExclusions])

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: rawRows,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter: rowSearch,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setRowSearch,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // ─── Computed Exports ───
  const generatedSqlCode = useMemo(() => {
    if (!file || rawRows.length === 0) return ''
    return generateSql({
      dialect: dbDialect,
      tableName,
      columns,
      inferredTypes,
      customTypes,
      columnExclusions,
      primaryKey,
      rows: rawRows,
    })
  }, [file, dbDialect, tableName, columns, inferredTypes, customTypes, columnExclusions, primaryKey, rawRows])

  const generatedJsonCode = useMemo(() => {
    if (!file || rawRows.length === 0) return ''
    return exportToJson(rawRows, columns, columnExclusions, jsonFormat, primaryKey)
  }, [file, rawRows, columns, columnExclusions, jsonFormat, primaryKey])

  const generatedCsvCode = useMemo(() => {
    if (!file || rawRows.length === 0) return ''
    return exportToCsv(rawRows, columns, columnExclusions)
  }, [file, rawRows, columns, columnExclusions])

  const generatedXmlCode = useMemo(() => {
    if (!file || rawRows.length === 0) return ''
    return exportToXml(rawRows, columns, columnExclusions, xmlRootElement, xmlRowElement)
  }, [file, rawRows, columns, columnExclusions, xmlRootElement, xmlRowElement])

  const activeCodeContent = useMemo(() => {
    switch (activeTab) {
      case 'sql': return generatedSqlCode
      case 'json': return generatedJsonCode
      case 'csv': return generatedCsvCode
      case 'xml': return generatedXmlCode
      default: return ''
    }
  }, [activeTab, generatedSqlCode, generatedJsonCode, generatedCsvCode, generatedXmlCode])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCodeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const handleDownload = () => {
    let content = activeCodeContent
    let extension = 'txt'
    let mimeType = 'text/plain'

    switch (activeTab) {
      case 'sql': extension = 'sql'; mimeType = 'application/sql'; break
      case 'json': extension = 'json'; mimeType = 'application/json'; break
      case 'csv': extension = 'csv'; mimeType = 'text/csv'; break
      case 'xml': extension = 'xml'; mimeType = 'application/xml'; break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const downloadName = tableName ? `${tableName}.${extension}` : `export.${extension}`
    a.download = downloadName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sqlTypesList = useMemo(() => {
    if (dbDialect === 'mysql') {
      return ['INT', 'BIGINT', 'VARCHAR(255)', 'VARCHAR(100)', 'TEXT', 'DOUBLE', 'DECIMAL(10,2)', 'DATETIME', 'DATE', 'TINYINT(1)']
    }
    if (dbDialect === 'postgres') {
      return ['INTEGER', 'BIGINT', 'VARCHAR(255)', 'VARCHAR(100)', 'TEXT', 'DOUBLE PRECISION', 'NUMERIC(10,2)', 'TIMESTAMP', 'DATE', 'BOOLEAN']
    }
    return ['INTEGER', 'REAL', 'TEXT', 'BLOB', 'NONE']
  }, [dbDialect])

  const filteredColumns = useMemo(() => {
    return columns.filter((col) => col.toLowerCase().includes(columnSearch.toLowerCase()))
  }, [columns, columnSearch])

  return (
    <div className="space-y-6 text-foreground pb-12 w-full max-w-none relative min-h-[70vh]">
      
      {/* ─── DYNAMIC OVERLAY VECTOR ACCENTS ─── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute right-[-5%] top-[-5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-[-10%] bottom-[5%] h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* ─── UNIFIED PIPELINE ALERTS SYSTEM ─── */}
      <AlertMatrix message={alert} onClose={() => setAlert(null)} />

      {/* ─── USER-FRIENDLY NAVIGATION LOADER WRAPPER ─── */}
      {isLoading || isUploading ? (
        <div className="flex flex-col min-h-[50vh] w-full items-center justify-center space-y-4 border border-border/40 bg-card/10 rounded-2xl backdrop-blur-md animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <h3 className="font-black text-sm tracking-tight text-foreground">Executing Asset Conversion Engine</h3>
            <p className="text-xs text-muted-foreground max-w-xs px-4">Streaming raw boundaries to cloud buckets, initializing tracking logs, and computing schema rules...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ─── STAGE A: FILE IS NOT LOADED AND NOT STAGED YET ─── */}
          {!file && !stagedFile && (
            <>
              <section className="rounded-2xl border border-border/40 bg-card/40 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md shadow-xs animate-in fade-in-50 duration-200">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary backdrop-blur-sm border border-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                      Production Pipeline Router
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none">Convert files in a single workflow</h1>
                    <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                      Select or drop spreadsheets (XLSX, XLS, or CSV), choose your explicit target output format configurations, and initialize real-time S3 cloud optimization maps.
                    </p>
                  </div>
                  <Button
                    className="w-full sm:w-auto rounded-xl px-6 h-11 text-xs font-bold shrink-0 shadow-lg hover:shadow transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File Channel
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </section>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border border-dashed p-8 sm:p-16 text-center backdrop-blur-xs transition-all ${
                  dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border/60 bg-card/20 hover:border-primary/40 hover:bg-card/30 shadow-md'
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".xlsx,.xls,.csv" className="hidden" />
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-2xl font-black tracking-tight">Drag & drop your file here</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                  Drop any `.xlsx`, `.xls` or `.csv` spreadsheet to stage target compilation properties.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  {['.xlsx', '.xls', '.csv'].map((ext) => (
                    <Badge key={ext} variant="secondary" className="text-[9px] font-black rounded-full px-2.5 py-0.5 border border-border/40 bg-background/50 text-muted-foreground">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── STAGE B: STAGED CONFIGURATION SELECTOR OPTIONS VIEW (BEFORE PARSING) ─── */}
          {!file && stagedFile && (
            <Card className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md shadow-xl max-w-xl mx-auto p-6 animate-in zoom-in-95 duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 border-b border-border/20 pb-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">File Staged Successfully</span>
                    <h2 className="text-base sm:text-lg font-black tracking-tight truncate text-foreground mt-0.5">{stagedFile.name}</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Size Matrix: {formatBytes(stagedFile.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClearWorkspace} className="rounded-xl h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/90">Target Conversion Target Destination</Label>
                  <p className="text-xs text-muted-foreground leading-normal font-medium">
                    Choose how you want your data structure to transform before initializing S3 streaming and tracking keys execution loops:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
                    {[
                      { id: 'json', title: 'JSON Array Model', desc: 'Object mapping collections frameworks.', icon: <FileCode className="h-4 w-4 text-purple-400" /> },
                      { id: 'sql', title: 'Relational SQL Script', desc: 'Auto type inference schemas batch.', icon: <Database className="h-4 w-4 text-blue-400" /> },
                      { id: 'csv', title: 'Clean CSV Sheet', desc: 'Sanitized double quote rows escape.', icon: <FileText className="h-4 w-4 text-emerald-400" /> },
                      { id: 'xml', title: 'Hierarchical XML Matrix', desc: 'Custom element tag dataset mapping.', icon: <Code className="h-4 w-4 text-orange-400" /> },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setChosenTargetFormat(opt.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          chosenTargetFormat === opt.id
                            ? 'border-primary bg-primary/5 shadow-inner'
                            : 'border-border/60 bg-background/40 hover:border-border hover:bg-card/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-lg bg-background p-1.5 border border-border/40">{opt.icon}</div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{opt.title}</h4>
                            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-border/20">
                  <Button variant="outline" onClick={handleClearWorkspace} className="flex-1 rounded-xl h-10 font-bold text-xs border-border/80">
                    Cancel
                  </Button>
                  <Button onClick={processDocumentPipeline} className="flex-1 rounded-xl h-10 font-bold cursor-pointer text-xs bg-primary text-primary-foreground gap-2 shadow-lg">
                    <Play className="h-3 w-3 fill-current" />
                    Commit Conversion
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ─── STAGE C: CONNECTED ACTIVE INTERACTIVE WORKSPACE CANVAS ─── */}
          {file && (
            <div className="space-y-6 w-full animate-in fade-in-40 duration-300">
              
              {/* CONTROL BAR CONTROL LAYER */}
              <Card className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md shadow-md w-full overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between w-full">
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                      <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 shrink-0 border border-emerald-500/20">
                        <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-black tracking-tight truncate max-w-[180px] sm:max-w-[320px]">{fileName}</h2>
                          <Badge variant="outline" className="text-[9px] font-black rounded-full px-2 py-0.5 bg-background border-border/60">{formatBytes(fileSize)}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 font-medium">
                          <span>Sheet: <b className="text-foreground">{currentSheet}</b></span>
                          <span>•</span>
                          <span>Total Rows: <b className="text-foreground">{rawRows.length}</b></span>
                        </p>
                      </div>
                    </div>

                    {/* Form Controls Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-end gap-3.5 w-full lg:w-auto">
                      {sheets.length > 1 && (
                        <div className="flex flex-col gap-1.5 w-full md:w-36">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">Select Sheet</Label>
                          <select value={currentSheet || ''} onChange={(e) => setSheet(e.target.value)} className="h-9 w-full rounded-xl border border-border/60 bg-background px-2.5 text-xs focus:outline-none font-semibold text-foreground/90 shadow-xs">
                            {sheets.map((sheet) => <option key={sheet} value={sheet}>{sheet}</option>)}
                          </select>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 w-full md:w-40">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">SQL Table Name</Label>
                        <Input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="table_name" className="h-9 w-full rounded-xl border border-border/60 bg-background/50 text-xs focus-visible:ring-primary/10 shadow-xs font-semibold" />
                      </div>

                      <div className="flex flex-col gap-1.5 w-full md:w-auto">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">Database Dialect</Label>
                        <div className="inline-flex bg-background/50 border border-border/60 rounded-xl p-0.5 gap-0.5 w-full justify-between shadow-xs">
                          {[
                            { value: 'mysql', label: 'MySQL', icon: Database },
                            { value: 'postgres', label: 'PostgreSQL', icon: FileJson },
                            { value: 'sqlite', label: 'SQLite', icon: TableIcon },
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setDbDialect(value as any)}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${dbDialect === value ? 'bg-card border border-border/50 text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              <Icon className="h-3 w-3 shrink-0" />
                              <span className="hidden sm:inline">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0 ml-auto md:ml-0 border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shadow-xs" title="Clear Workspace" onClick={handleClearWorkspace}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* SPLIT TWO PANEL CANVAS GRID */}
              <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 items-start w-full">
                
                {/* COLUMN SCHEMA CONTEXT SIDEBAR PANEL */}
                <Card className="w-full rounded-2xl border border-border/40 bg-card/10 backdrop-blur-md shadow-md h-auto lg:max-h-[650px] overflow-hidden flex flex-col shrink-0">
                  <CardHeader className="p-4 pb-2 border-b border-border/10 bg-muted/20">
                    <div className="flex items-center gap-1.5">
                      <Settings className="h-3.5 w-3.5 text-primary" />
                      <CardTitle className="text-xs sm:text-sm font-black tracking-tight">Columns Map</CardTitle>
                    </div>
                    <CardDescription className="text-[11px] font-medium text-muted-foreground">Isolate fields or override code types.</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-4 space-y-3 overflow-hidden flex flex-col w-full">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Search columns..." value={columnSearch} onChange={(e) => setColumnSearch(e.target.value)} className="h-8 pl-8 text-xs rounded-xl bg-background/50 border-border/60 shadow-xs font-semibold" />
                      {columnSearch && (
                        <button onClick={() => setColumnSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-[300px] lg:max-h-[440px] pr-1 space-y-2.5 divide-y divide-border/10 scrollbar-none">
                      {filteredColumns.map((col) => {
                        const isExcluded = !!columnExclusions[col]
                        const inferredType = inferredTypes[col] || 'VARCHAR(255)'
                        const customType = customTypes[col] || ''
                        const isPK = primaryKey === col

                        return (
                          <div key={col} className={`pt-2.5 space-y-1.5 first:pt-0 transition-opacity ${isExcluded ? 'opacity-40' : ''}`}>
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <input type="checkbox" id={`exclude-${col}`} checked={!isExcluded} onChange={() => toggleColumnExclusion(col)} className="rounded border-border/60 text-primary h-3.5 w-3.5 shrink-0 focus:ring-primary/10" />
                                <Label htmlFor={`exclude-${col}`} className="text-xs font-bold truncate cursor-pointer select-none text-foreground/90 font-mono" title={col}>{col}</Label>
                              </div>
                              {!isExcluded && (
                                <button onClick={() => setPrimaryKey(isPK ? null : col)} className={`px-2 py-0.5 rounded-md text-[9px] font-black border transition-all shadow-xs ${isPK ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-extrabold' : 'border-border/60 text-muted-foreground bg-background/40 font-bold'}`}>PK</button>
                              )}
                            </div>
                            {!isExcluded && (
                              <div className="flex items-center gap-1.5 pl-5 w-full">
                                <span className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-wider shrink-0">Type:</span>
                                <select value={customType || inferredType} onChange={(e) => setColumnType(col, e.target.value)} className="h-7 w-full rounded-lg border border-border/60 bg-background/40 px-1.5 text-[11px] focus:outline-none font-semibold shadow-xs text-foreground/80">
                                  <optgroup label="Auto-Inferred"><option value={inferredType}>{inferredType}</option></optgroup>
                                  <optgroup label="Overrides">{sqlTypesList.filter(t => t !== inferredType).map(t => <option key={t} value={t}>{t}</option>)}</optgroup>
                                </select>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* RIGHT MAIN CORE GRID STREAM AND SOURCE WORKSPACE DISPLAY */}
                <div className="flex-1 w-full min-w-0 space-y-4">
                  
                  {/* Custom Formats Navigation Tab Strip */}
                  <div className="flex border-b border-border/40 gap-1.5 overflow-x-auto select-none scrollbar-none pb-px w-full">
                    {[
                      { id: 'preview', label: 'Grid Preview', icon: <TableIcon className="h-3.5 w-3.5" /> },
                      { id: 'sql', label: 'SQL Script', icon: <Database className="h-3.5 w-3.5" /> },
                      { id: 'json', label: 'JSON Model', icon: <FileCode className="h-3.5 w-3.5" /> },
                      { id: 'csv', label: 'CSV File', icon: <FileText className="h-3.5 w-3.5" /> },
                      { id: 'xml', label: 'XML Matrix', icon: <Code className="h-3.5 w-3.5" /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-black transition-all whitespace-nowrap tracking-wide ${activeTab === tab.id ? 'border-primary text-foreground bg-muted/10 rounded-t-xl font-black' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'}`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* VIEWPORT NODE A: GRID CONTROLLER */}
                  {activeTab === 'preview' && (
                    <div className="space-y-4 w-full animate-in fade-in-40 duration-200">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input placeholder="Filter spreadsheet records..." value={rowSearch} onChange={(e) => setRowSearch(e.target.value)} className="h-9 pl-8 text-xs rounded-xl bg-card/10 border-border/60 shadow-xs font-semibold focus-visible:ring-primary/10" />
                          {rowSearch && (
                            <button onClick={() => setRowSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end text-[11px] text-muted-foreground font-bold">
                          <div className="flex items-center gap-1.5">
                            <span>Page size:</span>
                            <select value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))} className="h-7 rounded-md border border-border/60 bg-card px-1.5 text-[11px] focus:outline-none font-bold shadow-xs">
                              {[10, 25, 50].map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <span className="bg-muted/30 border border-border/10 px-2 py-0.5 rounded-md">Rows: {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length}</span>
                        </div>
                      </div>

                      {/* Tabular Flow Matrix Output Grid */}
                      <div className="w-full overflow-x-auto rounded-2xl border border-border/50 bg-card/10 backdrop-blur-xs shadow-md scrollbar-none">
                        <table className="w-full border-collapse text-left text-xs min-w-[500px]">
                          <thead className="bg-muted/30 border-b border-border/40 font-black text-muted-foreground uppercase tracking-wider text-[10px]">
                            {table.getHeaderGroups().map((headerGroup) => (
                              <tr key={headerGroup.id}>
                                {table.getHeaderGroups()[0].headers.map((header) => (
                                  <th key={header.id} colSpan={header.colSpan} className="p-3.5 border-r border-border/10 cursor-pointer hover:bg-muted/40 select-none transition-colors" onClick={header.column.getToggleSortingHandler()}>
                                    <div className="flex items-center gap-1.5 truncate max-w-[120px] font-mono">
                                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                      {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : null}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody className="divide-y divide-border/10 font-medium text-foreground/80">
                            {table.getRowModel().rows.map((row) => (
                              <tr key={row.id} className="hover:bg-muted/5 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                  <td key={cell.id} className="p-3 border-r border-border/10 truncate max-w-[150px] font-mono font-medium text-xs">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Grid Pagination Control Row */}
                      {table.getPageCount() > 1 && (
                        <div className="flex items-center justify-between gap-2 pt-2 w-full">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="h-7 w-7 rounded-lg border-border/80 shadow-xs"><ChevronsLeft className="h-3.5 w-3.5" /></Button>
                            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-7 w-7 rounded-lg border-border/80 shadow-xs"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                          </div>
                          <span className="text-[11px] font-black text-muted-foreground bg-muted/20 px-2.5 py-0.5 rounded-full border border-border/10 shadow-inner">Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-7 w-7 rounded-lg border-border/80 shadow-xs"><ChevronRight className="h-3.5 w-3.5" /></Button>
                            <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="h-7 w-7 rounded-lg border-border/80 shadow-xs"><ChevronsRight className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIEWPORT NODE B: CONVERSION EXPORT LAYER CHANNELS */}
                  {activeTab !== 'preview' && (
                    <div className="space-y-3 w-full animate-in fade-in-40 duration-200">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-border/50 bg-card/10 backdrop-blur-md shadow-md w-full">
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {activeTab === 'json' && (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider shrink-0">Layout:</span>
                              <select value={jsonFormat} onChange={(e) => setJsonFormat(e.target.value as any)} className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-xs focus:outline-none font-semibold shadow-xs text-foreground/90 w-full sm:w-auto">
                                <option value="object-array">Array of Objects</option>
                                <option value="array-array">Array of Arrays (Grid table)</option>
                                <option value="keyed-object">Keyed JSON Object</option>
                              </select>
                            </div>
                          )}

                          {activeTab === 'xml' && (
                            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full">
                              <div className="flex items-center gap-2"><span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Root:</span><Input type="text" value={xmlRootElement} onChange={(e) => setXmlRootElement(e.target.value)} className="h-8 w-24 text-xs rounded-lg border-border/60 bg-background font-mono" /></div>
                              <div className="flex items-center gap-2"><span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Row:</span><Input type="text" value={xmlRowElement} onChange={(e) => setXmlRowElement(e.target.value)} className="h-8 w-24 text-xs rounded-lg border-border/60 bg-background font-mono" /></div>
                            </div>
                          )}

                          {activeTab === 'sql' && <span className="text-[11px] font-bold text-muted-foreground/80 leading-tight">Includes automated <code>DROP TABLE</code> parameter queries.</span>}
                          {activeTab === 'csv' && <span className="text-[11px] font-bold text-muted-foreground/80 leading-tight">Formatted with standard double quote escape constraints.</span>}
                        </div>

                        {/* Action utility row buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-border/10 pt-3 sm:pt-0 sm:border-none">
                          <Button variant="outline" onClick={handleCopy} className="flex-1 sm:flex-initial h-8 px-4 rounded-xl text-[11px] font-black gap-1.5 border-border/80 shadow-xs">
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                          </Button>
                          <Button onClick={handleDownload} className="flex-1 sm:flex-initial h-8 px-4 rounded-xl text-[11px] font-black gap-1.5 bg-primary text-primary-foreground shadow-md hover:shadow transition-all">
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>

                      {/* High Density Code Block Terminal Stage View */}
                      <div className="relative rounded-2xl border border-border/60 bg-zinc-950 p-5 shadow-2xl overflow-hidden">
                        <div className="absolute top-2 right-3 text-[9px] font-mono text-zinc-600 uppercase font-black select-none">{activeTab} sandbox</div>
                        <pre className="font-mono text-[11px] text-zinc-300 overflow-auto max-h-[400px] lg:max-h-[500px] whitespace-pre-wrap select-all RegalScroll leading-relaxed scrollbar-none pr-2">
                          {activeCodeContent}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}