import { Link } from 'react-router-dom'

const sizes = {
  sm: {
    mark: 'w-9 h-9',
    title: 'text-sm',
    subtitle: 'text-[10px]',
  },
  md: {
    mark: 'w-10 h-10',
    title: 'text-base',
    subtitle: 'text-[11px]',
  },
  lg: {
    mark: 'w-12 h-12',
    title: 'text-lg',
    subtitle: 'text-xs',
  },
}

export function PashuDrishtiMark({ size = 'md' }) {
  const scale = sizes[size] || sizes.md

  return (
    <div className={`${scale.mark} rounded-2xl overflow-hidden shadow-md shadow-earth-900/10`}>
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill="#2F2114" />
        <path d="M13 32C17.8 22.9 26 18 32 18C38 18 46.2 22.9 51 32C46.2 41.1 38 46 32 46C26 46 17.8 41.1 13 32Z" fill="#F6E8CF" />
        <path d="M18 32C21.7 25.8 26.8 22.5 32 22.5C37.2 22.5 42.3 25.8 46 32C42.3 38.2 37.2 41.5 32 41.5C26.8 41.5 21.7 38.2 18 32Z" fill="#D97706" />
        <circle cx="32" cy="32" r="9" fill="#3F2D1C" />
        <path d="M34.2 16.5L43.8 21.1L39.5 29.8L31.8 24.6L34.2 16.5Z" fill="#4D8B31" />
        <path d="M23.5 45.5C27.6 42.9 30 41.7 32 41.7C34 41.7 36.4 42.9 40.5 45.5C37.8 48.2 35 49.5 32 49.5C29 49.5 26.2 48.2 23.5 45.5Z" fill="#F4B740" />
        <circle cx="35.5" cy="28.5" r="2.8" fill="#FFF5E6" />
      </svg>
    </div>
  )
}

function LogoText({ light = false, size = 'md' }) {
  const scale = sizes[size] || sizes.md
  const titleColor = light ? 'text-white' : 'text-earth-900'
  const accentColor = light ? 'text-mustard-300' : 'text-mustard-600'
  const subtitleColor = light ? 'text-white/65' : 'text-earth-400'

  return (
    <div className="flex flex-col leading-none">
      <span className={`font-display font-bold tracking-tight ${titleColor} ${scale.title}`}>
        PASHU
      </span>
      <span className={`font-display font-bold tracking-tight -mt-0.5 ${accentColor} ${scale.title}`}>
        DRISHTI
      </span>
      <span className={`font-body ${scale.subtitle} mt-1 ${subtitleColor}`}>
        Livestock Intelligence Platform
      </span>
    </div>
  )
}

export default function PashuDrishtiLogo({
  to = '/',
  size = 'md',
  light = false,
  showText = true,
  className = '',
  asLink = true,
}) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <PashuDrishtiMark size={size} />
      {showText && <LogoText light={light} size={size} />}
    </div>
  )

  if (!asLink) return content

  return (
    <Link to={to} className="group inline-flex items-center">
      {content}
    </Link>
  )
}
