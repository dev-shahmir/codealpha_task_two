import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';

const GUIDES = [
  { title: 'How to create a project', steps: ['Go to Projects and select "New Project."', 'Name your project and choose a color and visibility.', 'Invite teammates by email, or skip and invite them later.'] },
  { title: 'How to create a task', steps: ['Open a project board.', 'Select "Add task" in any column.', 'Give it a title — you can add details afterward from the task card.'] },
  { title: 'How to assign a task', steps: ['Open the task by clicking its card.', 'Select the Assignee field.', 'Choose a project member from the list.'] },
  { title: 'How to move a task', steps: ['Drag the task card to another column.', 'Or open the task and change its status from the details panel.', 'The change syncs to your team instantly.'] },
  { title: 'How to invite a member', steps: ['Open a project and go to Members.', 'Enter their VYBEBOARD account email.', 'Choose a role: Admin, Member, or Viewer.'] },
  { title: 'How to use comments', steps: ['Open a task and scroll to Comments.', 'Type your message and use @ to mention a teammate.', 'Everyone on the project sees new comments in real time.'] },
  { title: 'How to manage notifications', steps: ['Go to Settings > Notifications.', 'Toggle the notification types you want to receive.', 'Unread notifications appear with a badge in the sidebar.'] },
];

export default function Help() {
  return (
    <>
      <SEO
        title="Help Center"
        description="Step-by-step guides for getting started with VYBEBOARD: creating projects, assigning tasks, moving cards, and managing notifications."
        path="/help"
      />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-heading text-4xl font-bold text-ink">Help Center</h1>
        <p className="mt-3 text-ink-secondary">Everything you need to get your team moving on VYBEBOARD.</p>

        <div className="mt-10 space-y-5">
          {GUIDES.map((g) => (
            <Card key={g.title} className="p-5">
              <h2 className="font-heading text-base font-semibold">{g.title}</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-secondary">
                {g.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
