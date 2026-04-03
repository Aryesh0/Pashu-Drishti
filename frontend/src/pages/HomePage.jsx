import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Shield, Beef, FlaskConical, Pill,
  Scan, BarChart3, CheckCircle, Users, MapPin,
  TrendingUp, Award, Zap
} from 'lucide-react'
import { publicAPI } from '../services/api'
import { formatCompactNumber } from '../utils/formatters'

const features = [
  {
    icon: <Beef size={24} />,
    title: 'Farm & Animal Management',
    desc: 'Register farms, track individual livestock with ICAR tag numbers, maintain complete health and breeding records.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <FlaskConical size={24} />,
    title: 'MRL Residue Testing',
    desc: 'Submit and track Maximum Residue Limit test results for milk, meat and eggs. Automated pass/fail based on FSSAI standards.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Pill size={24} />,
    title: 'Antimicrobial Tracking',
    desc: 'Monitor antibiotic usage across farms. Flag WHO Critically Important Antibiotics and manage withdrawal periods.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: <Scan size={24} />,
    title: 'RFID / QR Identification',
    desc: 'Instantly identify animals using QR code scanning from any smartphone. No dedicated hardware required.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Real-time Analytics',
    desc: 'Comprehensive dashboards for farmers, veterinarians, district officers and state administrators.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Shield size={24} />,
    title: 'Role-Based Access',
    desc: 'Secure access control for farmers, vets, district officers, state officers and administrators.',
    color: 'bg-mustard-50 text-mustard-600',
  },
]

const roles = [
  { title: 'Farmer / Producer', desc: 'Manage your farm, animals, and track health records', href: '/dashboard/producer', color: 'border-amber-300 hover:bg-amber-50' },
  { title: 'Veterinarian', desc: 'Record treatments, vaccinations and MRL test results', href: '/dashboard/veterinarian', color: 'border-blue-300 hover:bg-blue-50' },
  { title: 'District Officer', desc: 'Monitor all farms and compliance in your district', href: '/dashboard/district', color: 'border-green-300 hover:bg-green-50' },
  { title: 'Administrator', desc: 'Full portal management and system-wide analytics', href: '/dashboard/admin', color: 'border-red-300 hover:bg-red-50' },
]

export default function HomePage() {
  const [platformSummary, setPlatformSummary] = useState(null)

  useEffect(() => {
    publicAPI.getPlatformSummary()
      .then((response) => setPlatformSummary(response.data.data))
      .catch(() => {})
  }, [])

  const stats = [
    { value: platformSummary ? formatCompactNumber(platformSummary.totalAnimals) : 'Live', label: 'Animals Registered', icon: <Beef size={20} /> },
    { value: platformSummary ? formatCompactNumber(platformSummary.totalFarms) : 'Live', label: 'Farms Onboarded', icon: <MapPin size={20} /> },
    { value: platformSummary ? `${platformSummary.mrlPassRate}%` : 'Live', label: 'MRL Pass Rate', icon: <FlaskConical size={20} /> },
    { value: platformSummary ? formatCompactNumber(platformSummary.activeUsers) : 'Live', label: 'Active Users', icon: <Shield size={20} /> },
  ]

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grain" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-mustard-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-mustard-400 rounded-full blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-mustard-400 rounded-full animate-pulse-slow" />
              <span className="text-sm font-body text-mustard-200">Government of India — DAHD Initiative</span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6">
              PASHU-DRISHTI
              <span className="block text-mustard-300 text-3xl lg:text-4xl font-semibold mt-2">
                Digital Livestock Management
              </span>
            </h1>

            <p className="font-body text-lg text-white/80 leading-relaxed mb-10 max-w-2xl">
              India's integrated platform for livestock identification, health monitoring, 
              MRL residue testing, and antimicrobial usage tracking. Empowering farmers, 
              veterinarians and policymakers with real-time data.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/auth/register" className="inline-flex items-center gap-2 bg-mustard-500 hover:bg-mustard-400 text-white font-body font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-mustard-500/30 hover:-translate-y-0.5">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-body font-semibold px-7 py-3.5 rounded-xl transition-all">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-mustard-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center text-white">
                <div className="flex justify-center mb-2 opacity-80">{s.icon}</div>
                <p className="font-display text-3xl font-bold">{s.value}</p>
                <p className="font-body text-sm text-mustard-100 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-mustard-600 font-body font-semibold text-sm uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="section-title text-4xl mb-4">Everything You Need</h2>
            <p className="text-earth-500 font-body max-w-xl mx-auto">
              A comprehensive suite of tools for end-to-end livestock management across India's animal husbandry sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-earth-900 text-lg mb-2">{f.title}</h3>
                <p className="font-body text-sm text-earth-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Portals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-mustard-600 font-body font-semibold text-sm uppercase tracking-wider mb-3">Role-Based Portals</p>
            <h2 className="section-title text-4xl mb-4">Built For Every Stakeholder</h2>
            <p className="text-earth-500 font-body max-w-xl mx-auto">
              Dedicated dashboards and tools tailored to the specific needs of each role in the livestock ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r, i) => (
              <Link key={i} to={r.href}
                className={`card border-2 ${r.color} transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}>
                <h3 className="font-display font-semibold text-earth-900 mb-2">{r.title}</h3>
                <p className="font-body text-sm text-earth-500 leading-relaxed mb-4">{r.desc}</p>
                <span className="text-mustard-600 text-sm font-body font-medium flex items-center gap-1">
                  View Dashboard <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title text-4xl mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', icon: <Users size={22} />, title: 'Register', desc: 'Create your account as a farmer, vet, or officer' },
              { step: '02', icon: <MapPin size={22} />, title: 'Add Farm', desc: 'Register your farm with location and infrastructure details' },
              { step: '03', icon: <Beef size={22} />, title: 'Tag Animals', desc: 'Register each animal with ICAR tag and generate QR codes' },
              { step: '04', icon: <TrendingUp size={22} />, title: 'Track & Monitor', desc: 'Monitor health, tests, treatments and compliance in real time' },
            ].map((s, i) => (
              <div key={i} className="card text-center relative">
                <div className="w-10 h-10 bg-mustard-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-display font-bold">
                  {s.step}
                </div>
                <div className="flex justify-center text-mustard-500 mb-3">{s.icon}</div>
                <h3 className="font-display font-semibold text-earth-900 mb-2">{s.title}</h3>
                <p className="font-body text-sm text-earth-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grain" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Award size={40} className="text-mustard-400 mx-auto mb-5" />
          <h2 className="font-display text-4xl font-bold mb-5">
            Ready to Transform Livestock Management?
          </h2>
          <p className="font-body text-white/75 mb-8 text-lg">
            Join thousands of farmers, veterinarians and officers already using PASHU-DRISHTI.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth/register" className="inline-flex items-center gap-2 bg-mustard-500 hover:bg-mustard-400 text-white font-body font-semibold px-8 py-4 rounded-xl transition-all shadow-lg">
              Register Now — It's Free <ArrowRight size={18} />
            </Link>
            <Link to="/auth/login" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-body font-semibold px-8 py-4 rounded-xl transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
