import { useEffect, useState } from 'react'
import { CloudSun, Droplets, Wind, ShieldAlert, Gauge } from 'lucide-react'
import { fetchRealtimeFarmInsights } from '../../services/liveData'
import { formatCoordinate, formatDateTime } from '../../utils/formatters'

const toneStyles = {
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-amber-50 border-amber-200 text-amber-700',
  red: 'bg-red-50 border-red-200 text-red-700',
}

export default function LiveFarmInsights({ latitude, longitude, title = 'Live Farm Conditions', subtitle }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(Boolean(latitude && longitude))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false)
      setInsights(null)
      return
    }

    let active = true
    setLoading(true)
    setError('')

    fetchRealtimeFarmInsights({ latitude, longitude })
      .then((data) => {
        if (active) setInsights(data)
      })
      .catch(() => {
        if (active) setError('Live weather and air-quality insights are temporarily unavailable.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [latitude, longitude])

  if (!latitude || !longitude) {
    return (
      <div className="card border-dashed">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-earth-100 flex items-center justify-center text-earth-500">
            <CloudSun size={20} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-earth-900">{title}</h3>
            <p className="font-body text-sm text-earth-500 mt-1">
              Add farm coordinates to unlock real-time weather and air-quality insights for this location.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display font-semibold text-earth-900">{title}</h3>
          <p className="font-body text-sm text-earth-500 mt-1">
            {subtitle || `Coordinates: ${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`}
          </p>
        </div>
        {insights?.weather?.time && (
          <span className="badge badge-gray">
            Updated {formatDateTime(insights.weather.time)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-xl bg-earth-50 animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </div>
      ) : insights ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-earth-50 p-4">
              <p className="font-body text-xs text-earth-500 mb-1">Temperature</p>
              <p className="font-display text-2xl font-bold text-earth-900">{insights.weather.temperature}°C</p>
              <p className="font-body text-xs text-earth-400 mt-1">Feels like {insights.weather.feelsLike}°C</p>
            </div>
            <div className="rounded-xl bg-earth-50 p-4">
              <p className="font-body text-xs text-earth-500 mb-1">Humidity</p>
              <p className="font-display text-2xl font-bold text-earth-900 flex items-center gap-1">
                <Droplets size={16} className="text-blue-500" />
                {insights.weather.humidity}%
              </p>
              <p className="font-body text-xs text-earth-400 mt-1">Rainfall {insights.weather.rainfall || 0} mm</p>
            </div>
            <div className="rounded-xl bg-earth-50 p-4">
              <p className="font-body text-xs text-earth-500 mb-1">Wind</p>
              <p className="font-display text-2xl font-bold text-earth-900 flex items-center gap-1">
                <Wind size={16} className="text-cyan-600" />
                {insights.weather.wind}
              </p>
              <p className="font-body text-xs text-earth-400 mt-1">km/h at 10 m</p>
            </div>
            <div className="rounded-xl bg-earth-50 p-4">
              <p className="font-body text-xs text-earth-500 mb-1">Air Quality</p>
              <p className="font-display text-2xl font-bold text-earth-900 flex items-center gap-1">
                <Gauge size={16} className="text-mustard-600" />
                {insights.airQuality.aqi ?? 'N/A'}
              </p>
              <p className="font-body text-xs text-earth-400 mt-1">
                PM2.5 {insights.airQuality.pm25 ?? 'N/A'} | PM10 {insights.airQuality.pm10 ?? 'N/A'}
              </p>
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-3 ${toneStyles[insights.advisory.tone] || toneStyles.green}`}>
            <p className="font-body font-semibold text-sm flex items-center gap-2">
              <ShieldAlert size={16} />
              {insights.advisory.title}
            </p>
            <p className="font-body text-sm mt-1">{insights.advisory.message}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
