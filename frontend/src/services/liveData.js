const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const safeRound = (value, digits = 1) =>
  typeof value === 'number' ? Number(value.toFixed(digits)) : null

function buildLivestockAdvisory(weather, airQuality) {
  const apparentTemp = weather?.apparent_temperature ?? weather?.temperature_2m ?? 0
  const humidity = weather?.relative_humidity_2m ?? 0
  const wind = weather?.wind_speed_10m ?? 0
  const aqi = airQuality?.us_aqi ?? 0

  if (apparentTemp >= 36 || humidity >= 80) {
    return {
      tone: 'red',
      title: 'High heat-stress risk',
      message: 'Move animals to shade, increase water points, and avoid transport during the hottest hours.',
    }
  }

  if (aqi >= 100) {
    return {
      tone: 'yellow',
      title: 'Air-quality caution',
      message: 'Limit dusty activity, keep sheds ventilated, and watch respiratory-sensitive animals closely.',
    }
  }

  if (wind >= 28) {
    return {
      tone: 'yellow',
      title: 'Wind exposure alert',
      message: 'Secure loose shade cloth, monitor younger stock, and keep feed dry.',
    }
  }

  return {
    tone: 'green',
    title: 'Conditions look stable',
    message: 'Routine feeding, milking, and field movement can continue with standard precautions.',
  }
}

export async function fetchRealtimeFarmInsights({ latitude, longitude }) {
  const query = `latitude=${latitude}&longitude=${longitude}&timezone=auto`

  const [weatherResponse, airResponse] = await Promise.all([
    fetch(`${WEATHER_BASE}?${query}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m`),
    fetch(`${AIR_QUALITY_BASE}?${query}&current=pm10,pm2_5,us_aqi,uv_index`),
  ])

  if (!weatherResponse.ok || !airResponse.ok) {
    throw new Error('Failed to fetch live farm insights')
  }

  const weatherData = await weatherResponse.json()
  const airData = await airResponse.json()

  const weather = weatherData.current || {}
  const airQuality = airData.current || {}

  return {
    weather: {
      temperature: safeRound(weather.temperature_2m),
      feelsLike: safeRound(weather.apparent_temperature),
      humidity: safeRound(weather.relative_humidity_2m, 0),
      rainfall: safeRound(weather.precipitation),
      wind: safeRound(weather.wind_speed_10m),
      time: weather.time || null,
    },
    airQuality: {
      pm10: safeRound(airQuality.pm10),
      pm25: safeRound(airQuality.pm2_5),
      aqi: safeRound(airQuality.us_aqi, 0),
      uv: safeRound(airQuality.uv_index),
      time: airQuality.time || null,
    },
    advisory: buildLivestockAdvisory(weather, airQuality),
  }
}
