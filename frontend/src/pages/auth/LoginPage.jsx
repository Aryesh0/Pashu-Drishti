import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, User, Lock } from 'lucide-react'
import PashuDrishtiLogo from '../../components/common/PashuDrishtiLogo'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('farmer')
  const [authError, setAuthError] = useState('')

  const rolePresets = [
    { key: 'farmer', label: 'Farmer / Producer', username: 'farmer_demo', color: 'border-amber-400 bg-amber-50 text-amber-700' },
    { key: 'vet', label: 'Veterinarian', username: '', color: 'border-blue-400 bg-blue-50 text-blue-700' },
    { key: 'officer', label: 'District Officer', username: '', color: 'border-green-400 bg-green-50 text-green-700' },
    { key: 'admin', label: 'Administrator', username: 'superadmin', color: 'border-red-400 bg-red-50 text-red-700' },
  ]

  const handleTabClick = (preset) => {
    setActiveTab(preset.key)
    setAuthError('')
    if (preset.username) {
      setForm(f => ({ ...f, username: preset.username }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.data)
      toast.success(`Welcome back, ${res.data.data.fullName}!`)
      const roles = res.data.data.roles || []
      if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')) {
        navigate('/dashboard/admin')
      } else if (roles.includes('ROLE_VET_OFFICER')) {
        navigate('/dashboard/veterinarian')
      } else if (roles.includes('ROLE_DISTRICT_OFFICER') || roles.includes('ROLE_STATE_OFFICER')) {
        navigate('/dashboard/district')
      } else {
        navigate('/dashboard/producer')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials'
      setAuthError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grain" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-mustard-500 rounded-full blur-3xl opacity-20" />

        <div className="relative">
          <PashuDrishtiLogo light size="md" />
        </div>

        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            India's Livestock<br />
            <span className="text-mustard-300">Management Platform</span>
          </h2>
          <p className="font-body text-white/70 text-base leading-relaxed max-w-sm">
            Secure, real-time tracking of farm records, animal health, MRL testing and antimicrobial usage across all states.
          </p>
          <div className="space-y-3">
            {['2.8 Crore+ Animals Registered', '14,000+ Farms Onboarded', '28 States Covered'].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-white/80 font-body text-sm">
                <div className="w-5 h-5 bg-mustard-500/30 border border-mustard-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-mustard-400 rounded-full" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="relative font-body text-xs text-white/40">
          Government of India — Department of Animal Husbandry & Dairying
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-earth-900 mb-2">Welcome back</h1>
            <p className="font-body text-earth-500 text-sm">Sign in to your PASHU-DRISHTI account</p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-7">
            {rolePresets.map(r => (
              <button
                key={r.key}
                onClick={() => handleTabClick(r)}
                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-body font-semibold transition-all ${
                  activeTab === r.key ? r.color + ' border-opacity-100' : 'border-earth-200 bg-white text-earth-500 hover:border-earth-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => {
                    setAuthError('')
                    setForm(f => ({ ...f, username: e.target.value }))
                  }}
                />
              </div>
              {authError === 'User does not exist' && <p className="text-xs text-red-600 font-body mt-1.5">User does not exist.</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-mustard-600 hover:text-mustard-700 font-body">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => {
                    setAuthError('')
                    setForm(f => ({ ...f, password: e.target.value }))
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {authError === 'Password is incorrect' && <p className="text-xs text-red-600 font-body mt-1.5">Password is incorrect.</p>}
            </div>

            {authError && authError !== 'User does not exist' && authError !== 'Password is incorrect' && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-body text-red-700">{authError}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center font-body text-sm text-earth-500 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-mustard-600 font-semibold hover:text-mustard-700">
              Register here
            </Link>
          </p>

          <div className="mt-8 p-4 bg-mustard-50 border border-mustard-200 rounded-xl">
            <p className="text-xs font-body font-semibold text-mustard-700 mb-2">Demo Credentials</p>
            <p className="text-xs font-mono text-earth-600">Admin: superadmin / Admin@12345</p>
            <p className="text-xs font-mono text-earth-600">Farmer: farmer_demo / Farmer@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
