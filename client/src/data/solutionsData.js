import { Rocket, Code2, Briefcase, Building2, Users } from 'lucide-react';

export const solutions = {
  startups: {
    slug: 'startups',
    icon: Rocket,
    h1: 'Project Management for Startups',
    title: 'Project Management for Startups',
    metaDescription:
      'VYBEBOARD helps early-stage startups plan sprints, track launches, and keep small teams aligned without heavyweight process.',
    problem:
      'Startups move fast and change direction often. Generic project tools add process overhead that slows a small team down instead of helping it ship.',
    solution:
      'VYBEBOARD gives founders and small teams a lightweight Kanban workspace that stays out of the way: quick to set up, easy to adapt, and clear enough that everyone knows what to work on next.',
    features: ['Visual Kanban boards', 'Fast project setup', 'Real-time collaboration', 'Lightweight analytics'],
    workflow: 'Capture ideas as they come in, plan the next sprint, assign owners, collaborate in comments, and ship — without switching tools.',
    cta: 'Start your first project free',
  },
  developers: {
    slug: 'developers',
    icon: Code2,
    h1: 'Collaborative Kanban Boards for Developers',
    title: 'Project Management for Developers',
    metaDescription:
      'VYBEBOARD gives developers a Kanban workflow with labels for bugs, features, and pull requests, built for sprint-based software teams.',
    problem:
      'Engineering work often lives across tickets, PRs, and chat threads, making it hard to see true sprint progress at a glance.',
    solution:
      'VYBEBOARD centralizes tasks with developer-friendly labels (Bug, Feature, Backend, Frontend), checklists for acceptance criteria, and activity history so status is always visible.',
    features: ['Bug and feature labels', 'Checklists for acceptance criteria', 'Task activity history', 'Command palette (Ctrl+K)'],
    workflow: 'Log issues in the backlog, move them through To Do, In Progress, and Review, then track completion with a live progress view.',
    cta: 'Set up your dev workspace',
  },
  freelancers: {
    slug: 'freelancers',
    icon: Briefcase,
    h1: 'Simple Project Management for Freelancers',
    title: 'Project Management for Freelancers',
    metaDescription:
      'VYBEBOARD helps freelancers organize client work, track deadlines, and share progress without the overhead of enterprise tools.',
    problem:
      'Freelancers juggling several clients need a simple way to track deliverables and due dates without paying for tools built for large teams.',
    solution:
      'VYBEBOARD lets you create a focused project per client, track deadlines with due-date views, and invite clients as viewers when you want to share progress.',
    features: ['Per-client project boards', 'Due-date tracking', 'Viewer role for client visibility', 'Mobile-friendly workspace'],
    workflow: 'Create a project per client, break work into tasks with due dates, and check My Tasks each morning to see what is due.',
    cta: 'Organize your client work',
  },
  agencies: {
    slug: 'agencies',
    icon: Building2,
    h1: 'Team Workspace for Creative Agencies',
    title: 'Project Management for Agencies',
    metaDescription:
      'VYBEBOARD helps creative agencies manage multiple client projects, assign work across teams, and track progress in one workspace.',
    problem:
      'Agencies run many projects in parallel across designers, writers, and account managers, which makes visibility into workload and deadlines difficult.',
    solution:
      'VYBEBOARD gives agencies a shared workspace with role-based access, project-level analytics, and a searchable history of decisions in task comments.',
    features: ['Role-based permissions', 'Project analytics', 'Cross-project search', 'Client-safe visibility controls'],
    workflow: 'Set up a project per client engagement, assign roles, track workload across the team, and review analytics before status calls.',
    cta: 'Bring your team on board',
  },
  'remote-teams': {
    slug: 'remote-teams',
    icon: Users,
    h1: 'Team Productivity Workspace for Remote Teams',
    title: 'Project Management for Remote Teams',
    metaDescription:
      'VYBEBOARD keeps distributed teams aligned with real-time updates, notifications, and a single source of truth for project status.',
    problem:
      'Remote and distributed teams lose time to status meetings and scattered updates across time zones.',
    solution:
      'VYBEBOARD replaces status meetings with a live board: real-time task updates, @mentions, and a notification center keep everyone aligned asynchronously.',
    features: ['Real-time task updates', '@mentions and comments', 'Notification center', 'Activity history per project'],
    workflow: 'Team members update tasks as they work; everyone else sees changes instantly, with notifications for anything that needs their attention.',
    cta: 'Align your remote team',
  },
};
