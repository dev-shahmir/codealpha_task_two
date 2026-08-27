import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/public/Landing';
import Features from './pages/public/Features';
import SolutionPage from './pages/public/SolutionPage';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Help from './pages/public/Help';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Dashboard from './pages/app/Dashboard';
import Projects from './pages/app/Projects';
import ProjectBoard from './pages/app/ProjectBoard';
import MyTasks from './pages/app/MyTasks';
import Analytics from './pages/app/Analytics';
import Notifications from './pages/app/Notifications';
import Team from './pages/app/Team';
import Settings from './pages/app/Settings';

export default function App() {
  return (
    <Routes>
      {/* Public / SEO routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/solutions/:slug" element={<SolutionPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>

      {/* Auth routes (noindex, no shared layout chrome) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated app routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectBoard />} />
        <Route path="/projects/:id/analytics" element={<ProjectBoard />} />
        <Route path="/projects/:id/members" element={<ProjectBoard />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
