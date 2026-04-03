import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Menu, X, ChevronDown, LogOut, User,
  LayoutDashboard, Beef, FlaskConical, Pill, Scan, MapPin
} from 'lucide-react'
import PashuDrishtiLogo from './PashuDrishtiLogo'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Services',
    dropdown: [
      { label: 'Farm Management', href: '/farms', icon: <MapPin size={15} /> },
      { label: 'Animal Records', href: '/animals', icon: <Beef size={15} /> },
      { label: 'MRL Testing', href: '/mrl-tests', icon: <FlaskConical size={15} /> },
      { label: 'AMR Tracking', href: '/antimicrobial', icon: <Pill size={15} /> },
      { label: 'RFID / QR Scan', href: '/scan', icon: <Scan size={15} /> },
    ]
  },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const { user, logout, isAdmin, isVet, isOfficer } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (isAdmin()) return '/dashboard/admin'
    if (isVet()) return '/dashboard/veterinarian'
    if (isOfficer()) return '/dashboard/district'
    return '/dashboard/producer'
  }

  const isActive = (href) => location.pathname === href

  return (
    <nav className="sticky top-0 z-50 glass border-b border-earth-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <PashuDrishtiLogo />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label} className="relative">
                  <button
                    className={`nav-link flex items-center gap-1`}
                    onMouseEnter={() => setDropdownOpen(link.label)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen === link.label && (
                    <div
                      className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-earth-100 py-2 z-50"
                      onMouseEnter={() => setDropdownOpen(link.label)}
                      onMouseLeave={() => setDropdownOpen(null)}
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-700 hover:text-mustard-600 hover:bg-mustard-50 transition-colors font-body"
                        >
                          <span className="text-mustard-500">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={isActive(link.href) ? 'nav-link-active' : 'nav-link'}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="nav-link flex items-center gap-1.5">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-mustard-50 transition-colors">
                    <div className="w-7 h-7 bg-mustard-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-earth-700 font-body">{user.fullName?.split(' ')[0]}</span>
                    <ChevronDown size={13} className="text-earth-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-earth-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-earth-700 hover:bg-mustard-50 font-body">
                      <User size={14} /> My Profile
                    </Link>
                    <hr className="my-1 border-earth-100" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full font-body">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/auth/register" className="btn-primary text-sm py-2">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-mustard-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-earth-100 px-4 py-4 space-y-1">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label}>
                <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider px-3 py-2 font-body">{link.label}</p>
                {link.dropdown.map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-earth-700 hover:text-mustard-600 hover:bg-mustard-50 rounded-lg font-body">
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-body ${isActive(link.href) ? 'text-mustard-600 bg-mustard-50 font-semibold' : 'text-earth-700 hover:bg-mustard-50'}`}>
                {link.label}
              </Link>
            )
          )}
          <hr className="border-earth-100 my-2" />
          {user ? (
            <>
              <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-earth-700 hover:bg-mustard-50 rounded-lg font-body">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-body">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 text-center">Sign In</Link>
              <Link to="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
