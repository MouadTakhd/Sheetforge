import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/core/about')({
  head: () => ({
    meta: [
      {
        title:
          'About Mouad Takhdoukhi | Full Stack Software Engineer',
      },

      {
        name: 'description',
        content:
          'Learn more about Mouad Takhdoukhi, a full-stack software engineer specialized in React, TypeScript, scalable frontend architecture, backend systems, and modern web development.',
      },

      {
        name: 'keywords',
        content:
          'Mouad Takhdoukhi, Software Engineer, Full Stack Developer, React Developer, TypeScript, Laravel, Spring Boot, Frontend Architecture, Backend APIs',
      },

      {
        property: 'og:title',
        content: 'About Mouad Takhdoukhi',
      },

      {
        property: 'og:description',
        content:
          'Full-stack software engineer building scalable systems, modern frontend architecture, and backend APIs.',
      },

      {
        property: 'og:type',
        content: 'profile',
      },
    ],

    links: [
      {
        rel: 'canonical',
        href: 'https://your-domain.com/core/about',
      },
    ],
  }),

  component: AboutMe,
})

function AboutMe() {
  return (
    <main className="space-y-10 pb-10 text-foreground">
      {/* HERO */}
      <section
        aria-label="Software engineer introduction"
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-8 md:p-10 bg-background/95"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_40%)]" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-6 bg-primary" />
            Software Engineer
          </div>

          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Mouad Takhdoukhi
            </h1>

            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Full Stack Software Engineer
            </h2>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              I design and build scalable web
              applications, frontend architecture,
              backend APIs, and reusable developer
              systems using modern technologies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TechBadge
              color="blue"
              label="React"
            />

            <TechBadge
              color="purple"
              label="TypeScript"
            />

            <TechBadge
              color="pink"
              label="Symfony"
            />

            <TechBadge
              color="emerald"
              label="System Design"
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* PROFILE */}
      <Section
        title="Professional Overview"
        accent="blue"
      >
        <div className="space-y-5 text-sm leading-7 text-muted-foreground">
          <p>
            I am a full-stack software engineer
            focused on building scalable,
            maintainable, and high-performance
            applications using modern web
            technologies.
          </p>

          <p>
            My experience includes frontend
            engineering with React and TypeScript,
            backend application development, API
            architecture, developer tooling, and
            scalable UI systems.
          </p>

          <p>
            I enjoy designing modular systems with
            clean architecture, reusable
            components, and optimized developer
            experience workflows.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <TechBadge
              color="blue"
              label="React"
            />

            <TechBadge
              color="cyan"
              label="TypeScript"
            />

            <TechBadge
              color="purple"
              label="TanStack Router"
            />

            <TechBadge
              color="pink"
              label="Zustand"
            />

            <TechBadge
              color="red"
              label="Laravel"
            />

            <TechBadge
              color="emerald"
              label="Spring Boot"
            />
          </div>
        </div>
      </Section>

      {/* WHAT I DO */}
      <Section
        title="What I Do"
        accent="purple"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            'Full-stack web application development',
            'Scalable frontend architecture design',
            'REST API and backend engineering',
            'Component-driven UI systems',
            'Performance optimization',
            'Developer tooling & DX workflows',
          ].map((item) => (
            <div
              key={item}
              className="group rounded-2xl border border-border bg-card/50 p-4 transition-colors hover:-translate-y-1 hover:border-primary/20 hover:bg-muted/40"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 text-sm text-primary transition-transform group-hover:scale-125">
                  ✦
                </span>

                <p className="text-sm text-muted-foreground">
                  {item}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CURRENT FOCUS */}
      <Section
        title="Current Focus"
        accent="pink"
      >
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Currently building a modular
            developer dashboard ecosystem using
            React, TanStack Router, Zustand, and
            shadcn/ui with a strong emphasis on
            scalability, maintainability, and
            developer experience.
          </p>

          <p>
            Exploring advanced frontend
            architecture patterns, reusable
            design systems, and modern
            application structure optimization.
          </p>
        </div>
      </Section>

      {/* STACK */}
      <Section
        title="Core Stack"
        accent="emerald"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[
            'React',
            'TypeScript',
            'TanStack Router',
            'TailwindCSS',
            'Zustand',
            'Laravel',
            'Spring Boot',
            'Node.js',
          ].map((tech) => (
            <div
              key={tech}
              className="rounded-2xl border border-border bg-card/50 p-4 text-center text-sm font-medium transition-colors hover:-translate-y-1 hover:border-primary/20 hover:bg-muted/40"
            >
              {tech}
            </div>
          ))}
        </div>
      </Section>
    </main>
  )
}

/* ----------------------------------
   REUSABLE UI
-----------------------------------*/

function Section({
  title,
  children,
  accent = 'blue',
}: {
  title: string
  children: React.ReactNode
  accent?: 'blue' | 'purple' | 'pink' | 'emerald'
}) {
  const accentMap = {
    blue:
      'text-blue-600 dark:text-blue-300 border-blue-500/20 bg-blue-500/10',

    purple:
      'text-purple-600 dark:text-purple-300 border-purple-500/20 bg-purple-500/10',

    pink:
      'text-pink-600 dark:text-pink-300 border-pink-500/20 bg-pink-500/10',

    emerald:
      'text-emerald-600 dark:text-emerald-300 border-emerald-500/20 bg-emerald-500/10',
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

function TechBadge({
  label,
  color,
}: {
  label: string
  color:
    | 'blue'
    | 'purple'
    | 'pink'
    | 'emerald'
    | 'cyan'
    | 'red'
}) {
  const colorMap = {
    blue:
      'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300',

    purple:
      'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-300',

    pink:
      'border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-300',

    emerald:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',

    cyan:
      'border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',

    red:
      'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300',
  }

  return (
    <Badge
      className={`rounded-full border px-3 py-1 transition-colors hover:scale-105 ${colorMap[color]}`}
    >
      {label}
    </Badge>
  )
}