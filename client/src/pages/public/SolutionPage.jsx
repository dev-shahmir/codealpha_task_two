import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import { BreadcrumbSchema, FAQSchema } from '../../components/seo/StructuredData';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { solutions } from '../../data/solutionsData';

const SOLUTION_FAQS = {
  startups: [
    { question: 'Can a startup use VYBEBOARD with a very small team?', answer: 'Yes. VYBEBOARD works well for teams of any size, including solo founders and two or three person teams.' },
    { question: 'Does VYBEBOARD scale as a startup grows?', answer: 'Yes. You can add members, projects, and workspaces as your team grows without changing tools.' },
  ],
  developers: [
    { question: 'Can I track bugs separately from features?', answer: 'Yes. Use the Bug and Feature labels to filter and separate types of work on the same board.' },
    { question: 'Does VYBEBOARD integrate with Git?', answer: 'The MVP focuses on task and project tracking; direct Git integration is a planned extension.' },
  ],
  freelancers: [
    { question: 'Can I give a client read-only access?', answer: 'Yes. Add a client as a Viewer to let them see progress without editing tasks.' },
    { question: 'Can I run multiple client projects at once?', answer: 'Yes. Create one project per client to keep work fully separated.' },
  ],
  agencies: [
    { question: 'Can different team members have different permission levels?', answer: 'Yes. VYBEBOARD supports Owner, Admin, Member, and Viewer roles per project.' },
    { question: 'Can we see workload across the whole team?', answer: 'Yes. The project analytics page includes a team workload breakdown.' },
  ],
  'remote-teams': [
    { question: 'How does VYBEBOARD reduce status meetings?', answer: 'Because updates sync in real time, teammates can check the board instead of waiting for a synchronous update.' },
    { question: 'Does VYBEBOARD work across time zones?', answer: 'Yes. Each user can set their own time zone for accurate due-date display.' },
  ],
};

export default function SolutionPage() {
  const { slug } = useParams();
  const solution = solutions[slug];

  if (!solution) return <Navigate to="/features" replace />;

  const faqs = SOLUTION_FAQS[slug] || [];

  return (
    <>
      <SEO title={solution.title} description={solution.metaDescription} path={`/solutions/${slug}`} />
      <BreadcrumbSchema items={[{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions/startups' }, { name: solution.title, path: `/solutions/${slug}` }]} />
      {faqs.length > 0 && <FAQSchema faqs={faqs} />}

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-soft-violet text-brand">
            <solution.icon size={26} />
          </div>
          <h1 className="font-heading text-4xl font-bold text-ink">{solution.h1}</h1>
          <p className="mt-4 text-ink-secondary">{solution.solution}</p>
          <div className="mt-7">
            <Button as={Link} to="/signup" size="lg">{solution.cta} <ArrowRight size={18} /></Button>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold">The problem</h2>
            <p className="mt-2 text-sm text-ink-secondary">{solution.problem}</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold">How VYBEBOARD helps</h2>
            <p className="mt-2 text-sm text-ink-secondary">{solution.solution}</p>
          </Card>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <h2 className="mb-4 font-heading text-lg font-semibold">Relevant features</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {solution.features.map((f) => (
              <li key={f} className="flex items-center gap-2 rounded-xl border border-border-c bg-surface p-3 text-sm">
                <CheckCircle2 size={16} className="text-success" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <h2 className="mb-2 font-heading text-lg font-semibold">How the workflow looks</h2>
          <p className="text-sm text-ink-secondary">{solution.workflow}</p>
        </div>

        {faqs.length > 0 && (
          <div className="mx-auto mt-10 max-w-4xl">
            <h2 className="mb-4 font-heading text-lg font-semibold">FAQ</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details key={f.question} className="rounded-card border border-border-c bg-surface p-4">
                  <summary className="cursor-pointer list-none text-sm font-medium">{f.question}</summary>
                  <p className="mt-2 text-sm text-ink-secondary">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto mt-10 max-w-4xl text-sm text-ink-secondary">
          Explore other solutions:{' '}
          {Object.values(solutions)
            .filter((s) => s.slug !== slug)
            .map((s, idx, arr) => (
              <span key={s.slug}>
                <Link to={`/solutions/${s.slug}`} className="text-brand hover:underline">{s.title.replace('Project Management for ', '')}</Link>
                {idx < arr.length - 1 ? ', ' : ''}
              </span>
            ))}
        </div>
      </section>
    </>
  );
}
