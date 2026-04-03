import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import PashuDrishtiLogo from './PashuDrishtiLogo'

export default function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <PashuDrishtiLogo size="md" light />
            <p className="text-sm text-earth-400 font-body leading-relaxed max-w-xs">
              India's integrated platform for digital livestock identification, health monitoring, MRL testing, and antimicrobial usage tracking.
            </p>
            <div className="mt-5 flex gap-3">
              <span className="px-3 py-1 bg-earth-800 rounded-full text-xs text-earth-300 font-body">Government of India</span>
              <span className="px-3 py-1 bg-earth-800 rounded-full text-xs text-earth-300 font-body">DAHD</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Register Farm', href: '/farms/new' },
                { label: 'Animal Records', href: '/animals' },
                { label: 'MRL Testing', href: '/mrl-tests' },
                { label: 'AMR Tracking', href: '/antimicrobial' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-earth-400 hover:text-mustard-400 transition-colors font-body">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-base">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-earth-400 font-body">
                <MapPin size={15} className="text-mustard-500 mt-0.5 shrink-0" />
                Department of Animal Husbandry & Dairying, Krishi Bhawan, New Delhi
              </li>
              <li className="flex items-center gap-2.5 text-sm text-earth-400 font-body">
                <Mail size={15} className="text-mustard-500 shrink-0" />
                support@pashumitra.gov.in
              </li>
              <li className="flex items-center gap-2.5 text-sm text-earth-400 font-body">
                <Phone size={15} className="text-mustard-500 shrink-0" />
                1800-XXX-XXXX (Toll Free)
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-earth-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-earth-500 font-body">
            © 2026 PASHU-DRISHTI. Government of India. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-earth-500 hover:text-mustard-400 font-body">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-earth-500 hover:text-mustard-400 font-body">Terms of Use</Link>
            <a href="https://dahd.nic.in" target="_blank" rel="noreferrer" className="text-xs text-earth-500 hover:text-mustard-400 font-body flex items-center gap-1">
              DAHD <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
