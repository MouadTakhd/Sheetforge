// src/routes/convert.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useMemo, useRef, ChangeEvent, DragEvent } from 'react'
import { useConverterStore } from '@/stores/converterStore'
import { generateSql } from '@/utils/sqlGenerator'
import { exportToCsv, exportToJson, exportToXml } from '@/utils/dataExporter'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'

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
  X
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

  // Local UX States
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'sql' | 'json' | 'csv' | 'xml'>('preview')
  const [copied, setCopied] = useState(false)
  const [columnSearch, setColumnSearch] = useState('')
  const [rowSearch, setRowSearch] = useState('')

  // XML Custom Elements
  const [xmlRootElement, setXmlRootElement] = useState('dataset')
  const [xmlRowElement, setXmlRowElement] = useState('row')

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const ext = droppedFile.name.split('.').pop()?.toLowerCase()
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        await parseFile(droppedFile)
      } else {
        useConverterStore.setState({ error: "Unsupported file type. Please upload .xlsx, .xls, or .csv" })
      }
    }
  }

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await parseFile(e.target.files[0])
    }
  }

  // ─── Format Helpers ───
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

  if (isLoading) {
    return <Loader title="Parsing Spreadsheet" subtitle="Reading cells, rows, formats, and structural layouts..." />
  }

  return (
    <div className="space-y-6 text-foreground pb-12 w-full max-w-none">
      
      {/* ─── TITLE BANNER ─── */}
      {!file && (
        <section className="rounded-2xl border border-border/40 bg-card/40 p-5 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Database Schema Engine
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight">Convert files in a single workflow</h1>
              <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Upload spreadsheets (XLSX, XLS, or CSV) and convert them to structured SQL queries, clean JSON models, database tables, or CSV sheets.
              </p>
            </div>
            <Button
              className="w-full sm:w-auto rounded-xl px-6 h-11 text-xs font-bold shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              Start conversion
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </section>
      )}

      {/* ─── ERROR BANNER ─── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between text-xs text-destructive animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <div>
              <p className="font-bold">Conversion Error</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
          <button onClick={() => useConverterStore.setState({ error: null })} className="p-1 hover:bg-destructive/25 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── UPLOAD FILLER STATE ─── */}
      {!file ? (
        <div className="space-y-6 w-full">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border border-dashed p-8 sm:p-16 text-center transition-all ${
              dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border/60 bg-card/20 hover:border-primary/40 hover:bg-card/30'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".xlsx,.xls,.csv" className="hidden" />
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight">Drag & drop your file here</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
              Drop any `.xlsx`, `.xls` or `.csv` spreadsheet to inspect data structure and generate DB scripts.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {['.xlsx', '.xls', '.csv'].map((ext) => (
                <Badge key={ext} variant="secondary" className="text-[9px] font-bold rounded-full px-2 py-0 border border-border/40 bg-background/50 text-muted-foreground">
                  {ext}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full">
            {[
              { icon: <FileSpreadsheet className="h-5 w-5 text-primary" />, title: 'Sheet Layout Detection', description: 'Detects columns, types, dates, integers and strings automatically with zero loss in structure.' },
              { icon: <Database className="h-5 w-5 text-primary" />, title: 'Multi-Dialect SQL schemas', description: 'Generate production-ready tables and parameterized insertions for MySQL, PostgreSQL, and SQLite.' },
              { icon: <FileText className="h-5 w-5 text-primary" />, title: 'Custom Inferred Exports', description: 'Filter columns, rename fields, choose primary keys, and export to CSV, XML, and complex JSON formats.' },
            ].map((item, idx) => (
              <Card key={idx} className="rounded-xl border border-border/40 bg-card/30 p-5 flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-2.5 flex items-center justify-center shrink-0">{item.icon}</div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-foreground">{item.title}</h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* ─── WORKSPACE VIEW (CONNECTED FILE RECORDSTREAMS) ─── */
        <div className="space-y-6 w-full">
          
          {/* CONTROL BAR CONTROL LAYER */}
          <Card className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md shadow-sm w-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between w-full">
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 shrink-0 border border-emerald-500/20">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black tracking-tight truncate max-w-[180px] sm:max-w-[320px]">{fileName}</h2>
                      <Badge variant="outline" className="text-[9px] font-bold rounded-full px-1.5 py-0">{formatBytes(fileSize)}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <span>Sheet: <b>{currentSheet}</b></span>
                      <span>•</span>
                      <span>Total Rows: <b>{rawRows.length}</b></span>
                    </p>
                  </div>
                </div>

                {/* Form Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-end gap-3.5 w-full lg:w-auto">
                  {sheets.length > 1 && (
                    <div className="flex flex-col gap-1 w-full md:w-36">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Sheet</Label>
                      <select value={currentSheet || ''} onChange={(e) => setSheet(e.target.value)} className="h-9 w-full rounded-xl border border-border/50 bg-background/50 px-2 text-xs focus:outline-none">
                        {sheets.map((sheet) => <option key={sheet} value={sheet}>{sheet}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 w-full md:w-40">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SQL Table Name</Label>
                    <Input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="table_name" className="h-9 w-full rounded-xl border-border/50 bg-background/50 text-xs" />
                  </div>

                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Database Dialect</Label>
                    <div className="inline-flex bg-background/50 border border-border/50 rounded-xl p-0.5 gap-0.5 w-full justify-between">
                      {[
                        { value: 'mysql', label: 'MySQL', icon: Database },
                        { value: 'postgres', label: 'PostgreSQL', icon: FileJson },
                        { value: 'sqlite', label: 'SQLite', icon: TableIcon },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDbDialect(value as any)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${dbDialect === value ? 'bg-card border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button variant="destructive" size="icon" className="h-9 w-9 rounded-xl shrink-0 ml-auto md:ml-0" title="Clear Workspace" onClick={reset}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* SPLIT TWO PANEL CANVAST GRID */}
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
            
            {/* COLUMN SCHEMA CONTEXT SIDEBAR PANEL */}
            <Card className="w-full lg:w-[280px] xl:w-[320px] rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md h-auto lg:max-h-[700px] overflow-hidden flex flex-col shrink-0">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5 text-primary" />
                  <CardTitle className="text-xs sm:text-sm font-bold">Columns Structure</CardTitle>
                </div>
                <CardDescription className="text-[11px]">Map fields or customize override types.</CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3 overflow-hidden flex flex-col w-full">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search columns..." value={columnSearch} onChange={(e) => setColumnSearch(e.target.value)} className="h-8 pl-8 text-xs rounded-lg bg-background/50 border-border/40" />
                  {columnSearch && (
                    <button onClick={() => setColumnSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-[300px] lg:max-h-[480px] pr-1 space-y-2.5 divide-y divide-border/10">
                  {filteredColumns.map((col) => {
                    const isExcluded = !!columnExclusions[col]
                    const inferredType = inferredTypes[col] || 'VARCHAR(255)'
                    const customType = customTypes[col] || ''
                    const isPK = primaryKey === col

                    return (
                      <div key={col} className={`pt-2.5 space-y-1.5 first:pt-0 ${isExcluded ? 'opacity-40' : ''}`}>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <input type="checkbox" id={`exclude-${col}`} checked={!isExcluded} onChange={() => toggleColumnExclusion(col)} className="rounded border-border/50 text-primary h-3.5 w-3.5 shrink-0" />
                            <Label htmlFor={`exclude-${col}`} className="text-xs font-bold truncate cursor-pointer select-none text-foreground/90" title={col}>{col}</Label>
                          </div>
                          {!isExcluded && (
                            <button onClick={() => setPrimaryKey(isPK ? null : col)} className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition-all ${isPK ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'border-border/40 text-muted-foreground'}`}>PK</button>
                          )}
                        </div>
                        {!isExcluded && (
                          <div className="flex items-center gap-1.5 pl-5 w-full">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Type:</span>
                            <select value={customType || inferredType} onChange={(e) => setColumnType(col, e.target.value)} className="h-7 w-full rounded-md border border-border/40 bg-background/40 px-1 text-[11px] focus:outline-none">
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
              
              {/* Swipe Scrollable Custom Formats Navigation Tab Strip */}
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
                    className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-foreground bg-muted/20 rounded-t-lg' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* VIEWPORT NODE A: SPREADSHEET INTERACTIVE LOG GRID CONTAINER */}
              {activeTab === 'preview' && (
                <div className="space-y-4 w-full">
                  
                  {/* Grid Search Header Block Elements */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Filter spreadsheet dataset records..." value={rowSearch} onChange={(e) => setRowSearch(e.target.value)} className="h-9 pl-8 text-xs rounded-xl bg-card/30" />
                      {rowSearch && (
                        <button onClick={() => setRowSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end text-[11px] text-muted-foreground font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span>Page size:</span>
                        <select value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))} className="h-7 rounded border border-border/40 bg-card px-1 text-[11px] focus:outline-none">
                          {[10, 25, 50].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <span>Rows: {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length}</span>
                    </div>
                  </div>

                  {/* Clean Tabular Flow Matrix Output Grid */}
                  <div className="w-full overflow-x-auto rounded-xl border border-border/50 bg-card/20 shadow-sm scrollbar-none">
                    <table className="w-full border-collapse text-left text-xs min-w-[500px]">
                      <thead className="bg-muted/40 border-b border-border/40 font-bold text-muted-foreground uppercase tracking-wider">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th key={header.id} colSpan={header.colSpan} className="p-3 border-r border-border/10 cursor-pointer hover:bg-muted/50 select-none" onClick={header.column.getToggleSortingHandler()}>
                                <div className="flex items-center gap-1 truncate max-w-[120px]">
                                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : null}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="p-3 border-r border-border/10 truncate max-w-[150px] text-foreground/80 font-medium">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Grid Pagination Row buttons controller */}
                  {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-1 w-full">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="h-7 w-7 rounded-md"><ChevronsLeft className="h-3.5 w-3.5" /></Button>
                        <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-7 w-7 rounded-md"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground">Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-7 w-7 rounded-md"><ChevronRight className="h-3.5 w-3.5" /></Button>
                        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="h-7 w-7 rounded-md"><ChevronsRight className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEWPORT NODE B: CONVERSION EXPORT LAYER CHANNELS (SQL, JSON, CSV, XML) */}
              {activeTab !== 'preview' && (
                <div className="space-y-3 w-full animate-in fade-in-40 duration-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border border-border/50 bg-card/20 w-full">
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {activeTab === 'json' && (
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Layout:</span>
                          <select value={jsonFormat} onChange={(e) => setJsonFormat(e.target.value as any)} className="h-8 rounded-lg border border-border/40 bg-background px-2 text-xs focus:outline-none w-full sm:w-auto">
                            <option value="object-array">Array of Objects</option>
                            <option value="array-array">Array of Arrays (Grid table)</option>
                            <option value="keyed-object">Keyed JSON Object</option>
                          </select>
                        </div>
                      )}

                      {activeTab === 'xml' && (
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full">
                          <div className="flex items-center gap-1.5"><span className="text-[11px] font-bold text-muted-foreground uppercase">Root:</span><Input type="text" value={xmlRootElement} onChange={(e) => setXmlRootElement(e.target.value)} className="h-7 w-20 text-xs rounded-md" /></div>
                          <div className="flex items-center gap-1.5"><span className="text-[11px] font-bold text-muted-foreground uppercase">Row:</span><Input type="text" value={xmlRowElement} onChange={(e) => setXmlRowElement(e.target.value)} className="h-7 w-20 text-xs rounded-md" /></div>
                        </div>
                      )}

                      {activeTab === 'sql' && <span className="text-[11px] font-semibold text-muted-foreground leading-tight">Includes automated <code>DROP TABLE</code> arrays context statements blocks.</span>}
                      {activeTab === 'csv' && <span className="text-[11px] font-semibold text-muted-foreground leading-tight">Formatted with standard double quote parameter string escape constraints.</span>}
                    </div>

                    {/* Action utility row buttons */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t border-border/10 pt-2 sm:pt-0 sm:border-none">
                      <Button variant="outline" onClick={handleCopy} className="flex-1 sm:flex-initial h-8 px-3 rounded-lg text-[11px] font-bold gap-1">
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                      </Button>
                      <Button onClick={handleDownload} className="flex-1 sm:flex-initial h-8 px-3 rounded-lg text-[11px] font-bold gap-1">
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>

                  {/* High Density Code Block Terminal Stage View */}
                  <div className="relative rounded-xl border border-border/60 bg-zinc-950 p-4 shadow-inner">
                    <pre className="font-mono text-[11px] text-zinc-300 overflow-auto max-h-[400px] lg:max-h-[550px] whitespace-pre-wrap select-all leading-relaxed scrollbar-none">
                      {activeCodeContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}