import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Activity, Beef, FlaskConical, MapPin, Pill, Scan, Shield } from 'lucide-react'
import PashuDrishtiLogo from '../../components/common/PashuDrishtiLogo'
import { publicAPI } from '../../services/api'
import { formatCompactNumber } from '../../utils/formatters'

const pillars = [
  {
    title: 'Trace Every Animal',
    description: 'Tie each animal record to a farm, ICAR tag, QR identity, treatment history, and scan trail.',
    icon: <Beef size={20} />,
  },
  {
    title: 'Protect Food Safety',
    description: 'Capture MRL tests, identify failed residue cases quickly, and document corrective action with an audit trail.',
    icon: <FlaskConical size={20} />,
  },
  {
    title: 'Control AMR Risk',
    description: 'Track drug usage, withdrawal periods, and critically important antibiotic exposure before it becomes a compliance issue.',
    icon: <Pill size={20} />,
  },
  {
    title: 'Make Field Work Faster',
    description: 'Let farmers, vets, and officers reach the same records from dashboards, mobile scans, and role-specific review tools.',
    icon: <Scan size={20} />,
  },
]

const roles = [
  {
    title: 'Farmer / Producer',
    description: 'Register farms and animals, maintain day-to-day records, and access QR-linked livestock history.',
    href: '/dashboard/producer',
    color: 'border-amber-200 bg-amber-50',
  },
  {
    title: 'Veterinarian',
    description: 'Document vaccinations, treatments, MRL sample collection, and active withdrawal periods.',
    href: '/dashboard/veterinarian',
    color: 'border-blue-200 bg-blue-50',
  },
  {
    title: 'District Officer',
    description: 'Monitor field compliance, failed residue cases, and district-wide farm health and surveillance trends.',
    href: '/dashboard/district',
    color: 'border-green-200 bg-green-50',
  },
  {
    title: 'Administrator',
    description: 'Manage users, audit activity, platform-wide analytics, and cross-role operational visibility.',
    href: '/dashboard/admin',
    color: 'border-red-200 bg-red-50',
  },
]

export default function AboutPage() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    publicAPI.getPlatformSummary()
      .then((response) => setSummary(response.data.data))
      .catch(() => {})
  }, [])

  const stats = [
    { label: 'Registered Farms', value: summary?.totalFarms, icon: <MapPin size={18} /> },
    { label: 'Tracked Animals', value: summary?.totalAnimals, icon: <Beef size={18} /> },
    { label: 'MRL Pass Rate', value: summary ? `${summary.mrlPassRate}%` : null, icon: <FlaskConical size={18} /> },
    { label: 'Active Users', value: summary?.activeUsers, icon: <Shield size={18} /> },
  ]

  return (
    <div className="space-y-16 py-8 sm:py-12">
      <section className="bg-white rounded-[2rem] border border-earth-100 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
          <div className="p-8 sm:p-10 lg:p-12">
            <PashuDrishtiLogo size="lg" asLink={false} />
            <p className="mt-8 text-sm font-body font-semibold uppercase tracking-[0.24em] text-mustard-600">
              About The Platform
            </p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold text-earth-900 leading-tight">
              Built to turn livestock oversight into a connected, field-ready system.
            </h1>
            <p className="mt-5 font-body text-base sm:text-lg text-earth-600 leading-relaxed max-w-2xl">
              Pashu Drishti brings farm registration, animal identity, MRL surveillance, AMR tracking, and QR or RFID lookup
              into one working operational platform. It is designed for real coordination between farmers, vets, district teams,
              and administrators instead of separate data silos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth/register" className="btn-primary inline-flex items-center gap-2">
                Start Using The Platform <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-secondary inline-flex items-center gap-2">
                Contact The Support Team
              </Link>
            </div>
          </div>

          <div className="bg-earth-900 text-white p-8 sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-body">
              <Activity size={15} className="text-mustard-300" />
              Live platform snapshot
            </div>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-mustard-300">
                    {stat.icon}
                  </div>
                  <p className="mt-4 font-display text-3xl font-bold">
                    {typeof stat.value === 'number' ? formatCompactNumber(stat.value) : stat.value || 'Loading'}
                  </p>
                  <p className="mt-1 font-body text-sm text-white/65">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-mustard-500/15 border border-mustard-300/20 p-5">
              <p className="font-body text-sm text-mustard-100">
                The live summary comes directly from the platform backend, so the public pages reflect current operational counts
                instead of hard-coded marketing figures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8">
          <p className="text-sm font-body font-semibold uppercase tracking-[0.2em] text-mustard-600">What It Solves</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-earth-900">Operational pillars for a full livestock lifecycle</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="card">
              <div className="w-11 h-11 rounded-2xl bg-mustard-50 text-mustard-600 flex items-center justify-center">
                {pillar.icon}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-earth-900">{pillar.title}</h3>
              <p className="mt-2 font-body text-sm text-earth-500 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="mb-8">
          <p className="text-sm font-body font-semibold uppercase tracking-[0.2em] text-mustard-600">Role Workspaces</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-earth-900">Each stakeholder gets a usable workspace, not just access.</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Link key={role.title} to={role.href} className={`rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${role.color}`}>
              <h3 className="font-display text-xl font-semibold text-earth-900">{role.title}</h3>
              <p className="mt-2 font-body text-sm text-earth-600 leading-relaxed">{role.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-body font-semibold text-mustard-700">
                Open role portal <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
