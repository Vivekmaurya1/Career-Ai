// src/App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import { KeepAlive } from "./hooks/useKeepAlive";
import { useAuth } from "./context/AuthContext";

const Landing = lazy(() => import("./pages/landing"));
const Generate = lazy(() => import("./pages/generate"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const RoadmapPage = lazy(() => import("./pages/roadmapPage"));
const Settings = lazy(() => import("./pages/settings"));
const MockTestPage = lazy(() => import("./pages/mockTestPage"));

/* ── Page transition wrapper ─────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

/* ── Private route ───────────────────────────────────────────────────────── */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ width:32, height:32, border:"1px solid var(--accent)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

/* ── Routes ──────────────────────────────────────────────────────────────── */
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={(
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", background: "var(--bg)" }}>
          Loading...
        </div>
      )}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"            element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/login"       element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register"    element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/generate"    element={<PrivateRoute><PageWrapper><Generate /></PageWrapper></PrivateRoute>} />
          <Route path="/dashboard"   element={<PrivateRoute><PageWrapper><Dashboard /></PageWrapper></PrivateRoute>} />
          <Route path="/roadmap/:id" element={<PrivateRoute><PageWrapper><RoadmapPage /></PageWrapper></PrivateRoute>} />
          <Route path="/settings"    element={<PrivateRoute><PageWrapper><Settings /></PageWrapper></PrivateRoute>} />
          <Route path="/mocktest"    element={<PrivateRoute><PageWrapper><MockTestPage /></PageWrapper></PrivateRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

/* ── Inner app — has access to both contexts ─────────────────────────────── */
function InnerApp() {
  const { setThemeFromUser } = useTheme();
  return (
    <AuthProvider onThemeChange={setThemeFromUser}>
      <KeepAlive />
      <div style={{ background:"var(--bg)", color:"var(--text)", minHeight:"100vh", fontFamily:"'IBM Plex Mono', monospace" }}>
        <Navbar />
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

/* ── Root export ─────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}