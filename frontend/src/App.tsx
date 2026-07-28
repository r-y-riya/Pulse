import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';

// Features / Pages
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import PlannerPage from './features/planner/PlannerPage';
import ActiveWorkoutPage from './features/active-workout/ActiveWorkoutPage';
import LibraryPage from './features/library/LibraryPage';
import HistoryPage from './features/history/HistoryPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import AICoachPage from './features/ai-coach/AICoachPage';
import NutritionPage from './features/nutrition/NutritionPage';
import GoalsPage from './features/goals/GoalsPage';
import AchievementsPage from './features/achievements/AchievementsPage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import WomensHealthPage from './features/womens-health/WomensHealthPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard Route for authenticated sessions
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-xs text-text-muted gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Syncing Pulse telemetry...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard features */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
            <Route path="/active-workout" element={<ProtectedRoute><ActiveWorkoutPage /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
            <Route path="/womens-health" element={<ProtectedRoute><WomensHealthPage /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Wildcard redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #e5eef7',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 10px 30px -5px rgba(229, 238, 247, 0.5)',
              borderRadius: '16px'
            }
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
