import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as XLSX from 'xlsx'
import { DbDialect, inferSqlTypes, sanitizeIdentifier } from '@/utils/sqlGenerator'

interface ConverterState {
  // File details
  file: File | null
  fileName: string | null
  fileSize: number | null
  
  // Workbook details
  sheets: string[]
  currentSheet: string | null
  
  // Grid/Sheet data
  columns: string[]
  rawRows: any[] // array of objects (colName -> value)
  
  // SQL schema & exclusions configuration
  tableName: string
  dbDialect: DbDialect
  inferredTypes: Record<string, string>
  customTypes: Record<string, string>
  columnExclusions: Record<string, boolean>
  primaryKey: string | null
  
  // XML/JSON export formats configuration
  jsonFormat: 'object-array' | 'array-array' | 'keyed-object'
  
  // Process States
  isLoading: boolean
  error: string | null
  
  // Actions
  setFile: (file: File | null) => void
  setSheet: (sheetName: string) => void
  setDbDialect: (dialect: DbDialect) => void
  setTableName: (name: string) => void
  toggleColumnExclusion: (col: string) => void
  setColumnType: (col: string, type: string) => void
  setPrimaryKey: (col: string | null) => void
  setJsonFormat: (format: 'object-array' | 'array-array' | 'keyed-object') => void
  reset: () => void
  parseFile: (file: File) => Promise<void>
}

let workbookInstance: XLSX.WorkBook | null = null

export const useConverterStore = create<ConverterState>()(
  devtools(
    (set, get) => ({
      file: null,
      fileName: null,
      fileSize: null,
      sheets: [],
      currentSheet: null,
      columns: [],
      rawRows: [],
      tableName: '',
      dbDialect: 'mysql',
      inferredTypes: {},
      customTypes: {},
      columnExclusions: {},
      primaryKey: null,
      jsonFormat: 'object-array',
      isLoading: false,
      error: null,

      setFile: (file) => {
        if (!file) {
          get().reset()
          return
        }
        set({
          file,
          fileName: file.name,
          fileSize: file.size,
          tableName: sanitizeIdentifier(file.name.substring(0, file.name.lastIndexOf('.')) || file.name),
        })
      },

      setSheet: (sheetName) => {
        if (!workbookInstance) return

        set({ isLoading: true, error: null })

        try {
          const worksheet = workbookInstance.Sheets[sheetName]
          if (!worksheet) {
            throw new Error(`Sheet "${sheetName}" not found in workbook.`)
          }

          // Parse with header: 1 to preserve actual array grid structure
          const dataGrid = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          
          if (dataGrid.length === 0) {
            set({
              currentSheet: sheetName,
              columns: [],
              rawRows: [],
              inferredTypes: {},
              customTypes: {},
              columnExclusions: {},
              primaryKey: null,
              isLoading: false,
            })
            return
          }

          // Ingest headers and ensure unique, non-empty names
          const rawHeaders = dataGrid[0] || []
          const columns: string[] = []
          const headerCounts: Record<string, number> = {}

          rawHeaders.forEach((header, index) => {
            let colName = header !== undefined && header !== null ? String(header).trim() : `column_${index + 1}`
            if (colName === '') {
              colName = `column_${index + 1}`
            }

            if (headerCounts[colName] !== undefined) {
              headerCounts[colName]++
              colName = `${colName}_${headerCounts[colName]}`
            } else {
              headerCounts[colName] = 0
            }

            columns.push(colName)
          });

          // Convert rows to key-value objects mapped to columns
          const rawRows = dataGrid.slice(1).map((rowGrid) => {
            const rowObj: Record<string, any> = {}
            columns.forEach((col, colIndex) => {
              const val = rowGrid[colIndex]
              rowObj[col] = val !== undefined ? val : null
            })
            return rowObj
          })

          // Filter out completely empty rows (optional, but professional)
          const filteredRows = rawRows.filter((row) =>
            Object.values(row).some((val) => val !== null && val !== '')
          )

          // Infer types for the columns
          const inferred = inferSqlTypes(filteredRows, columns, get().dbDialect)

          set({
            currentSheet: sheetName,
            columns,
            rawRows: filteredRows,
            inferredTypes: inferred,
            customTypes: {}, // Reset overrides
            columnExclusions: {}, // Reset exclusions
            primaryKey: columns.length > 0 ? columns[0] : null, // Default PK to first column
            isLoading: false,
          })
        } catch (err: any) {
          set({
            error: err.message || 'Failed to switch sheets.',
            isLoading: false,
          })
        }
      },

      setDbDialect: (dbDialect) => {
        set({ dbDialect })
        // Re-infer SQL types based on the new dialect
        const { rawRows, columns } = get()
        if (rawRows.length > 0) {
          const inferred = inferSqlTypes(rawRows, columns, dbDialect)
          set({ inferredTypes: inferred })
        }
      },

      setTableName: (tableName) => set({ tableName: sanitizeIdentifier(tableName) }),

      toggleColumnExclusion: (col) => {
        const exclusions = { ...get().columnExclusions }
        exclusions[col] = !exclusions[col]
        set({ columnExclusions: exclusions })
      },

      setColumnType: (col, type) => {
        const custom = { ...get().customTypes }
        custom[col] = type
        set({ customTypes: custom })
      },

      setPrimaryKey: (primaryKey) => set({ primaryKey }),

      setJsonFormat: (jsonFormat) => set({ jsonFormat }),

      reset: () => {
        workbookInstance = null
        set({
          file: null,
          fileName: null,
          fileSize: null,
          sheets: [],
          currentSheet: null,
          columns: [],
          rawRows: [],
          tableName: '',
          dbDialect: 'mysql',
          inferredTypes: {},
          customTypes: {},
          columnExclusions: {},
          primaryKey: null,
          jsonFormat: 'object-array',
          isLoading: false,
          error: null,
        })
      },

      parseFile: async (file) => {
        set({ isLoading: true, error: null })

        try {
          const buffer = await file.arrayBuffer()
          const workbook = XLSX.read(buffer, {
            type: 'array',
            cellDates: true, // Auto parse date cells
            cellText: false,
            cellNF: false, // Turn off number format strings for faster loads
          })

          workbookInstance = workbook

          if (workbook.SheetNames.length === 0) {
            throw new Error('This spreadsheet has no sheets.')
          }

          set({
            sheets: workbook.SheetNames,
            file,
            fileName: file.name,
            fileSize: file.size,
            tableName: sanitizeIdentifier(file.name.substring(0, file.name.lastIndexOf('.')) || file.name),
          })

          // Ingest the first sheet automatically
          get().setSheet(workbook.SheetNames[0])
        } catch (err: any) {
          set({
            error: err.message || 'Could not parse spreadsheet. Make sure it is a valid XLSX, XLS, or CSV file.',
            isLoading: false,
          })
        }
      },
    })
  )
)
