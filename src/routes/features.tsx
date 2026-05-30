import { createFileRoute, redirect } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'

export const Route = createFileRoute('/features')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: FeaturesPage,
})

function FeaturesPage() {
  return (
    <main className="space-y-8 text-foreground">
      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-8">
        <div className="space-y-4">
          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Platform Features</Badge>
          <h1 className="text-3xl font-black sm:text-4xl">Everything you need to manage your conversion workflow</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Build reliable pipelines with file validation, automated extraction, and customizable output formats.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Smart extraction</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            Convert tables, invoices, and reports using intelligent parsing rules.
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Secure storage</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            Keep your data safe with permission controls and encrypted exports.
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Fast automation</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            Automate repetitive file workflows and speed up repeat conversions.
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
