import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/core/system-design')({
  head: () => ({
    meta: [
      { title: 'System Design Overview | Mouad Developer System' },
      {
        name: 'description',
        content:
          'High-level architecture of the frontend system — technology stack, data flow patterns, and core architectural layers with interactive exploration.',
      },
    ],
  }),
  component: SystemDesign,
})

type LayerKey =
  | 'ui'
  | 'routing'
  | 'state'
  | 'app'

interface LayerData {
  title: string
  description: string
  tech: string
  items: string[]
  gradient: string
  border: string
  badge: string
}

const LAYERS: Record<LayerKey, LayerData> = {
  ui: {
    title: 'UI Layer',
    description:
      'Reusable primitives built with shadcn/ui and TailwindCSS.',
    tech: 'shadcn/ui + Tailwind',
    items: [
      'Button',
      'Card',
      'Input',
      'Badge',
      'Dialog',
      'Separator',
    ],
    gradient:
      'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20',
    border:
      'border-blue-500/20 hover:border-blue-500/40',
    badge:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-300',
  },

  routing: {
    title: 'Routing Layer',
    description:
      'Type-safe file-based routing powered by TanStack Router.',
    tech: 'TanStack Router',
    items: [
      'routeTree.gen.ts',
      'Nested layouts',
      'Route loaders',
      'Typed params',
    ],
    gradient:
      'from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20',
    border:
      'border-purple-500/20 hover:border-purple-500/40',
    badge:
      'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-300',
  },

  state: {
    title: 'State Layer',
    description:
      'Global client state powered by Zustand stores.',
    tech: 'Zustand',
    items: [
      'Stores',
      'Actions',
      'Selectors',
      'Persist middleware',
    ],
    gradient:
      'from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20',
    border:
      'border-pink-500/20 hover:border-pink-500/40',
    badge:
      'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-300',
  },

  app: {
    title: 'App Layer',
    description:
      'Feature pages composed from routing, UI and state.',
    tech: 'React Pages',
    items: [
      'UI Playground',
      'System Design',
      'Project Guide',
      'Debug Center',
    ],
    gradient:
      'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
    border:
      'border-emerald-500/20 hover:border-emerald-500/40',
    badge:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300',
  },
}

