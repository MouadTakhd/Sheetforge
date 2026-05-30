import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/core/router-guide')({
  head: () => ({
    meta: [
      {
        title: 'TanStack Router Guide | Mouad Developer System',
      },
      {
        name: 'description',
        content:
          'Learn how to structure routes using TanStack Router file-based routing system, including best practices, naming conventions, and debugging tips.',
      },
      {
        name: 'keywords',
        content:
          'TanStack Router, Routing Guide, React Router Alternative, File-based Routing, TypeScript Routing, Frontend Architecture',
      },
      {
        property: 'og:title',
        content: 'Routing Guide - TanStack Router System',
      },
      {
        property: 'og:description',
        content:
          'Complete guide to file-based routing, route structure, and debugging in a modern React architecture.',
      },
      {
        property: 'og:type',
        content: 'article',
      },
    ],

    links: [
      {
        rel: 'canonical',
        href: 'https://your-domain.com/core/router-guide',
      },
    ],
  }),

  component: RouteGuide,
})

function RouteGuide() {
  return (
    <main className="space-y-10 pb-10 text-foreground">
      {/* HERO */}
      <section
        aria-label="Routing guide introduction"
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-8 md:p-10 bg-background/95"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_40%)]" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-6 bg-primary" />
            Router Architecture
          </div>

          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Routing Guide
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Complete guide to structuring, adding, and debugging routes using
              TanStack Router file-based routing system in this architecture.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300">
              File-based Routing
            </Badge>

            <Badge className="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-300">
              Type-Safe
            </Badge>

            <Badge className="border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-300">
              TanStack Router
            </Badge>
          </div>
        </div>
      </section>

      <Separator />

      {/* HOW ROUTING WORKS */}
      <Section title="How Routing Works" accent="blue">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoItem
            color="blue"
            title="File-based routing"
            desc="Powered by TanStack Router"
          />

          <InfoItem
            color="purple"
            title="Auto-generated routes"
            desc="Each file becomes a route"
          />

          <InfoItem
            color="pink"
            title="routeTree generation"
            desc="Generated from your file structure"
          />

          <InfoItem
            color="blue"
            title="Layout sharing"
            desc="Using __root.tsx and nested layouts"
          />

          <InfoItem
            color="purple"
            title="Type-safe navigation"
            desc="Strong TypeScript integration"
          />

          <InfoItem
            color="pink"
            title="Dynamic parameters"
            desc="Safe route params with $id syntax"
          />
        </div>
      </Section>

      {/* HOW TO ADD ROUTE */}
      <Section title="How to Add a New Route" accent="purple">
        <div className="space-y-2">
          <Step
            number={1}
            text="Create a new file inside src/routes/app/"
            color="blue"
          />

          <Step
            number={2}
            text="Use naming pattern: my-page.route.tsx"
            color="purple"
          />

          <Step
            number={3}
            text="Define route with createFileRoute('/app/my-page')"
            color="pink"
          />

          <Step
            number={4}
            text="Export a React component inside the file"
            color="blue"
          />

          <Step
            number={5}
            text="Restart the dev server if the route is not detected"
            color="purple"
          />
        </div>
      </Section>

      {/* EXAMPLE */}
      <Section title="Example Route Implementation" accent="pink">
        <pre className="overflow-auto rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-6 text-emerald-600 dark:text-emerald-400">
{`// src/routes/app/analytics.route.tsx

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/analytics')({
  component: Analytics,
})

function Analytics() {
  return <div>Analytics Page</div>
}`}
        </pre>
      </Section>

      {/* RULES */}
      <Section title="Routing Rules & Conventions" accent="blue">
        <div className="grid gap-4">
          <Rule
            bad="/app/"
            good="/app"
            reason="Trailing slash can cause route mismatch"
          />

          <Rule
            bad="/core/__app"
            good="/core or /app"
            reason="__app is a layout route, not a public path"
          />

          <Rule
            bad=":id"
            good="$id"
            reason="TanStack Router uses $ for params"
          />

          <Rule
            bad="a href"
            good="Link to=''"
            reason="Use Link component for SPA navigation"
          />
        </div>
      </Section>

      {/* DEBUG */}
      <Section title="Debug Checklist" accent="purple">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Checklist
            items={[
              'routeTree.gen.ts is regenerated',
              'Vite dev server restarted',
              'Route file name matches path exactly',
            ]}
          />

          <Checklist
            items={[
              'No invalid layout route in URL',
              'Link uses the correct "to" path',
              'No duplicated route paths',
            ]}
          />
        </div>
      </Section>
    </main>
  )
}

/* -----------------------------
   UI Components
------------------------------*/

interface SectionProps {
  title: string
  children: React.ReactNode
  accent?: 'blue' | 'purple' | 'pink'
}

interface StepProps {
  number: number
  text: string
  color?: 'blue' | 'purple' | 'pink'
}

interface RuleProps {
  bad: string
  good: string
  reason: string
}

interface InfoItemProps {
  title: string
  desc: string
  color?: 'blue' | 'purple' | 'pink'
}

function Section({
  title,
  children,
  accent = 'blue',
}: SectionProps) {
  const accentMap = {
    blue:
      'text-blue-600 dark:text-blue-300 border-blue-500/20 bg-blue-500/10',

    purple:
      'text-purple-600 dark:text-purple-300 border-purple-500/20 bg-purple-500/10',

    pink:
      'text-pink-600 dark:text-pink-300 border-pink-500/20 bg-pink-500/10',
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border/60 bg-card/70 bg-background/95 transition-colors duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] ${accentMap[accent]}`}
          >
            Section
          </div>

          <Separator className="flex-1" />
        </div>

        <CardTitle
          className={`text-2xl font-bold ${accentMap[accent].split(' ')[0]}`}
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  )
}

function InfoItem({
  title,
  desc,
  color = 'blue',
}: InfoItemProps) {
  const colorMap = {
    blue: 'text-blue-500 dark:text-blue-300',
    purple: 'text-purple-500 dark:text-purple-300',
    pink: 'text-pink-500 dark:text-pink-300',
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-4 transition-colors hover:-translate-y-1 hover:border-primary/20 hover:bg-muted/30">
      <span
        className={`text-xl font-black ${colorMap[color]}`}
      >
        ✔
      </span>

      <div>
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        <p className="text-xs text-muted-foreground">
          {desc}
        </p>
      </div>
    </div>
  )
}

function Step({
  number,
  text,
  color = 'blue',
}: StepProps) {
  const colorMap = {
    blue:
      'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300',

    purple:
      'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-300',

    pink:
      'border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-300',
  }

  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card/50 p-4 transition-colors hover:-translate-y-1 hover:border-primary/20 hover:bg-muted/40">
      <Badge
        className={`min-w-8 justify-center rounded-full border font-bold ${colorMap[color]}`}
      >
        {number}
      </Badge>

      <p className="pt-0.5 text-sm text-foreground transition-transform group-hover:translate-x-1">
        {text}
      </p>
    </div>
  )
}

function Rule({
  bad,
  good,
  reason,
}: RuleProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 transition-colors duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-muted/40">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg text-red-500">
            ❌
          </span>

          <p className="font-mono text-sm text-red-500">
            {bad}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg text-emerald-500">
            ✅
          </span>

          <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
            {good}
          </p>
        </div>

        <p className="pl-7 text-xs leading-6 text-muted-foreground">
          💡 {reason}
        </p>
      </div>
    </div>
  )
}

function Checklist({
  items,
}: {
  items: string[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3"
          >
            <span className="text-sm font-bold text-emerald-500">
              ✓
            </span>

            <span className="text-sm text-muted-foreground">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}