import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/docs')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: DocsPage,
})

function DocsPage() {
  return (
    <main className="space-y-8 text-foreground">
      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-8">
        <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Documentation</Badge>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">Your product docs and onboarding guide</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Find quick links to help, integration notes, and best practices for building with your conversion platform.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Getting started</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            Learn how to upload files, configure exports, and run your first conversion.
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">API & format guide</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            Explore schema output options and supported file types for every workflow.
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Security</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            Understand authentication, session handling, and safe data export.
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
