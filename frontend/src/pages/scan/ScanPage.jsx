import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CheckCircle, LocateFixed, Loader2, MapPin, QrCode, ScanLine, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { rfidAPI } from '../../services/api'
import { formatDateTime, humanizeEnum } from '../../utils/formatters'

const HEALTH_COLORS = {
  HEALTHY: 'bg-green-50 text-green-700',
  SICK: 'bg-red-50 text-red-700',
  UNDER_TREATMENT: 'bg-blue-50 text-blue-700',
  QUARANTINED: 'bg-red-50 text-red-700',
  RECOVERED: 'bg-green-50 text-green-700',
}

export default function ScanPage() {
  const [mode, setMode] = useState('camera')
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualTag, setManualTag] = useState('')
  const [scanLocation, setScanLocation] = useState('')
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null, status: 'Location not requested' })
  const [scannedAnimal, setScannedAnimal] = useState(null)
  const [history, setHistory] = useState([])
  const scannerRef = useRef(null)

  const loadHistory = async (animalId) => {
    try {
      const response = await rfidAPI.getAnimalHistory(animalId, 0, 5)
      setHistory(response.data?.data?.content || [])
    } catch {
      setHistory([])
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setCoordinates({ latitude: null, longitude: null, status: 'Geolocation unavailable on this device' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        status: 'Using current device location',
      }),
      () => setCoordinates({ latitude: null, longitude: null, status: 'Location permission denied' })
    )
  }

  useEffect(() => {
    requestLocation()
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const processScan = async (value) => {
    setLoading(true)
    setHistory([])
    try {
      const response = await rfidAPI.scan({
        rfidTagNumber: value.trim(),
        scanLocation: scanLocation || 'Field identification scan',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      })
      const payload = response.data?.data
      if (!payload?.found || !payload.animal) {
        toast.error(payload?.message || 'No animal found for this tag')
        setScannedAnimal(null)
        return
      }

      setScannedAnimal(payload.animal)
      await loadHistory(payload.animal.id)
      toast.success('Animal identified successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process scan')
      setScannedAnimal(null)
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    setScanning(true)
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await stopCamera()
          processScan(decodedText)
        },
        () => {}
      )
    } catch {
      setScanning(false)
      toast.error('Unable to start the camera scanner')
    }
  }

  const stopCamera = async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
    } catch {
      // ignore
    } finally {
      scannerRef.current = null
      setScanning(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const scanner = new Html5Qrcode('qr-file-reader')
      const decoded = await scanner.scanFile(file, true)
      await scanner.clear()
      processScan(decoded)
    } catch {
      setLoading(false)
      toast.error('Could not read a QR code from that image')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">RFID / QR Scan</h1>
          <p className="font-body text-sm text-earth-500 mt-1">Identify an animal in real time and create a live scan log with location context.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { key: 'camera', label: 'Camera Scan', icon: <Camera size={18} /> },
            { key: 'upload', label: 'Upload QR', icon: <Upload size={18} /> },
            { key: 'manual', label: 'Enter Tag', icon: <ScanLine size={18} /> },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMode(item.key)
                setScannedAnimal(null)
                stopCamera()
              }}
              className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 ${
                mode === item.key ? 'border-mustard-500 bg-mustard-50 text-mustard-700' : 'border-earth-200 bg-white text-earth-500'
              }`}
            >
              {item.icon}
              <span className="font-body text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="card space-y-4">
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="label">Scan Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                <input className="input-field pl-10" value={scanLocation} onChange={(event) => setScanLocation(event.target.value)} placeholder="e.g. Main shed, gate, milking station" />
              </div>
            </div>
            <button type="button" onClick={requestLocation} className="btn-secondary inline-flex items-center gap-2">
              <LocateFixed size={15} /> Refresh Location
            </button>
          </div>
          <p className="font-body text-xs text-earth-500">
            {coordinates.status}
            {coordinates.latitude && coordinates.longitude
              ? ` (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`
              : ''}
          </p>
        </div>

        {mode === 'camera' && (
          <div className="card space-y-4">
            <div id="qr-reader" className={`rounded-2xl overflow-hidden bg-black ${scanning ? 'min-h-[320px]' : 'hidden'}`} />
            {!scanning ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-earth-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <QrCode size={34} className="text-earth-400" />
                </div>
                <p className="font-body text-sm text-earth-500 mb-5">Use the device camera to scan a printed QR code in the field.</p>
                <button type="button" onClick={startCamera} className="btn-primary inline-flex items-center gap-2">
                  <Camera size={16} /> Start Camera
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl bg-earth-50 px-4 py-3">
                <p className="font-body text-sm text-earth-600">Scanning now. Hold the QR code steady in frame.</p>
                <button type="button" onClick={stopCamera} className="btn-secondary inline-flex items-center gap-2">
                  <X size={15} /> Stop
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && (
          <div className="card">
            <div id="qr-file-reader" className="hidden" />
            <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-earth-200 rounded-2xl cursor-pointer hover:border-mustard-400 hover:bg-mustard-50 transition-colors">
              {loading ? <Loader2 size={32} className="animate-spin text-mustard-500 mb-3" /> : <Upload size={32} className="text-earth-300 mb-3" />}
              <p className="font-body text-sm font-semibold text-earth-700">Upload an image that contains the animal QR code</p>
              <p className="font-body text-xs text-earth-400 mt-1">PNG, JPG, and WebP are supported</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {mode === 'manual' && (
          <div className="card space-y-4">
            <p className="font-body text-sm text-earth-500">Enter an ICAR tag or RFID tag when a QR code is unavailable.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="input-field font-mono flex-1"
                value={manualTag}
                onChange={(event) => setManualTag(event.target.value.toUpperCase())}
                placeholder="IN2700104521 or RFID tag"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && manualTag.trim()) processScan(manualTag)
                }}
              />
              <button type="button" className="btn-primary inline-flex items-center justify-center gap-2" onClick={() => processScan(manualTag)} disabled={!manualTag.trim()}>
                <ScanLine size={15} /> Find Animal
              </button>
            </div>
          </div>
        )}

        {loading && mode !== 'upload' && (
          <div className="card">
            <LoadingSpinner fullPage />
          </div>
        )}

        {scannedAnimal && !loading && (
          <div className="space-y-6">
            <div className="card border-2 border-mustard-300 bg-mustard-50">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <p className="font-display text-2xl font-bold text-earth-900">{scannedAnimal.name || scannedAnimal.tagNumber}</p>
                  <p className="font-mono text-sm text-earth-500 mt-1">{scannedAnimal.tagNumber}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${HEALTH_COLORS[scannedAnimal.healthStatus] || 'bg-earth-100 text-earth-700'}`}>
                      {humanizeEnum(scannedAnimal.healthStatus)}
                    </span>
                    <span className="badge badge-blue">{humanizeEnum(scannedAnimal.species)}</span>
                    <span className="badge badge-gray">{scannedAnimal.farmName}</span>
                  </div>
                </div>
                <Link to={`/animals/${scannedAnimal.id}`} className="btn-primary inline-flex items-center gap-2">
                  <CheckCircle size={15} /> Open Full Record
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {[
                  ['Breed', scannedAnimal.breed],
                  ['Gender', humanizeEnum(scannedAnimal.gender)],
                  ['Purpose', humanizeEnum(scannedAnimal.purpose)],
                  ['Last Scan', formatDateTime(scannedAnimal.lastRfidScanTime)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white p-4">
                    <p className="font-body text-xs text-earth-400">{label}</p>
                    <p className="font-body text-sm font-semibold text-earth-800 mt-1">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Recent scan history</h2>
              {!history.length ? (
                <p className="font-body text-sm text-earth-400">This animal has no recent RFID scan history yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="rounded-2xl bg-earth-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-body text-sm font-semibold text-earth-800">{entry.scanLocation || 'Location not recorded'}</p>
                          <p className="font-body text-xs text-earth-500 mt-1">{humanizeEnum(entry.scanPurpose)}</p>
                        </div>
                        <p className="font-body text-xs text-earth-400">{formatDateTime(entry.scannedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
