import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { User, Mail, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/about')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: AboutPage,
})

function AboutPage() {
  return (
    <main className="space-y-8 text-foreground">
      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-3xl bg-primary/10 text-primary" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Profile</p>
              <h1 className="text-3xl font-black sm:text-4xl">Workspace overview</h1>
            </div>
          </div>

          <Button size="lg">Edit profile</Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Account</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            <User className="mb-3 h-5 w-5 text-primary" />
            Signed in as <strong>mouad@workspace.com</strong>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Contact</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            <Mail className="mb-3 h-5 w-5 text-primary" />
            Update your email settings or review login preferences.
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border bg-card/70 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold">Security</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 p-0 text-sm leading-7 text-muted-foreground">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            Two-factor authentication and session controls.
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
