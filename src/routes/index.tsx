import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Sheetforge | Mouad Workspace' },
      { name: 'description', content: 'Convert and manage Excel files easily.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),

  // 1. Intercept the navigation BEFORE the component loads
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      // 2. Safely redirect to your auth route
      throw redirect({
        to: '/auth',
      })
    }

    // 3. If they have a token, push them into the main app
    throw redirect({
      to: '/home',
    })
  },

  // 4. Since the loader guarantees a redirect, this component never actually mounts!
  component: () => null,
})