import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SEO from '../../components/seo/SEO';
import { apiClient } from '../../lib/apiClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <>
      <SEO title="Forgot password" description="Reset your VYBEBOARD account password." path="/forgot-password" noindex />
      <AuthLayout title="Reset your password" subtitle="We'll send a reset link to your email.">
        {sent ? (
          <p className="rounded-xl bg-soft-violet p-4 text-sm text-ink">
            If that email exists in VYBEBOARD, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} name="email" />
            <Button type="submit" loading={submitting} className="w-full">Send reset link</Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-ink-secondary">
          <Link to="/login" className="text-brand hover:underline">Back to log in</Link>
        </p>
      </AuthLayout>
    </>
  );
}
