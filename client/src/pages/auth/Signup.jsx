import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SEO from '../../components/seo/SEO';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function Signup() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(form.password);
  const strengthLabel = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'][strength];
  const strengthColor = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-brand-secondary', 'bg-success'][strength];

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!/^[a-z0-9_]{3,30}$/.test(form.username)) next.username = 'Lowercase letters, numbers, underscores only';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ name: form.name, username: form.username.toLowerCase(), email: form.email, password: form.password });
      toast?.success('Your workspace is ready. Welcome to VYBEBOARD!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast?.error(err.message || 'Could not create your account');
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Sign up" description="Create your free VYBEBOARD workspace." path="/signup" noindex />
      <AuthLayout title="Create your workspace" subtitle="Your next big idea starts here.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Name" name="name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Username" name="username" value={form.username} error={errors.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} hint="Lowercase letters, numbers, underscores" />
          <Input label="Email" type="email" name="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="neon-focus absolute right-3 top-[38px] text-ink-secondary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {form.password && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                  <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-secondary">{strengthLabel}</p>
              </div>
            )}
          </div>
          <Input label="Confirm password" type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
            error={errors.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
          <Button type="submit" loading={submitting} className="w-full">Start Building Free</Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already have an account? <Link to="/login" className="text-brand hover:underline">Log in</Link>
        </p>
      </AuthLayout>
    </>
  );
}
