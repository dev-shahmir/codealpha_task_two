import { Link } from 'react-router-dom';
import {
  KanbanSquare, Users, MessageSquare, BarChart3, Bell, ListChecks, Command, Moon, Smartphone, ArrowRight,
} from 'lucide-react';
import SEO from '../../components/seo/SEO';
import { SoftwareApplicationSchema, FAQSchema } from '../../components/seo/StructuredData';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { PriorityBadge, LabelBadge } from '../../components/ui/Badge';
import { homepageFaqs } from '../../data/faqData';
import { solutions } from '../../data/solutionsData';

const FEATURES = [
  { icon: KanbanSquare, title: 'Visual Kanban Boards', desc: 'Drag tasks through customizable columns that match how your team actually works.' },
  { icon: Users, title: 'Real-Time Collaboration', desc: 'See updates the moment they happen — no refresh, no waiting on a status meeting.' },
  { icon: MessageSquare, title: 'Comments & Mentions', desc: 'Keep context on the task itself with threaded comments and @mentions.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Project-level analytics show completion rate, workload, and overdue work at a glance.' },
  { icon: Bell, title: 'Notifications & Reminders', desc: 'Get notified on assignments, mentions, and due dates without digging for updates.' },
  { icon: ListChecks, title: 'Checklists & Subtasks', desc: 'Break big tasks into checkable steps with automatic completion tracking.' },
  { icon: Command, title: 'Search & Command Palette', desc: 'Jump to any project, task, or action instantly with Ctrl+K.' },
  { icon: Moon, title: 'Dark Mode', desc: 'A premium dark theme built for focus, not just inverted colors.' },
  { icon: Smartphone, title: 'Mobile-Friendly Workspace', desc: 'A board, task view, and navigation redesigned for phones and tablets.' },
];

const WORKFLOW = [
  { step: 'Capture', desc: 'Drop new ideas and requests into the backlog before they get lost in chat.' },
  { step: 'Plan', desc: 'Turn ideas into scoped tasks with priorities, labels, and due dates.' },
  { step: 'Assign', desc: 'Give each task a clear owner so nothing sits unclaimed.' },
  { step: 'Collaborate', desc: 'Discuss details in comments, mention teammates, and track checklist progress.' },
  { step: 'Ship', desc: 'Move work to Done and watch project progress update in real time.' },
];

import { motion } from 'framer-motion';

const USE_CASES = Object.values(solutions);

export default function Landing() {
  return (
    <>
      <SEO
        title="Modern Project Management Software for Fast-Moving Teams"
        description="VYBEBOARD helps startups, developers, freelancers, and remote teams plan projects, manage tasks, collaborate in real time, and ship work faster from one focused workspace."
        path="/"
      />
      <SoftwareApplicationSchema />
      <FAQSchema faqs={homepageFaqs} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="orbit-ring pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-40 animate-pulse" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border-c bg-surface px-3 py-1 text-xs font-medium text-ink-secondary">
            Now in the VYBE for 2026 teams
          </span>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            Plan less. Ship more. <span className="text-brand">Stay in the VYBE.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-secondary sm:text-lg">
            VYBEBOARD is a modern project management workspace for teams that want to organize tasks, collaborate in
            context, and move ideas from backlog to launch.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signup" size="lg">
              Start Building Free <ArrowRight size={18} />
            </Button>
            <Button as={Link} to="/features" variant="secondary" size="lg">
              Explore the Demo
            </Button>
          </div>
          <p className="mt-4 text-xs text-ink-secondary">No credit card required. Free demo workspace included.</p>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="mx-auto mt-14 max-w-5xl"
        >
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border-c bg-elevated px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-ink-secondary">app.vybeboard.dev/projects/creator-launchpad</span>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              {[
                { col: 'To Do', title: 'Design onboarding flow', priority: 'high', label: 'design' },
                { col: 'In Progress', title: 'Build task detail modal', priority: 'medium', label: 'frontend' },
                { col: 'Review', title: 'QA mobile responsive layout', priority: 'urgent', label: 'bug' },
              ].map((t) => (
                <div key={t.title} className="rounded-card border border-border-c bg-canvas p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">{t.col}</p>
                  <div className="rounded-xl border border-border-c bg-surface p-3 shadow-soft">
                    <div className="mb-2 flex items-center gap-1.5">
                      <PriorityBadge priority={t.priority} />
                      <LabelBadge label={t.label} />
                    </div>
                    <p className="text-sm font-medium text-ink">{t.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        <Avatar name="Sarah Chen" size={22} ring />
                        <Avatar name="Ahmed Khan" size={22} ring />
                      </div>
                      <span className="text-xs text-ink-secondary">3/5 done</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </section>

      {/* AI-search-friendly answer block */}
      <section className="border-y border-border-c bg-surface px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">What is VYBEBOARD?</h2>
          <p className="mt-3 text-sm text-ink-secondary sm:text-base">
            VYBEBOARD is a collaborative project management platform for modern teams. It combines Kanban boards, task
            assignments, checklists, comments, notifications, project analytics, and real-time collaboration in one
            focused workspace.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold text-ink">Everything your team needs to keep the work moving</h2>
            <p className="mt-2 text-ink-secondary">A focused toolkit, not a bloated suite.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-elevated">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-soft-violet text-brand">
                  <f.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-secondary">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-border-c bg-surface px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">Your workflow, visualized</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-5">
            {WORKFLOW.map((w, i) => (
              <div key={w.step} className="relative">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="font-heading text-sm font-semibold">{w.step}</h3>
                <p className="mt-1 text-xs text-ink-secondary">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold text-ink">Built for how your team works</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((s) => (
              <Link key={s.slug} to={`/solutions/${s.slug}`}>
                <Card className="h-full p-5 transition-shadow hover:shadow-elevated">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-soft-cyan text-brand-secondary">
                    <s.icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-secondary">{s.problem}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Learn more <ArrowRight size={14} />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (clearly demo) */}
      <section className="border-y border-border-c bg-surface px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-ink-secondary">Demo workspace feedback</p>
          <h2 className="mb-10 text-center font-heading text-3xl font-bold text-ink">What demo teams say</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { name: 'Creator Launchpad Team (demo)', quote: 'Moving from scattered docs to one board made our weekly sync ten minutes shorter.' },
              { name: 'Mobile App Sprint Team (demo)', quote: 'The board keeps everyone honest about what is actually in progress.' },
              { name: 'Studio Rebrand Team (demo)', quote: 'Comments living on the task instead of in chat saved us a lot of searching.' },
            ].map((t) => (
              <Card key={t.name} className="p-5">
                <p className="text-sm text-ink">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-3 text-xs font-medium text-ink-secondary">{t.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold text-ink">Frequently asked questions</h2>
          <div className="space-y-4">
            {homepageFaqs.map((f) => (
              <details key={f.question} className="group rounded-card border border-border-c bg-surface p-4">
                <summary className="cursor-pointer list-none font-heading text-sm font-semibold text-ink">
                  {f.question}
                </summary>
                <p className="mt-2 text-sm text-ink-secondary">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <Card className="mx-auto max-w-4xl bg-gradient-to-br from-soft-violet to-soft-cyan p-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Your next launch starts with a better workflow.</h2>
          <div className="mt-6">
            <Button as={Link} to="/signup" size="lg">Create Your Workspace</Button>
          </div>
        </Card>
      </section>
    </>
  );
}
