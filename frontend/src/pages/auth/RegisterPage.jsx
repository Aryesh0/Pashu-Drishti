import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, User, Mail, Phone, Lock, Beef, Stethoscope, Building2, Shield } from 'lucide-react'
import PashuDrishtiLogo from '../../components/common/PashuDrishtiLogo'
import { STATE_NAMES, getDistricts, getStateCode } from '../../utils/indiaData'

const roles = [
  { key: 'ROLE_FARMER', label: 'Farmer / Producer', icon: <Beef size={18} />, desc: 'Register and manage your farm and livestock', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { key: 'ROLE_VET_OFFICER', label: 'Veterinarian', icon: <Stethoscope size={18} />, desc: 'Record treatments, vaccinations and MRL tests', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { key: 'ROLE_DISTRICT_OFFICER', label: 'District Officer', icon: <Building2 size={18} />, desc: 'Monitor farms and compliance in your district', color: 'border-green-400 bg-green-50 text-green-700' },
  { key: 'ROLE_STATE_OFFICER', label: 'State Officer', icon: <Shield size={18} />, desc: 'State-level oversight and policy management', color: 'border-purple-400 bg-purple-50 text-purple-700' },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('ROLE_FARMER')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    fullName: '', mobileNumber: '', stateCode: '', districtCode: '',
  })

  const districts = useMemo(() => getDistricts(selectedState), [selectedState])
  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z\d\s]/.test(form.password),
    noSpaces: !/\s/.test(form.password),
  }

  const set = (k) => (e) => {
    const value = e.target.value
    setForm(f => ({ ...f, [k]: value }))
    setFieldErrors((current) => ({ ...current, [k]: '' }))
  }

  const handleStateChange = (e) => {
    const stateName = e.target.value
    setSelectedState(stateName)
    setForm((current) => ({
      ...current,
      stateCode: getStateCode(stateName),
      districtCode: '',
    }))
    setFieldErrors((current) => ({ ...current, stateCode: '', districtCode: '' }))
  }

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value
    setForm((current) => ({
      ...current,
      districtCode,
    }))
    setFieldErrors((current) => ({ ...current, districtCode: '' }))
  }

  const validateForm = () => {
    const errors = {}

    if (form.mobileNumber && !/^[6-9]\d{9}$/.test(form.mobileNumber)) {
      errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number'
    }

    if (selectedRole !== 'ROLE_SUPER_ADMIN' && !form.stateCode) {
      errors.stateCode = 'Please select a state'
    }

    if (selectedState && !form.districtCode) {
      errors.districtCode = 'Please select a district'
    }

    if (Object.values(passwordChecks).includes(false)) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, special character, and no spaces'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const res = await authAPI.register({ ...form, roles: [selectedRole] })
      login(res.data.data)
      toast.success('Account created successfully!')
      navigate('/dashboard/producer')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      const data = err.response?.data?.data
      if (data && typeof data === 'object') {
        setFieldErrors(data)
        Object.values(data).forEach(v => toast.error(v))
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex mb-6">
            <PashuDrishtiLogo />
          </div>
          <h1 className="font-display text-3xl font-bold text-earth-900 mb-2">Create your account</h1>
          <p className="font-body text-earth-500 text-sm">Join India's digital livestock management platform</p>
        </div>

        <div className="card shadow-md">

          {/* Role Selection */}
          <div className="mb-7">
            <p className="label text-base mb-3">I am registering as</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button key={r.key} type="button" onClick={() => setSelectedRole(r.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRole === r.key ? r.color + ' shadow-sm' : 'border-earth-200 bg-white hover:border-earth-300'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={selectedRole === r.key ? '' : 'text-earth-400'}>{r.icon}</span>
                    <span className={`font-body font-semibold text-sm ${selectedRole === r.key ? '' : 'text-earth-700'}`}>{r.label}</span>
                  </div>
                  <p className={`font-body text-xs ${selectedRole === r.key ? 'opacity-70' : 'text-earth-400'}`}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input className="input-field pl-10" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
              </div>
            </div>

            {/* Username + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Username</label>
                <input className="input-field" placeholder="username" value={form.username} onChange={set('username')} required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                  <input type="email" className="input-field pl-10" placeholder="email@example.com" value={form.email} onChange={set('email')} required />
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="label">Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input className="input-field pl-10" placeholder="10-digit mobile number" value={form.mobileNumber} onChange={set('mobileNumber')} required maxLength={10} />
              </div>
              {fieldErrors.mobileNumber && <p className="text-xs text-red-600 font-body mt-1.5">{fieldErrors.mobileNumber}</p>}
            </div>

            {/* State + District */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">State Code</label>
                <select className="input-field" value={selectedState} onChange={handleStateChange}>
                  <option value="">-- Select State / Code --</option>
                  {STATE_NAMES.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName} ({getStateCode(stateName)})
                    </option>
                  ))}
                </select>
                {fieldErrors.stateCode && <p className="text-xs text-red-600 font-body mt-1.5">{fieldErrors.stateCode}</p>}
              </div>
              <div>
                <label className="label">District Code</label>
                <select className="input-field" value={form.districtCode} onChange={handleDistrictChange} disabled={!selectedState}>
                  <option value="">
                    {selectedState ? '-- Select District / Code --' : '-- Select State First --'}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name} ({district.code})
                    </option>
                  ))}
                </select>
                {fieldErrors.districtCode && <p className="text-xs text-red-600 font-body mt-1.5">{fieldErrors.districtCode}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="Min 8 chars, uppercase, number, special char"
                  value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-xs text-earth-400 font-body mt-1.5">
                Must contain uppercase, lowercase, number, special character, and no spaces.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  ['8+ characters', passwordChecks.length],
                  ['Uppercase', passwordChecks.upper],
                  ['Lowercase', passwordChecks.lower],
                  ['Number', passwordChecks.number],
                  ['Special character', passwordChecks.special],
                  ['No spaces', passwordChecks.noSpaces],
                ].map(([label, passed]) => (
                  <span key={label} className={`text-xs font-body ${passed ? 'text-green-600' : 'text-earth-400'}`}>{label}</span>
                ))}
              </div>
              {fieldErrors.password && <p className="text-xs text-red-600 font-body mt-1.5">{fieldErrors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-body text-sm text-earth-500 mt-5">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-mustard-600 font-semibold hover:text-mustard-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
