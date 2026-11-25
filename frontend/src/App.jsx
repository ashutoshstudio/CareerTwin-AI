/**
 * App.jsx — Root component with route-based code splitting (React.lazy + Suspense)
 *
 * Route groups:
 *   Public  (PublicLayout)    → / | /about | /how-it-works | /careers | /careers/:slug | /login | /register
 *   Student (DashboardLayout) → /dashboard | /profile | /resume-analyzer | /ats-score |
 *                               /assessment | /career-readiness | /skill-gap | /job-matches |
 *                               /explainable-ai | /assistant | /roadmap | /github-analyzer |
 *                               /mock-interview | /reports
 *   Admin   (AdminLayout)     → /admin | /admin/users | /admin/jobs | /admin/skills |
 *                               /admin/roles | /admin/analytics
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import Loading from './components/Loading';

// Layouts (eagerly loaded to avoid layout shifts)
import PublicLayout    from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout     from './layouts/AdminLayout';

// Public pages (lazy loaded for optimal bundle size)
const Home         = lazy(() => import('./pages/Home'));
const About        = lazy(() => import('./pages/About'));
const HowItWorks   = lazy(() => import('./pages/HowItWorks'));
const Careers      = lazy(() => import('./pages/Careers'));
const CareerDetail = lazy(() => import('./pages/CareerDetail'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));

// Student dashboard pages (lazy loaded on demand)
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Profile         = lazy(() => import('./pages/Profile'));
const ResumeAnalyzer  = lazy(() => import('./pages/ResumeAnalyzer'));
const AtsScore        = lazy(() => import('./pages/AtsScore'));
const Assessment      = lazy(() => import('./pages/Assessment'));
const CareerReadiness = lazy(() => import('./pages/CareerReadiness'));
const SkillGap        = lazy(() => import('./pages/SkillGap'));
const JobMatches      = lazy(() => import('./pages/JobMatches'));
const ExplainableAI   = lazy(() => import('./pages/ExplainableAI'));
const CareerAssistant = lazy(() => import('./pages/CareerAssistant'));
const LearningRoadmap = lazy(() => import('./pages/LearningRoadmap'));
const GitHubAnalyzer  = lazy(() => import('./pages/GitHubAnalyzer'));
const MockInterview   = lazy(() => import('./pages/MockInterview'));
const Reports         = lazy(() => import('./pages/Reports'));

// Admin pages (lazy loaded)
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers      = lazy(() => import('./pages/AdminUsers'));
const AdminJobs       = lazy(() => import('./pages/AdminJobs'));
const AdminSkills     = lazy(() => import('./pages/AdminSkills'));
const AdminRoles      = lazy(() => import('./pages/AdminRoles'));
const AdminAnalytics  = lazy(() => import('./pages/AdminAnalytics'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
    }}>
      <Loading message="Loading module..." />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public routes ─────────────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/"              element={<Home />}         />
              <Route path="/about"         element={<About />}        />
              <Route path="/how-it-works"  element={<HowItWorks />}  />
              <Route path="/careers"       element={<Careers />}      />
              <Route path="/careers/:slug" element={<CareerDetail />} />
              <Route path="/login"                 element={<Login />}          />
              <Route path="/register"              element={<Register />}       />
              <Route path="/auth/google/callback"  element={<GoogleCallback />} />
            </Route>

            {/* ── Student / Dashboard routes ─────────────────────── */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"        element={<Dashboard />}       />
              <Route path="/profile"          element={<Profile />}         />
              <Route path="/resume-analyzer"  element={<ResumeAnalyzer />}  />
              <Route path="/ats-score"        element={<AtsScore />}        />
              <Route path="/assessment"       element={<Assessment />}      />
              <Route path="/career-readiness" element={<CareerReadiness />} />
              <Route path="/skill-gap"        element={<SkillGap />}        />
              <Route path="/job-matches"      element={<JobMatches />}      />
              <Route path="/explainable-ai"   element={<ExplainableAI />}   />
              <Route path="/assistant"        element={<CareerAssistant />} />
              <Route path="/roadmap"          element={<LearningRoadmap />} />
              <Route path="/github-analyzer"  element={<GitHubAnalyzer />}  />
              <Route path="/mock-interview"   element={<MockInterview />}   />
              <Route path="/reports"          element={<Reports />}         />
            </Route>

            {/* ── Admin routes ──────────────────────────────────── */}
            <Route element={<AdminLayout />}>
              <Route path="/admin"            element={<AdminDashboard />} />
              <Route path="/admin/users"      element={<AdminUsers />}     />
              <Route path="/admin/jobs"       element={<AdminJobs />}      />
              <Route path="/admin/skills"     element={<AdminSkills />}     />
              <Route path="/admin/roles"      element={<AdminRoles />}     />
              <Route path="/admin/analytics"  element={<AdminAnalytics />} />
            </Route>

            {/* ── Fallback — redirect unknown paths to home ─────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
