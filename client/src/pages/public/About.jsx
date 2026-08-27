import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';

export default function About() {
  return (
    <>
      <SEO
        title="About"
        description="Learn about VYBEBOARD, a modern project management workspace built for startups, developers, freelancers, and remote teams."
        path="/about"
      />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-heading text-4xl font-bold text-ink">About VYBEBOARD</h1>
        <p className="mt-4 text-ink-secondary">
          VYBEBOARD combines team energy, project clarity, and visible progress into one workspace. We built it because
          most project management tools either feel too heavy for a small team or too unstructured to scale with one.
        </p>
        <Card className="mt-8 p-6">
          <h2 className="font-heading text-lg font-semibold">What we believe</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
            <li>Teams move faster with clear ownership, not more process.</li>
            <li>Context should live with the work, not scattered across chat threads.</li>
            <li>A tool should feel calm and focused, not cluttered with features nobody uses.</li>
          </ul>
        </Card>
        <p className="mt-8 text-sm text-ink-secondary">
          VYBEBOARD is under active development. Have feedback or a feature request? <a href="/contact" className="text-brand hover:underline">Get in touch</a>.
        </p>
      </section>
    </>
  );
}
