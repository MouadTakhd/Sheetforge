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
import { Checkbox } from '@/components/ui/checkbox'
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
    const token = localStorage.getItem('auth_token')
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
    setFile,
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

  // ─── Active Output Selection ───
  const activeCodeContent = useMemo(() => {
    switch (activeTab) {
      case 'sql':
        return generatedSqlCode
      case 'json':
        return generatedJsonCode
      case 'csv':
        return generatedCsvCode
      case 'xml':
        return generatedXmlCode
      default:
        return ''
    }
  }, [activeTab, generatedSqlCode, generatedJsonCode, generatedCsvCode, generatedXmlCode])

  // ─── Trigger Copy to Clipboard ───
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCodeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  // ─── Trigger Downloads ───
  const handleDownload = () => {
    let content = activeCodeContent
    let extension = 'txt'
    let mimeType = 'text/plain'

    switch (activeTab) {
      case 'sql':
        extension = 'sql'
        mimeType = 'application/sql'
        break
      case 'json':
        extension = 'json'
        mimeType = 'application/json'
        break
      case 'csv':
        extension = 'csv'
        mimeType = 'text/csv'
        break
      case 'xml':
        extension = 'xml'
        mimeType = 'application/xml'
        break
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

  // ─── Common Column Types List ───
  const sqlTypesList = useMemo(() => {
    if (dbDialect === 'mysql') {
      return ['INT', 'BIGINT', 'VARCHAR(255)', 'VARCHAR(100)', 'TEXT', 'DOUBLE', 'DECIMAL(10,2)', 'DATETIME', 'DATE', 'TINYINT(1)']
    }
    if (dbDialect === 'postgres') {
      return ['INTEGER', 'BIGINT', 'VARCHAR(255)', 'VARCHAR(100)', 'TEXT', 'DOUBLE PRECISION', 'NUMERIC(10,2)', 'TIMESTAMP', 'DATE', 'BOOLEAN']
    }
    // SQLite
    return ['INTEGER', 'REAL', 'TEXT', 'BLOB', 'NONE']
  }, [dbDialect])

  // Filtered columns for the sidebar mapping
  const filteredColumns = useMemo(() => {
    return columns.filter((col) => col.toLowerCase().includes(columnSearch.toLowerCase()))
  }, [columns, columnSearch])

  // Loader View
  if (isLoading) {
    return <Loader title="Parsing Spreadsheet" subtitle="Reading cells, rows, formats, and structural layouts..." />
  }

  return (
    <main className="space-y-8 text-foreground pb-24">
      {/* ─── TITLE BANNER (only when no file is uploaded) ─── */}
      {!file && (
        <section className="rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute right-0 top-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-24 w-24 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Database Schema Engine
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Convert files in a single workflow</h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Upload spreadsheets (XLSX, XLS, or CSV) and convert them to structured SQL queries, clean JSON models, database tables, or CSV sheets.
              </p>
            </div>
            <Button
              className="w-full sm:w-auto rounded-xl px-6 h-12 shadow-lg shadow-primary/15"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
            >
              Start conversion
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* ─── ERROR BANNER ─── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center justify-between text-sm text-destructive anim-fade">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Conversion Error</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={() => useConverterStore.setState({ error: null })}
            className="p-1 hover:bg-destructive/25 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── UPLOAD VIEW (File Null) ─── */}
      {!file ? (
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-[2.5rem] border border-dashed p-16 text-center transition-all duration-300
              ${
                dragActive
                  ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/5 scale-[0.99]'
                  : 'border-primary/20 bg-card/30 hover:border-primary/40 hover:bg-card/40'
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

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary shadow-inner">
              <Upload className="h-9 w-9 animate-bounce" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Drag & drop your file here
            </h3>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              Drop any `.xlsx`, `.xls` or `.csv` spreadsheet to inspect data structure and generate DB scripts.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
              {['.xlsx', '.xls', '.csv'].map((ext) => (
                <Badge
                  key={ext}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs border border-white/5 bg-background/50 text-muted-foreground"
                >
                  {ext}
                </Badge>
              ))}
            </div>

            <Button className="mt-8 h-12 rounded-xl px-8 shadow-md">
              Choose File
            </Button>
          </div>

          {/* SKELETON CARDS FOR INFO */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <FileSpreadsheet className="h-6 w-6 text-primary" />,
                title: 'Sheet Layout Detection',
                description: 'Detects columns, types, dates, integers and strings automatically with zero loss in structure.'
              },
              {
                icon: <Database className="h-6 w-6 text-primary" />,
                title: 'Multi-Dialect SQL schemas',
                description: 'Generate production-ready tables and parameterized insertions for MySQL, PostgreSQL, and SQLite.'
              },
              {
                icon: <FileText className="h-6 w-6 text-primary" />,
                title: 'Custom Inferred Exports',
                description: 'Filter columns, rename fields, choose primary keys, and export to CSV, XML, and complex JSON formats.'
              },
            ].map((item, idx) => (
              <Card key={idx} className="rounded-[2rem] border border-border/40 bg-card/40 p-6 flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 h-12 w-12 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* ─── WORKSPACE VIEW (File Loaded) ─── */
        <div className="space-y-6">
          {/* WORKSPACE TOP CONTROL BAR */}
          <Card className="rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* File details */}
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-400 shrink-0 border border-emerald-500/15">
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black tracking-tight max-w-[250px] sm:max-w-[400px] truncate">
                        {fileName}
                      </h2>
                      <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                        {formatBytes(fileSize)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>Sheet: <b>{currentSheet}</b></span>
                      <span>•</span>
                      <span>Total Rows: <b>{rawRows.length}</b></span>
                    </p>
                  </div>
                </div>

                {/* Configuration Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Sheet Selector (only if multiple sheets) */}
                  {sheets.length > 1 && (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Select Sheet</Label>
                      <select
                        value={currentSheet || ''}
                        onChange={(e) => setSheet(e.target.value)}
                        className="h-10 w-44 rounded-xl border border-border/40 bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {sheets.map((sheet) => (
                          <option key={sheet} value={sheet}>
                            {sheet}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Table Name */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">SQL Table Name</Label>
                    <Input
                      type="text"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      placeholder="sql_table_name"
                      className="h-10 w-48 rounded-xl border border-border/40 bg-background/50 focus-visible:ring-primary/30"
                    />
                  </div>

                                {/* Dialect Picker */}
           <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Database Dialect</Label>
                <div className="inline-flex bg-background/50 border border-border/40 rounded-xl p-1 gap-1">
                  {[
                    { value: 'mysql', label: 'MySQL', icon: Database },
                    { value: 'postgres', label: 'PostgreSQL', icon: FileJson },
                    { value: 'sqlite', label: 'SQLite', icon: TableIcon },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setDbDialect(value as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        dbDialect === value
                          ? 'bg-card text-foreground border border-border/40'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

                  {/* Clear / Reset button */}
                  <div className="flex flex-col justify-end h-[62px]">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      title="Clear Spreadsheet"
                      onClick={reset}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TWO PANEL WORKSPACE */}
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* LEFT PANEL: Column mapping configuration */}
            <Card className="rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-md h-fit max-h-[800px] overflow-hidden flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-bold">Columns Configuration</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Map schemas, toggle columns or override types.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 overflow-y-auto flex-1 px-6 pb-6">
                {/* Search columns */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search columns..."
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    className="h-9 pl-9 rounded-lg border-border/40 bg-background/40"
                  />
                  {columnSearch && (
                    <button
                      onClick={() => setColumnSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="divide-y divide-border/20 max-h-[500px] overflow-y-auto pr-1 space-y-3 pt-2">
                  {filteredColumns.map((col) => {
                    const isExcluded = !!columnExclusions[col]
                    const inferredType = inferredTypes[col] || 'VARCHAR(255)'
                    const customType = customTypes[col] || ''
                    const isPK = primaryKey === col

                    return (
                      <div key={col} className={`py-3 space-y-2 first:pt-0 ${isExcluded ? 'opacity-40' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          {/* Toggle Exclude */}
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              id={`exclude-${col}`}
                              checked={!isExcluded}
                              onChange={() => toggleColumnExclusion(col)}
                              className="rounded border-border/60 text-primary focus:ring-primary/30 h-4 w-4 shrink-0"
                            />
                            <Label
                              htmlFor={`exclude-${col}`}
                              className="text-sm font-semibold truncate cursor-pointer select-none"
                              title={col}
                            >
                              {col}
                            </Label>
                          </div>

                          {/* Primary key identifier */}
                          {!isExcluded && (
                            <button
                              onClick={() => setPrimaryKey(isPK ? null : col)}
                              className={`p-1 rounded-lg text-xs font-semibold border transition-all ${
                                isPK
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                  : 'border-border/30 hover:border-border/60 text-muted-foreground'
                              }`}
                              title={isPK ? 'Active Primary Key' : 'Set as Primary Key'}
                            >
                              PK
                            </button>
                          )}
                        </div>

                        {/* Column DataType override select */}
                        {!isExcluded && (
                          <div className="flex items-center gap-2 pl-6">
                            <span className="text-[10px] text-muted-foreground shrink-0">Type:</span>
                            <select
                              value={customType || inferredType}
                              onChange={(e) => setColumnType(col, e.target.value)}
                              className="h-8 w-full rounded-lg border border-border/40 bg-background/50 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                            >
                              <optgroup label="Inferred Value">
                                <option value={inferredType}>
                                  {inferredType} (Auto)
                                </option>
                              </optgroup>
                              <optgroup label="Custom Override">
                                {sqlTypesList
                                  .filter((type) => type !== inferredType)
                                  .map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                              </optgroup>
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {filteredColumns.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No columns found matching search query.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RIGHT PANEL: Workspace Grid and Export Output Tabs */}
            <div className="space-y-6">
              {/* Tab Navigation buttons */}
              <div className="flex border-b border-border/40 gap-2 overflow-x-auto pb-px">
                {[
                  { id: 'preview', label: 'Spreadsheet Grid', icon: <TableIcon className="h-4 w-4" /> },
                  { id: 'sql', label: 'SQL Schema', icon: <Database className="h-4 w-4" /> },
                  { id: 'json', label: 'JSON Model', icon: <FileCode className="h-4 w-4" /> },
                  { id: 'csv', label: 'CSV File', icon: <FileText className="h-4 w-4" /> },
                  { id: 'xml', label: 'XML File', icon: <Code className="h-4 w-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap
                      ${
                        activeTab === tab.id
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ─── TAB CONTENT: Preview Grid ─── */}
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  {/* Grid Controls (Search, pagination count) */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search spreadsheet data..."
                        value={rowSearch}
                        onChange={(e) => setRowSearch(e.target.value)}
                        className="h-10 pl-9 rounded-xl border-border/40 bg-card/40"
                      />
                      {rowSearch && (
                        <button
                          onClick={() => setRowSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">Rows per page:</span>
                      <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="h-9 rounded-lg border border-border/40 bg-card px-2 text-xs text-foreground focus:outline-none"
                      >
                        {[10, 25, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-muted-foreground font-medium">
                        Showing {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0} to{' '}
                        {Math.min(
                          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                          table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length} rows
                      </span>
                    </div>
                  </div>

                  {/* Spreadsheet Grid Table */}
                  <div className="overflow-x-auto rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur shadow-2xl max-h-[600px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="sticky top-0 bg-background/95 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider backdrop-blur-md z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                colSpan={header.colSpan}
                                className="p-4 font-semibold select-none border-r border-border/20 cursor-pointer hover:bg-muted/30 hover:text-foreground transition-colors"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <div className="flex items-center gap-1.5">
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                  {{
                                    asc: ' 🔼',
                                    desc: ' 🔽',
                                  }[header.column.getIsSorted() as string] ?? null}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>

                      <tbody className="divide-y divide-border/20">
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="hover:bg-muted/15 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="p-4 border-r border-border/10 truncate max-w-[220px]">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}

                        {table.getRowModel().rows.length === 0 && (
                          <tr>
                            <td
                              colSpan={tableColumns.length || 1}
                              className="p-12 text-center text-sm text-muted-foreground italic font-light bg-muted/5"
                            >
                              No matching rows of spreadsheet data found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* TanStack Table Pagination */}
                  {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                          className="h-9 w-9 rounded-lg"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="h-9 w-9 rounded-lg"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>

                      <span className="text-xs font-semibold text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="h-9 w-9 rounded-lg"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                          className="h-9 w-9 rounded-lg"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB CONTENT: CODE EXPORTS (SQL/JSON/CSV/XML) ─── */}
              {activeTab !== 'preview' && (
                <div className="space-y-4 anim-fade">
                  {/* Export Options Customizers based on tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border/40 bg-card/20">
                    <div className="flex items-center gap-4">
                      {/* JSON Tab Options */}
                      {activeTab === 'json' && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-muted-foreground">Format:</span>
                          <select
                            value={jsonFormat}
                            onChange={(e) => setJsonFormat(e.target.value as any)}
                            className="h-9 rounded-xl border border-border/40 bg-background px-3 text-xs text-foreground focus:outline-none"
                          >
                            <option value="object-array">Array of Objects</option>
                            <option value="array-array">Array of Arrays (Table grid)</option>
                            <option value="keyed-object">Keyed Object (by Primary Key)</option>
                          </select>
                        </div>
                      )}

                      {/* XML Tab Options */}
                      {activeTab === 'xml' && (
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">Root Tag:</span>
                            <Input
                              type="text"
                              value={xmlRootElement}
                              onChange={(e) => setXmlRootElement(e.target.value)}
                              className="h-8 w-28 rounded-lg bg-background text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">Row Tag:</span>
                            <Input
                              type="text"
                              value={xmlRowElement}
                              onChange={(e) => setXmlRowElement(e.target.value)}
                              className="h-8 w-28 rounded-lg bg-background text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* SQL / CSV have generic header info */}
                      {activeTab === 'sql' && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span>Includes <code>DROP TABLE IF EXISTS</code> and batched multi-row <code>INSERT INTO</code> scripts.</span>
                        </div>
                      )}
                      {activeTab === 'csv' && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span>CSV data generated with comma delimiters and double quotes escaping.</span>
                        </div>
                      )}
                    </div>

                    {/* Copy and Download Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="h-9 px-4 rounded-xl text-xs gap-1.5"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied!' : 'Copy Schema'}
                      </Button>
                      <Button
                        onClick={handleDownload}
                        className="h-9 px-4 rounded-xl text-xs gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download File
                      </Button>
                    </div>
                  </div>

                  {/* Code Editor Code-block Area */}
                  <div className="relative rounded-[2rem] border border-border/40 bg-zinc-950 p-6 overflow-hidden shadow-2xl">
                    <pre className="font-mono text-xs text-zinc-300 overflow-auto max-h-[600px] whitespace-pre-wrap leading-relaxed select-all">
                      {activeCodeContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
