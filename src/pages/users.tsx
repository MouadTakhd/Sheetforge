import { useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { Button } from '../components/Button'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'
import { Plus, Trash2, Moon, Sun } from 'lucide-react'
import User from '../interfaces'



const columnHelper = createColumnHelper<User>()

const defaultColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: info => <span className="capitalize">{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <button onClick={() => console.log('Delete', row.original.id)} className="text-red-500 hover:text-red-700">
        <Trash2 size={16} />
      </button>
    ),
  }),
]

function App() {
  const { theme, setTheme } = useAppStore()
  const [data] = useState<User[]>([
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
    { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'user' },
  ])

  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg hover:bg-accent">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <Button variant="default" size="default">
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
            <Button variant="outline">Export</Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="text-left p-4 font-semibold">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-t hover:bg-muted/50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
