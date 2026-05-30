import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/core/ui-playground')({
  component: UIShowcase,
})

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'

type ButtonSize = 'sm' | 'default' | 'lg'

type StatusType = 'active' | 'warning' | 'error'

function UIShowcase() {
  const [btnVariant, setBtnVariant] =
    useState<ButtonVariant>('default')

  const [btnSize, setBtnSize] =
    useState<ButtonSize>('default')

  const [btnLabel, setBtnLabel] =
    useState('Click me')

  const [btnDisabled, setBtnDisabled] =
    useState(false)

  const [clickCount, setClickCount] =
    useState(0)

  const [badgeVariant, setBadgeVariant] =
    useState<BadgeVariant>('default')

  const [badgeLabel, setBadgeLabel] =
    useState('Label')

  const [selectedColor, setSelectedColor] =
    useState('blue')

  const statuses: {
    label: string
    status: StatusType
  }[] = [
    { label: 'API Connection', status: 'active' },
    { label: 'Router System', status: 'active' },
    { label: 'Theme Engine', status: 'active' },
    { label: 'State Store', status: 'warning' },
  ]

  return (
    <div className="space-y-12 pb-16 font-mono text-foreground">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-3xl border border-border glass p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_45%)]" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
            <span className="h-px w-6 bg-primary" />
            Design System
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            UI
            <span className="text-primary">_</span>
            Playground
          </h1>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Interactive design system playground built with
            shadcn/ui, Tailwind v4, TypeScript and semantic theme tokens.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              shadcn/ui
            </Badge>

            <Badge className="bg-secondary/15 text-secondary border-secondary/20">
              Tailwind v4
            </Badge>

            <Badge className="bg-accent/15 text-accent border-accent/20">
              TypeScript
            </Badge>
          </div>
        </div>
      </header>

      <Separator />

      {/* BUTTON LAB */}
      <PlaySection
        tag="01"
        title="Button Lab"
        description="Experiment with variants, states and sizing."
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <ControlGroup label="variant">
              {(
                [
                  'default',
                  'secondary',
                  'outline',
                  'ghost',
                  'destructive',
                ] as ButtonVariant[]
              ).map((v) => (
                <TogglePill
                  key={v}
                  active={btnVariant === v}
                  onClick={() => setBtnVariant(v)}
                >
                  {v}
                </TogglePill>
              ))}
            </ControlGroup>

            <ControlGroup label="size">
              {(
                ['sm', 'default', 'lg'] as ButtonSize[]
              ).map((s) => (
                <TogglePill
                  key={s}
                  active={btnSize === s}
                  onClick={() => setBtnSize(s)}
                >
                  {s}
                </TogglePill>
              ))}
            </ControlGroup>

            <ControlGroup label="label">
              <Input
                value={btnLabel}
                onChange={(e) =>
                  setBtnLabel(e.target.value)
                }
                className="max-w-[220px]"
              />
            </ControlGroup>

            <ControlGroup label="disabled">
              <TogglePill
                active={btnDisabled}
                onClick={() =>
                  setBtnDisabled((b) => !b)
                }
              >
                {btnDisabled ? 'true' : 'false'}
              </TogglePill>
            </ControlGroup>
          </div>

          <PreviewCard>
            <Button
              variant={btnVariant}
              size={btnSize}
              disabled={btnDisabled}
              onClick={() =>
                setClickCount((c) => c + 1)
              }
            >
              {btnLabel}
            </Button>

            <span className="text-xs text-muted-foreground">
              clicks:
              <span className="ml-1 text-primary">
                {clickCount}
              </span>
            </span>

            <CodeBlock>
{`<Button
  variant="${btnVariant}"
  size="${btnSize}"
>
  ${btnLabel}
</Button>`}
            </CodeBlock>
          </PreviewCard>
        </div>
      </PlaySection>

      {/* BADGE LAB */}
      <PlaySection
        tag="02"
        title="Badge Lab"
        description="Interactive badge styling playground."
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <ControlGroup label="variant">
              {(
                [
                  'default',
                  'secondary',
                  'outline',
                  'destructive',
                ] as BadgeVariant[]
              ).map((v) => (
                <TogglePill
                  key={v}
                  active={badgeVariant === v}
                  onClick={() => setBadgeVariant(v)}
                >
                  {v}
                </TogglePill>
              ))}
            </ControlGroup>

            <ControlGroup label="label">
              <Input
                value={badgeLabel}
                onChange={(e) =>
                  setBadgeLabel(e.target.value)
                }
                className="max-w-[220px]"
              />
            </ControlGroup>
          </div>

          <PreviewCard>
            <Badge variant={badgeVariant}>
              {badgeLabel}
            </Badge>

            <CodeBlock>
{`<Badge variant="${badgeVariant}">
  ${badgeLabel}
</Badge>`}
            </CodeBlock>
          </PreviewCard>
        </div>
      </PlaySection>

      {/* TYPOGRAPHY */}
      <PlaySection
        tag="03"
        title="Typography"
        description="System typography scale."
      >
        <div className="space-y-3">
          {[
            'text-5xl font-black',
            'text-4xl font-bold',
            'text-3xl font-semibold',
            'text-2xl font-semibold',
            'text-lg font-medium',
            'text-base',
            'text-sm text-muted-foreground',
          ].map((cls, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50"
            >
              <p className={cls}>
                Typography Preview
              </p>
            </div>
          ))}
        </div>
      </PlaySection>

      {/* CARDS */}
      <PlaySection
        tag="04"
        title="Card Variants"
        description="Reusable card surfaces."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:-translate-y-1 hover:shadow-xl transition-colors">
            <CardHeader>
              <CardTitle>Default</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Standard surface card.
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed hover:-translate-y-1 hover:shadow-xl transition-colors">
            <CardHeader>
              <CardTitle>Dashed</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Placeholder surface.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/40 hover:-translate-y-1 hover:shadow-xl transition-colors">
            <CardHeader>
              <CardTitle>Muted</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secondary emphasis card.
              </p>
            </CardContent>
          </Card>
        </div>
      </PlaySection>

      {/* STATUS */}
      <PlaySection
        tag="05"
        title="System Status"
        description="Live status indicators."
      >
        <div className="space-y-2">
          {statuses.map(({ label, status }) => (
            <StatusRow
              key={label}
              label={label}
              status={status}
            />
          ))}
        </div>
      </PlaySection>
    </div>
  )
}

function PlaySection({
  tag,
  title,
  description,
  children,
}: {
  tag: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
          {tag}
        </span>

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <Separator className="flex-1" />
      </div>

      <p className="text-sm text-muted-foreground">
        {description}
      </p>

      <Card className="glass rounded-3xl">
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </section>
  )
}

function PreviewCard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-muted/30 p-8">
      {children}
    </div>
  )
}

function CodeBlock({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <pre className="w-full overflow-x-auto rounded-xl border border-border bg-card p-4 text-[11px] text-emerald-500">
      {children}
    </pre>
  )
}

function ControlGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>

      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1 text-xs transition-colors ${
        active
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function StatusRow({
  label,
  status,
}: {
  label: string
  status: StatusType
}) {
  const styles = {
    active: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  }

  const dots = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/40">
      <span className="text-sm">
        {label}
      </span>

      <span
        className={`flex items-center gap-2 text-xs ${styles[status]}`}
      >
        <span
          className={`h-2 w-2 rounded-full animate-pulse ${dots[status]}`}
        />

        {status}
      </span>
    </div>
  )
}