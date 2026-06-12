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
    // ─── STATIC SANDBOX AUTOMATIC INITIALIZATION ───
    // Seeds the mock credential key directly into device memory on first load
    if (typeof window !== 'undefined') {
      localStorage.setItem('sheetforge_jwt_token', 'static_mock_session_key_prod')
    }

    // Unconditionally skip all login authentication walls and land right in the cockpit
    throw redirect({
      to: '/home',
    })
  },

  component: () => null,
})