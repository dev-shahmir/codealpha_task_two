import { KanbanSquare, Users, MessageSquare, BarChart3, Bell, ListChecks, Command, Moon, Smartphone } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import { BreadcrumbSchema } from '../../components/seo/StructuredData';
import Card from '../../components/ui/Card';

const FEATURES = [
  { icon: KanbanSquare, title: 'Kanban Boards', desc: 'Organize work into customizable columns — Backlog, To Do, In Progress, Review, Done — and drag tasks across them with smooth, optimistic updates.' },
  { icon: ListChecks, title: 'Task Management', desc: 'Give every task a priority, labels, a due date, and a description, so context lives with the work instead of scattered across chat.' },
  { icon: Users, title: 'Real-Time Collaboration', desc: 'Task moves, comments, and assignments sync instantly across the team through a real-time connection, no page refresh required.' },
  { icon: MessageSquare, title: 'Comments & Mentions', desc: 'Discuss a task where the work happens. Mention a teammate with @username to pull them into the conversation.' },
  { icon: ListChecks, title: 'Checklists', desc: 'Break a task into subtasks and track completion percentage automatically as items are checked off.' },
  { icon: Bell, title: 'Notifications', desc: 'Get notified when you are assigned a task, mentioned in a comment, or approaching a due date.' },
  { icon: BarChart3, title: 'Project Analytics', desc: 'See completion rate, tasks by priority and status, and team workload at a glance on a lightweight analytics page.' },
  { icon: Command, title: 'Search & Command Palette', desc: 'Press Ctrl+K to search across projects, tasks, members, and comments, or trigger quick actions like creating a task.' },
  { icon: Moon, title: 'Dark Mode', desc: 'A dedicated dark theme with proper contrast and muted accents, not just an inverted color scheme.' },
  { icon: Smartphone, title: 'Mobile Support', desc: 'A responsive layout with a mobile navigation drawer, horizontally scrollable boards, and full-screen task details.' },
];

export default function Features() {
  return (
    <>
      <SEO
        title="Features"
        description="Explore VYBEBOARD's core features: Kanban boards, real-time collaboration, comments and mentions, checklists, notifications, analytics, search, and dark mode."
        path="/features"
      />
      <BreadcrumbSchema items={[{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }]} />

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-4xl font-bold text-ink">Everything you need to plan, track, and ship work</h1>
          <p className="mt-4 text-ink-secondary">
            VYBEBOARD combines the essentials of task management and team collaboration into one focused workspace,
            without the clutter of an all-in-one suite.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-soft-violet text-brand">
                <f.icon size={22} aria-hidden="true" />
              </div>
              <h2 className="font-heading text-base font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-sm text-ink-secondary">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