const FLOW_STEPS = [
  {
    label: 'User interaction',
    detail: 'Click, input or navigation event',
    color: 'text-blue-600 dark:text-blue-300',
    dot: 'bg-blue-500',
  },

  {
    label: 'Component logic',
    detail: 'Handlers or actions execute',
    color:
      'text-purple-600 dark:text-purple-300',
    dot: 'bg-purple-500',
  },

  {
    label: 'Router updates',
    detail: 'Route state and params update',
    color: 'text-pink-600 dark:text-pink-300',
    dot: 'bg-pink-500',
  },

  {
    label: 'API / Loader',
    detail: 'Data fetching occurs',
    color:
      'text-emerald-600 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },

  {
    label: 'Store updates',
    detail: 'Global or local state changes',
    color:
      'text-orange-600 dark:text-orange-300',
    dot: 'bg-orange-500',
  },

  {
    label: 'UI re-render',
    detail: 'React updates the DOM',
    color: 'text-cyan-600 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
]

const TECH_STACK = [
  {
    name: 'React',
    version: '19',
    color:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-300',
  },

  {
    name: 'TypeScript',
    version: '5.x',
    color:
      'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-300',
  },

  {
    name: 'Vite',
    version: '6.x',
    color:
      'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-300',
  },

  {
    name: 'TanStack Router',
    version: '1.x',
    color:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300',
  },

  {
    name: 'Zustand',
    version: '5.x',
    color:
      'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-300',
  },

  {
    name: 'TailwindCSS',
    version: '4.x',
    color:
      'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-300',
  },
]

function SystemDesign() {
  const [activeLayer, setActiveLayer] =
    useState<LayerKey | null>(null)

  const [activeStep, setActiveStep] =
    useState<number | null>(null)

  const [expandedFeatures, setExpandedFeatures] =
    useState<Record<string, boolean>>({})

  const toggleFeature = (key: string) =>
    setExpandedFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))

  return (
    <article className="mx-auto w-full max-w-7xl space-y-10 px-4 pb-20 pt-2 sm:px-6 lg:px-8 font-mono text-foreground">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-6 sm:p-8 lg:p-12 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.2),transparent_45%)]" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-primary">
            <span className="h-px w-6 bg-primary" />
            Architecture Docs
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none">
            System
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Design
            </span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Interactive frontend architecture overview.
            Explore system layers, routing flow,
            state management and data lifecycle.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              Frontend
            </Badge>

            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              Type-Safe
            </Badge>

            <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300">
              Scalable
            </Badge>
          </div>
        </div>
      </header>

      <Separator />

      {/* TECH STACK */}
      <PlaySection
        tag="01"
        title="Tech Stack"
      >
        <div className="flex flex-wrap gap-3">
          {TECH_STACK.map(
            ({ name, version, color }) => (
              <div
                key={name}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs sm:text-sm font-medium transition-colors hover:-translate-y-1 hover:shadow-lg ${color}`}
              >
                <span>{name}</span>

                <span className="opacity-60">
                  {version}
                </span>
              </div>
            )
          )}
        </div>
      </PlaySection>

      {/* LAYERS */}
      <PlaySection
        tag="02"
        title="Architecture Layers"
      >
        <p className="mb-5 text-xs sm:text-sm text-muted-foreground">
          Click a layer to inspect it.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(
            Object.entries(LAYERS) as [
              LayerKey,
              LayerData,
            ][]
          ).map(([key, layer]) => (
            <button
              key={key}
              onClick={() =>
                setActiveLayer(
                  activeLayer === key
                    ? null
                    : key
                )
              }
              className={`group rounded-3xl border bg-gradient-to-br ${layer.gradient} p-5 sm:p-6 text-left transition-colors duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur ${
                layer.border
              } ${
                activeLayer === key
                  ? 'scale-[1.02]'
                  : ''
              }`}
            >
              <div
                className={`mb-4 inline-flex rounded-xl border px-3 py-1 text-xs font-semibold ${layer.badge}`}
              >
                {layer.title}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {layer.tech}
              </p>

              <ul className="mt-5 space-y-2">
                {layer.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />

                    {item}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {activeLayer && (
          <div
            className={`mt-6 rounded-3xl border bg-card/80 backdrop-blur p-5 sm:p-7 ${LAYERS[activeLayer].border}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="mb-2 text-xl font-bold">
                  {
                    LAYERS[activeLayer]
                      .title
                  }
                </h3>

                <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {
                    LAYERS[activeLayer]
                      .description
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setActiveLayer(null)
                }
                className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </PlaySection>

      {/* FLOW */}
      <PlaySection
        tag="03"
        title="Request / Data Flow"
      >
        <div className="space-y-3">
          {FLOW_STEPS.map((step, i) => (
            <div
              key={i}
              onMouseEnter={() =>
                setActiveStep(i)
              }
              onMouseLeave={() =>
                setActiveStep(null)
              }
              className={`rounded-2xl border p-4 sm:p-5 transition-colors duration-300 ${
                activeStep === i
                  ? 'border-primary/30 bg-primary/5 scale-[1.01] shadow-lg'
                  : 'border-border hover:border-primary/20 hover:bg-muted/30'
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow ${step.dot}`}
                >
                  {i + 1}
                </div>

                <div>
                  <p
                    className={`text-sm sm:text-base font-semibold ${step.color}`}
                  >
                    {step.label}
                  </p>

                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PlaySection>

      {/* FEATURES */}
      <PlaySection
        tag="04"
        title="TanStack Router System"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title:
                'File-based routing',
              detail:
                'Routes auto-generated from src/routes/',
              key: 'file',
            },

            {
              title:
                'Type-safe navigation',
              detail:
                'Typed params and loaders',
              key: 'types',
            },

            {
              title: 'Nested layouts',
              detail:
                '_app.tsx handles route wrapping',
              key: 'layout',
            },

            {
              title:
                'Parallel loaders',
              detail:
                'Built-in async data loading',
              key: 'loaders',
            },
          ].map(
            ({ title, detail, key }) => (
              <button
                key={key}
                onClick={() =>
                  toggleFeature(key)
                }
                className="rounded-2xl border border-border bg-card/60 p-5 text-left transition-colors hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
              >
                <p className="text-sm sm:text-base font-semibold">
                  {title}
                </p>

                <div
                  className={`overflow-hidden transition-colors duration-300 ${
                    expandedFeatures[key]
                      ? 'mt-3 max-h-32 opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </button>
            )
          )}
        </div>
      </PlaySection>

      {/* PROJECT STRUCTURE */}
      <PlaySection
        tag="05"
        title="Project Structure"
      >
        <pre className="overflow-x-auto rounded-3xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 sm:p-7 text-xs sm:text-sm leading-7 text-emerald-600 dark:text-emerald-300">
{`src/
├── components/
│   └── ui/
├── routes/
│   ├── _app.tsx
│   └── core/
├── store/
├── lib/
└── styles/`}
        </pre>
      </PlaySection>
    </article>
  )
}

function PlaySection({
  tag,
  title,
  children,
}: {
  tag: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
          {tag}
        </span>

        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          {title}
        </h2>

        <Separator className="flex-1" />
      </div>

      <Card className="rounded-3xl border-border/60 bg-card/70 backdrop-blur">
        <CardContent className="p-5 sm:p-7">
          {children}
        </CardContent>
      </Card>
    </section>
  )
}