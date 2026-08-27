import SEO from '../../components/seo/SEO';

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy" description="Read the VYBEBOARD privacy policy to understand how we collect, use, and protect your data." path="/privacy" />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose-sm">
        <h1 className="font-heading text-4xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-4 text-sm text-ink-secondary">Last updated: 2026. This is placeholder policy text for the VYBEBOARD MVP and should be reviewed by counsel before production use.</p>
        <div className="mt-8 space-y-6 text-sm text-ink-secondary">
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Information we collect</h2>
            <p className="mt-2">We collect account information you provide (name, username, email) and content you create within your workspace, such as projects, tasks, and comments.</p>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">How we use information</h2>
            <p className="mt-2">We use your information to operate the VYBEBOARD service, including authentication, real-time collaboration, and notifications.</p>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Data security</h2>
            <p className="mt-2">Passwords are hashed and never stored in plain text. Access to project data is restricted to authorized members based on their role.</p>
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Your choices</h2>
            <p className="mt-2">You can update or delete your account at any time from Settings.</p>
          </div>
        </div>
      </section>
    </>
  );
}
