import { Mail, MapPin, Phone, ShieldCheck, Siren, MessagesSquare } from 'lucide-react'

const channels = [
  {
    title: 'Platform Support',
    value: 'support@pashudrishti.in',
    href: 'mailto:support@pashudrishti.in',
    icon: <Mail size={18} />,
    description: 'Login issues, data corrections, access requests, and product support.',
  },
  {
    title: 'Helpdesk Line',
    value: '+91 1800 212 7744',
    href: 'tel:+9118002127744',
    icon: <Phone size={18} />,
    description: 'Weekday support for onboarding, troubleshooting, and route-specific guidance.',
  },
  {
    title: 'Programme Office',
    value: 'Krishi Bhawan, New Delhi',
    href: 'https://dahd.gov.in',
    icon: <MapPin size={18} />,
    description: 'Department of Animal Husbandry and Dairying coordination office.',
  },
]

const escalation = [
  'Use the platform support email for access, account, and data integrity issues.',
  'Use the helpdesk line when field teams need fast coordination during active farm operations.',
  'Escalate residue test failures or district-wide treatment compliance concerns through the district dashboard and audit trail.',
]

export default function ContactPage() {
  return (
    <div className="space-y-12 py-8 sm:py-12">
      <section className="card">
        <p className="text-sm font-body font-semibold uppercase tracking-[0.2em] text-mustard-600">Contact</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-earth-900">Reach the team that keeps the platform operational.</h1>
        <p className="mt-4 max-w-3xl font-body text-lg text-earth-600 leading-relaxed">
          Pashu Drishti support is structured around real operations: account access, field data quality, compliance escalations,
          and programme coordination. Use the channel that best matches the urgency of the issue.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        {channels.map((channel) => (
          <a
            key={channel.title}
            href={channel.href}
            target={channel.href.startsWith('http') ? '_blank' : undefined}
            rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
            className="card hover:-translate-y-1 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-mustard-50 text-mustard-600 flex items-center justify-center">
              {channel.icon}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-earth-900">{channel.title}</h2>
            <p className="mt-2 font-body text-base font-semibold text-earth-700">{channel.value}</p>
            <p className="mt-3 font-body text-sm text-earth-500 leading-relaxed">{channel.description}</p>
          </a>
        ))}
      </section>

      <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Siren size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-earth-900">Operational escalation path</h2>
              <p className="font-body text-sm text-earth-500">For active farm monitoring and compliance follow-through.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {escalation.map((item, index) => (
              <div key={item} className="rounded-2xl bg-earth-50 p-4 flex gap-3">
                <div className="w-7 h-7 rounded-full bg-mustard-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <p className="font-body text-sm text-earth-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-earth-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-mustard-300 flex items-center justify-center">
              <MessagesSquare size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">When to contact support</h2>
              <p className="font-body text-sm text-white/60">High-signal cases we can help resolve fastest.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              'User activation and role changes for vets, officers, and administrators.',
              'Farm ownership corrections, duplicate tag conflicts, or scan mismatches.',
              'MRL or AMR audit discrepancies that need traceable system review.',
              'District deployment support for new onboarding drives or field pilots.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-body text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-mustard-300/20 bg-mustard-500/10 px-4 py-3">
            <p className="font-body text-sm text-mustard-100 flex items-center gap-2">
              <ShieldCheck size={16} />
              Always include farm ID, animal tag, or test reference where possible so the team can trace the issue quickly.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
