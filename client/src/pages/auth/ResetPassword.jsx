import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SEO from '../../components/seo/SEO';
import { apiClient } from '../../lib/apiClient';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    setSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      toast?.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Reset password" description="Set a new password for your VYBEBOARD account." path="/reset-password" noindex />
      <AuthLayout title="Set a new password" subtitle="Almost there — pick a new password to finish.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Reset token" name="token" value={token} onChange={(e) => setToken(e.target.value)} hint="Paste the token from your reset email" />
          <Input label="New password" type="password" name="password" value={password} error={error} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" loading={submitting} className="w-full">Reset password</Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-secondary">
          <Link to="/login" className="text-brand hover:underline">Back to log in</Link>
        </p>
      </AuthLayout>
    </>
  );
}
