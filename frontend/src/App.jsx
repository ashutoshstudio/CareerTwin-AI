/**
 * App.jsx — Root component with all application routes
 *
 * Route groups:
 *   Public  (PublicLayout)   → / | /login | /register
 *   Student (DashboardLayout) → /dashboard | /profile | /assessment |
 *                               /career-readiness | /skill-gap |
 *                               /job-matches | /recommendations
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout    from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';

// Student pages
import Dashboard      from './pages/Dashboard';
import Profile        from './pages/Profile';
import Assessment     from './pages/Assessment';
import CareerReadiness from './pages/CareerReadiness';
import SkillGap       from './pages/SkillGap';
import JobMatches     from './pages/JobMatches';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ─────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"         element={<Home />}     />
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ── Student / Dashboard routes ─────────────────────── */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"        element={<Dashboard />}       />
          <Route path="/profile"          element={<Profile />}         />
          <Route path="/assessment"       element={<Assessment />}      />
          <Route path="/career-readiness" element={<CareerReadiness />} />
          <Route path="/skill-gap"        element={<SkillGap />}        />
          <Route path="/job-matches"      element={<JobMatches />}      />
          <Route path="/recommendations"  element={<Recommendations />} />
        </Route>

        {/* ── Fallback — redirect unknown paths to home ─────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
