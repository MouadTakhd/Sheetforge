// src/routes/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Sheetforge | Mouad Workspace' },
      { name: 'description', content: 'Convert and manage Excel files easily.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),

  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')

    if (!token) {
      throw redirect({
        to: '/auth',
      })
    }

    throw redirect({
      to: '/home',
    })
  },

  component: () => null,
})