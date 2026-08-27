import { useState } from 'react';
import SEO from '../../components/seo/SEO';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function Contact() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: '', email: '', message: '' });
      toast?.success("Thanks for reaching out — we'll get back to you soon.");
    }, 700);
  };

  return (
    <>
      <SEO title="Contact" description="Get in touch with the VYBEBOARD team with questions, feedback, or support requests." path="/contact" />
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="font-heading text-4xl font-bold text-ink">Contact us</h1>
        <p className="mt-3 text-ink-secondary">Questions, feedback, or a feature idea? We'd like to hear it.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} name="name" />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} name="email" />
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">Message</label>
            <textarea
              id="message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
          <Button type="submit" loading={submitting}>Send message</Button>
        </form>
      </section>
    </>
  );
}
