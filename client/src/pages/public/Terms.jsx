import SEO from '../../components/seo/SEO';

export default function Terms() {
  return (
    <>
      <SEO title="Terms of Service" description="Read the terms of service for using VYBEBOARD, a project management and team collaboration platform." path="/terms" />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-heading text-4xl font-bold text-ink">Terms of Service</h1>
        <p className="mt-4 text-sm text-ink-secondary">Last updated: 2026. This is placeholder terms text for the VYBEBOARD MVP and should be reviewed by counsel before production use.</p>
        <div className="mt-8 space-y-6 text-sm text-ink-secondary">
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Using VYBEBOARD</h2>
            <p className="mt-2">By creating an account, you agree to use VYBEBOARD for lawful purposes and to keep your login credentials secure.</p>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Your content</h2>
            <p className="mt-2">You retain ownership of the projects, tasks, and comments you create. You are responsible for the content your team adds to the workspace.</p>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Service availability</h2>
            <p className="mt-2">VYBEBOARD is provided "as is" during the MVP phase without uptime guarantees.</p>
          </div>
        </div>
      </section>
    </>
  );
}
