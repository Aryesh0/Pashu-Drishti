import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Beef, FlaskConical, Pill, Scan,
  Users, FileText, LogOut, Menu, X, Bell, ChevronRight,
  MapPin, Shield, Stethoscope, BarChart3
} from 'lucide-react'
import PashuDrishtiLogo from '../common/PashuDrishtiLogo'

const adminLinks = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Farms', href: '/farms', icon: <MapPin size={18} /> },
  { label: 'Animals', href: '/animals', icon: <Beef size={18} /> },
  { label: 'MRL Tests', href: '/mrl-tests', icon: <FlaskConical size={18} /> },
  { label: 'AMR Usage', href: '/antimicrobial', icon: <Pill size={18} /> },
  { label: 'RFID / QR Scan', href: '/scan', icon: <Scan size={18} /> },
  { label: 'Users', href: '/admin/users', icon: <Users size={18} /> },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText size={18} /> },
]

const vetLinks = [
  { label: 'Dashboard', href: '/dashboard/veterinarian', icon: <LayoutDashboard size={18} /> },
  { label: 'Animals', href: '/animals', icon: <Beef size={18} /> },
  { label: 'MRL Tests', href: '/mrl-tests', icon: <FlaskConical size={18} /> },
  { label: 'AMR Usage', href: '/antimicrobial', icon: <Pill size={18} /> },
  { label: 'RFID / QR Scan', href: '/scan', icon: <Scan size={18} /> },
]

const farmerLinks = [
  { label: 'Dashboard', href: '/dashboard/producer', icon: <LayoutDashboard size={18} /> },
  { label: 'My Farms', href: '/farms', icon: <MapPin size={18} /> },
  { label: 'My Animals', href: '/animals', icon: <Beef size={18} /> },
  { label: 'MRL Tests', href: '/mrl-tests', icon: <FlaskConical size={18} /> },
  { label: 'RFID / QR Scan', href: '/scan', icon: <Scan size={18} /> },
]

const districtLinks = [
  { label: 'Dashboard', href: '/dashboard/district', icon: <LayoutDashboard size={18} /> },
  { label: 'Farms', href: '/farms', icon: <MapPin size={18} /> },
  { label: 'Animals', href: '/animals', icon: <Beef size={18} /> },
  { label: 'MRL Tests', href: '/mrl-tests', icon: <FlaskConical size={18} /> },
  { label: 'AMR Usage', href: '/antimicrobial', icon: <Pill size={18} /> },
  { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={18} /> },
]

export default function DashboardLayout({ children }) {
  const { user, logout, isAdmin, isVet, isOfficer } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const getLinks = () => {
    if (isAdmin()) return adminLinks
    if (isVet()) return vetLinks
    if (isOfficer()) return districtLinks
    return farmerLinks
  }

  const getRoleLabel = () => {
    if (isAdmin()) return 'Administrator'
    if (isVet()) return 'Veterinarian'
    if (isOfficer()) return 'District Officer'
    return 'Farmer / Producer'
  }

  const getRoleColor = () => {
    if (isAdmin()) return 'bg-red-100 text-red-700'
    if (isVet()) return 'bg-blue-100 text-blue-700'
    if (isOfficer()) return 'bg-green-100 text-green-700'
    return 'bg-amber-100 text-amber-700'
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const links = getLinks()

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-earth-100">
        <PashuDrishtiLogo size="sm" />
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-earth-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mustard-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-body font-semibold text-earth-900 text-sm truncate">{user?.fullName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(link => (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setSidebarOpen(false)}
            className={location.pathname === link.href ? 'sidebar-link-active' : 'sidebar-link'}
          >
            {link.icon}
            {link.label}
            {location.pathname === link.href && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-earth-100">
        <button onClick={handleLogout}
          className="sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50 w-full">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-earth-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-earth-100 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-white h-full shadow-xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-earth-100 px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-earth-100">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-body text-earth-400">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-earth-100 relative">
              <Bell size={18} className="text-earth-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mustard-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-mustard-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{user?.fullName?.charAt(0)}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
