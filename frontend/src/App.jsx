import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Public
import HomePage from './pages/HomePage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'

// Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard'
import VetDashboard from './pages/dashboard/VetDashboard'
import ProducerDashboard from './pages/dashboard/ProducerDashboard'
import DistrictDashboard from './pages/dashboard/DistrictDashboard'

// Farms
import FarmsListPage from './pages/farms/FarmsListPage'
import RegisterFarmPage from './pages/farms/RegisterFarmPage'
import FarmProfilePage from './pages/farms/FarmProfilePage'

// Animals
import AnimalsListPage from './pages/animals/AnimalsListPage'
import RegisterAnimalPage from './pages/animals/RegisterAnimalPage'
import AnimalDetailPage from './pages/animals/AnimalDetailPage'

// MRL
import MrlTestsPage from './pages/mrl/MrlTestsPage'

// AMR
import AmrPage from './pages/amr/AmrPage'

// Scan
import ScanPage from './pages/scan/ScanPage'

// Admin
import UsersPage from './pages/admin/UsersPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import ProfilePage from './pages/account/ProfilePage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'

// ─── Protected Route ─────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50">
      <div className="w-10 h-10 border-4 border-mustard-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/auth/login" replace />
}

// Admin only
function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth/login" replace />
  if (!isAdmin()) return <Navigate to="/dashboard/producer" replace />
  return children
}

// ─── Public Layout ────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// ─── Routes ──────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Dashboards */}
      <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/dashboard/veterinarian" element={<ProtectedRoute><VetDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/producer" element={<ProtectedRoute><ProducerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/district" element={<ProtectedRoute><DistrictDashboard /></ProtectedRoute>} />

      {/* Farms */}
      <Route path="/farms" element={<ProtectedRoute><FarmsListPage /></ProtectedRoute>} />
      <Route path="/farms/new" element={<ProtectedRoute><RegisterFarmPage /></ProtectedRoute>} />
      <Route path="/farms/:id" element={<ProtectedRoute><FarmProfilePage /></ProtectedRoute>} />

      {/* Animals */}
      <Route path="/animals" element={<ProtectedRoute><AnimalsListPage /></ProtectedRoute>} />
      <Route path="/animals/new" element={<ProtectedRoute><RegisterAnimalPage /></ProtectedRoute>} />
      <Route path="/animals/:id" element={<ProtectedRoute><AnimalDetailPage /></ProtectedRoute>} />

      {/* MRL Tests */}
      <Route path="/mrl-tests" element={<ProtectedRoute><MrlTestsPage /></ProtectedRoute>} />

      {/* AMR */}
      <Route path="/antimicrobial" element={<ProtectedRoute><AmrPage /></ProtectedRoute>} />

      {/* Scan */}
      <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
      <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />

      {/* Misc */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
