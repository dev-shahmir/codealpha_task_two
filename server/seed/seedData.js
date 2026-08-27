export const demoUsers = [
  { name: 'Alex Rivera', username: 'alexrivera', email: 'alex@vybeboard.dev', password: 'vybeboard123', bio: 'Full-stack dev. Coffee-powered.', avatar: '' },
  { name: 'Sarah Chen', username: 'sarahchen', email: 'sarah@vybeboard.dev', password: 'vybeboard123', bio: 'Product designer shipping pixels.', avatar: '' },
  { name: 'Ahmed Khan', username: 'ahmedkhan', email: 'ahmed@vybeboard.dev', password: 'vybeboard123', bio: 'Backend engineer, API whisperer.', avatar: '' },
  { name: 'Maya Patel', username: 'mayapatel', email: 'maya@vybeboard.dev', password: 'vybeboard123', bio: 'Freelance creative director.', avatar: '' },
  { name: 'Jordan Lee', username: 'jordanlee', email: 'jordan@vybeboard.dev', password: 'vybeboard123', bio: 'Startup founder, chief vibes officer.', avatar: '' },
];

export const demoProjects = [
  {
    name: 'Creator Launchpad',
    description: 'A toolkit for indie creators to plan and launch content drops.',
    color: '#6D5DFB',
    icon: 'rocket',
  },
  {
    name: 'Mobile App Sprint',
    description: 'Two-week sprint to ship v2 of the VYBEBOARD mobile app.',
    color: '#22D3EE',
    icon: 'smartphone',
  },
  {
    name: 'Studio Rebrand',
    description: 'Full visual identity refresh for the design studio.',
    color: '#B8F34A',
    icon: 'palette',
  },
  {
    name: 'AI Workspace',
    description: 'Exploring AI-assisted task automation inside VYBEBOARD.',
    color: '#F59E0B',
    icon: 'sparkles',
  },
  {
    name: 'Campus Hackathon',
    description: 'Weekend hackathon project board for the student team.',
    color: '#F43F5E',
    icon: 'trophy',
  },
];

export const taskTitlesByColumn = {
  backlog: ['Research competitor tools', 'Draft content calendar', 'Collect user feedback'],
  todo: ['Design onboarding flow', 'Set up CI pipeline', 'Write API documentation'],
  in_progress: ['Build task detail modal', 'Connect Socket.IO events', 'Implement dark mode'],
  review: ['Review pull request #42', 'QA mobile responsive layout'],
  done: ['Set up MongoDB indexes', 'Ship landing page', 'Configure JWT auth'],
};

export const labelPool = ['bug', 'feature', 'design', 'backend', 'frontend', 'research', 'documentation', 'marketing', 'launch'];
export const priorityPool = ['low', 'medium', 'high', 'urgent'];
