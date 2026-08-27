import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SEO from '../../components/seo/SEO';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email) return setErrors({ email: 'Email is required' });
    if (!form.password) return setErrors({ password: 'Password is required' });

    setSubmitting(true);
    try {
      await login(form);
      toast?.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast?.error(err.message || 'Could not log in');
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Log in" description="Log in to your VYBEBOARD workspace." path="/login" noindex />
      <AuthLayout title="Welcome back" subtitle="Log in to keep the momentum going.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Email" type="email" name="email" autoComplete="email" value={form.email} error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <Input
              label="Password" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password"
              value={form.password} error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="neon-focus absolute right-3 top-[38px] text-ink-secondary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink-secondary">
              <input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="neon-focus rounded border-border-c" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-brand hover:underline">Forgot password?</Link>
          </div>
          {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
          <Button type="submit" loading={submitting} className="w-full">Log in</Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-secondary">
          New to VYBEBOARD? <Link to="/signup" className="text-brand hover:underline">Create an account</Link>
        </p>
        <p className="mt-3 rounded-xl bg-soft-violet px-3 py-2 text-center text-xs text-ink-secondary">
          Demo login: alex@vybeboard.dev / vybeboard123
        </p>
      </AuthLayout>
    </>
  );
}
