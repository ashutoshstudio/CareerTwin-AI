/**
 * App.jsx — Root component with all application routes
 *
 * Route groups:
 *   Public  (PublicLayout)    → / | /about | /how-it-works | /careers | /login | /register
 *   Student (DashboardLayout) → /dashboard | /profile | /resume-analyzer | /ats-score |
 *                               /assessment | /career-readiness | /skill-gap | /job-matches |
 *                               /explainable-ai | /assistant | /roadmap | /github-analyzer |
 *                               /mock-interview | /reports
 *   Admin   (AdminLayout)     → /admin | /admin/users | /admin/jobs | /admin/skills |
 *                               /admin/roles | /admin/analytics
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout    from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout     from './layouts/AdminLayout';

// Public pages
import Home        from './pages/Home';
import About       from './pages/About';
import HowItWorks  from './pages/HowItWorks';
import Careers     from './pages/Careers';
import Login       from './pages/Login';
import Register    from './pages/Register';

// Student pages
import Dashboard       from './pages/Dashboard';
import Profile         from './pages/Profile';
import ResumeAnalyzer  from './pages/ResumeAnalyzer';
import AtsScore        from './pages/AtsScore';
import Assessment      from './pages/Assessment';
import CareerReadiness from './pages/CareerReadiness';
import SkillGap        from './pages/SkillGap';
import JobMatches      from './pages/JobMatches';
import ExplainableAI   from './pages/ExplainableAI';
import CareerAssistant from './pages/CareerAssistant';
import LearningRoadmap from './pages/LearningRoadmap';
import GitHubAnalyzer  from './pages/GitHubAnalyzer';
import MockInterview   from './pages/MockInterview';
import Reports         from './pages/Reports';

// Admin pages
import AdminDashboard  from './pages/AdminDashboard';
import AdminUsers      from './pages/AdminUsers';
import AdminJobs       from './pages/AdminJobs';
import AdminSkills     from './pages/AdminSkills';
import AdminRoles      from './pages/AdminRoles';
import AdminAnalytics  from './pages/AdminAnalytics';
import CareerDetail    from './pages/CareerDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ─────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"             element={<Home />}         />
          <Route path="/about"        element={<About />}        />
          <Route path="/how-it-works" element={<HowItWorks />}  />
          <Route path="/careers"      element={<Careers />}      />
          <Route path="/careers/:slug" element={<CareerDetail />} />
          <Route path="/login"        element={<Login />}        />
          <Route path="/register"     element={<Register />}     />
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
    </BrowserRouter>
  );
}

export default App;
