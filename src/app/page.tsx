'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Beaker, Search, AlertTriangle, Calendar, MapPin,
  Camera, X, ChevronLeft, ChevronRight, Loader2, Brain,
  Activity, TrendingUp, ShieldCheck, AlertOctagon,
  Crown, Scale, BarChart3, RefreshCw, Database, Weight, Thermometer, Droplets
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Tipi
interface Hive {
  id: string
  name: string
  location: string | null
  notes: string | null
  beeCount: number | null
  status: string
  lastInspection: Date | null
  createdAt: Date
}

interface Inspection {
  id: string
  hiveId: string
  date: Date
  beeHealth: string
  beePopulation: number | null
  broodFrames: number | null
  honeyFrames: number | null
  pollenFrames: number | null
  notes: string | null
  diseases: string | null
  queenSpotted: boolean | null
  images: InspectionImage[]
}

interface InspectionImage {
  id: string
  imageUrl: string
  aiAnalysis: string | null
  detectedIssues: string | null
  queenDetected: boolean | null
  createdAt: Date
}

interface Disease {
  id: string
  name: string
  nameSl: string | null
  description: string
  symptoms: string
  treatment: string | null
  prevention: string | null
  severity: string
}

interface Scale {
  id: string
  name: string
  location: string | null
  hiveId: string | null
  ipAddress: string | null
  port: number | null
  lastReading: Date | null
  isActive: boolean
  hive?: Hive
}

interface Weight {
  id: string
  hiveId: string
  date: Date
  hiveWeight: number | null
  honeyYield: number | null
  notes: string | null
  source: string | null
}

interface AIAnalysis {
  overallHealth: string
  beePopulation: string
  signsOfDisease: string[]
  possibleDiseases: Array<{
    name: string
    probability: string
    detectedSymptoms: string[]
  }>
  observations: string[]
  recommendations: string[]
  summary: string
  queenAnalysis?: {
    queenSpotted: boolean
    queenLocation: string
    queenHealth: string
    queenPattern: string[]
    eggCellsVisible: boolean
    broodPattern: string
  }
}

export default function BeekeeperApp() {
  const [hives, setHives] = useState<Hive[]>([])
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [scales, setScales] = useState<Scale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAddScaleDialog, setShowAddScaleDialog] = useState(false)
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null)
  const [hiveInspections, setHiveInspections] = useState<Inspection[]>([])
  const [hiveWeights, setHiveWeights] = useState<Weight[]>([])
  const [weightAnalysis, setWeightAnalysis] = useState<any>(null)
  const [showInspectionDialog, setShowInspectionDialog] = useState(false)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)

  const [newHive, setNewHive] = useState({
    name: '',
    location: '',
    notes: '',
    beeCount: ''
  })

  const [newScale, setNewScale] = useState({
    name: '',
    location: '',
    hiveId: '',
    ipAddress: '',
    port: '80'
  })

  const [newInspection, setNewInspection] = useState({
    beeHealth: 'GOOD',
    beePopulation: '',
    broodFrames: '',
    honeyFrames: '',
    pollenFrames: '',
    notes: '',
    queenSpotted: false
  })

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [activeTab, setActiveTab] = useState('hives')
  const [weightDays, setWeightDays] = useState(30)

  // Pridobi panje
  const fetchHives = async () => {
    try {
      const res = await fetch('/api/hives')
      if (res.ok) {
        const data = await res.json()
        setHives(data)
      }
    } catch (error) {
      console.error('Napaka pri pridobivanju panjev:', error)
    }
  }

  // Pridobi bolezni
  const fetchDiseases = async () => {
    try {
      const res = await fetch('/api/diseases')
      if (res.ok) {
        const data = await res.json()
        setDiseases(data)
      }
    } catch (error) {
      console.error('Napaka pri pridobivanju bolezni:', error)
    }
  }

  // Pridobi tehtnice
  const fetchScales = async () => {
    try {
      const res = await fetch('/api/scales')
      if (res.ok) {
        const data = await res.json()
        setScales(data)
      }
    } catch (error) {
      console.error('Napaka pri pridobivanju tehtnic:', error)
    }
  }

  // Pridobi inspekcije za panj
  const fetchInspections = async (hiveId: string) => {
    try {
      const res = await fetch(`/api/inspections?hiveId=${hiveId}`)
      if (res.ok) {
        const data = await res.json()
        setHiveInspections(data)
      }
    } catch (error) {
      console.error('Napaka pri pridobivanju inspekcij:', error)
    }
  }

  // Pridobi uteži za panj
  const fetchWeights = async (hiveId: string) => {
    try {
      const res = await fetch(`/api/weights?hiveId=${hiveId}`)
      if (res.ok) {
        const data = await res.json()
        setHiveWeights(data)
      }
    } catch (error) {
      console.error('Napaka pri pridobivanju uteži:', error)
    }
  }

  // Analiza uteži
  const fetchWeightAnalysis = async (hiveId: string, days: number) => {
    try {
      const res = await fetch(`/api/analysis?hiveId=${hiveId}&days=${days}`)
      if (res.ok) {
        const data = await res.json()
        setWeightAnalysis(data)
      }
    } catch (error) {
      console.error('Napaka pri analizi uteži:', error)
    }
  }

  // Branje tehtnice
  const readScale = async (scaleId: string) => {
    try {
      const res = await fetch('/api/scales/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scaleId })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert(`Teža: ${data.weight} kg\nMedilo: ${data.honeyYield} kg\nVir: ${data.source}`)
          if (selectedHive) {
            await fetchWeights(selectedHive.id)
            await fetchWeightAnalysis(selectedHive.id, weightDays)
          }
        }
      }
    } catch (error) {
      console.error('Napaka pri branju tehtnice:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchHives(), fetchDiseases(), fetchScales()])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedHive) {
      fetchInspections(selectedHive.id)
      fetchWeights(selectedHive.id)
      fetchWeightAnalysis(selectedHive.id, weightDays)
    }
  }, [selectedHive, weightDays])

  // Odpri kamero
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Napaka pri odpiranju kamere:', error)
      alert('Napaka pri odpiranju kamere. Preverite dovoljenja.')
    }
  }

  // Ustavi kamero
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  // Zajemi sliko
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        setCapturedImage(canvas.toDataURL('image/jpeg'))
        stopCamera()
      }
    }
  }

  // Shrani sliko kot base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Analiziraj sliko z AI
  const analyzeImage = async () => {
    if (!capturedImage) return

    setAnalyzingImage(true)
    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: capturedImage,
          analyzeQueen: true,
          analyzeDiseases: true
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAiAnalysis(data.analysis)
          // Samodejno nastavi queenSpotted na podlagi AI analize
          if (data.analysis.queenAnalysis?.queenSpotted !== undefined) {
            setNewInspection(prev => ({
              ...prev,
              queenSpotted: data.analysis.queenAnalysis.queenSpotted
            }))
          }
        }
      }
    } catch (error) {
      console.error('Napaka pri analizi slike:', error)
    } finally {
      setAnalyzingImage(false)
    }
  }

  // Dodaj nov panj
  const handleAddHive = async () => {
    try {
      const res = await fetch('/api/hives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHive.name,
          location: newHive.location || null,
          notes: newHive.notes || null,
          beeCount: newHive.beeCount ? parseInt(newHive.beeCount) : null
        })
      })

      if (res.ok) {
        await fetchHives()
        setShowAddDialog(false)
        setNewHive({ name: '', location: '', notes: '', beeCount: '' })
      }
    } catch (error) {
      console.error('Napaka pri dodajanju panja:', error)
    }
  }

  // Dodaj tehtnico
  const handleAddScale = async () => {
    try {
      const res = await fetch('/api/scales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScale.name,
          location: newScale.location || null,
          hiveId: newScale.hiveId || null,
          ipAddress: newScale.ipAddress || null,
          port: newScale.port ? parseInt(newScale.port) : null
        })
      })

      if (res.ok) {
        await fetchScales()
        setShowAddScaleDialog(false)
        setNewScale({ name: '', location: '', hiveId: '', ipAddress: '', port: '80' })
      }
    } catch (error) {
      console.error('Napaka pri dodajanju tehtnice:', error)
    }
  }

  // Dodaj inspekcijo
  const handleAddInspection = async () => {
    if (!selectedHive) return

    try {
      // Najprej ustvari inspekcijo
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hiveId: selectedHive.id,
          beeHealth: newInspection.beeHealth,
          beePopulation: newInspection.beePopulation ? parseInt(newInspection.beePopulation) : null,
          broodFrames: newInspection.broodFrames ? parseInt(newInspection.broodFrames) : null,
          honeyFrames: newInspection.honeyFrames ? parseInt(newInspection.honeyFrames) : null,
          pollenFrames: newInspection.pollenFrames ? parseInt(newInspection.pollenFrames) : null,
          notes: newInspection.notes || null,
          diseases: aiAnalysis?.possibleDiseases?.length > 0
            ? aiAnalysis.possibleDiseases.map(d => d.name)
            : null,
          queenSpotted: newInspection.queenSpotted || aiAnalysis?.queenAnalysis?.queenSpotted || null
        })
      })

      if (res.ok) {
        const inspection = await res.json()

        // Dodaj sliko če obstaja
        if (capturedImage) {
          await fetch('/api/inspection-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inspectionId: inspection.id,
              imageUrl: capturedImage,
              aiAnalysis: aiAnalysis || null,
              detectedIssues: aiAnalysis?.signsOfDisease?.length > 0
                ? aiAnalysis.signsOfDisease
                : null,
              queenDetected: aiAnalysis?.queenAnalysis?.queenSpotted || null
            })
          })
        }

        await fetchHives()
        await fetchInspections(selectedHive.id)

        // Reset
        setShowInspectionDialog(false)
        setCapturedImage(null)
        setAiAnalysis(null)
        setNewInspection({
          beeHealth: 'GOOD',
          beePopulation: '',
          broodFrames: '',
          honeyFrames: '',
          pollenFrames: '',
          notes: '',
          queenSpotted: false
        })
      }
    } catch (error) {
      console.error('Napaka pri dodajanju inspekcije:', error)
    }
  }

  // Odprtje podrobnosti panja
  const openHiveDetails = async (hive: Hive) => {
    setSelectedHive(hive)
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ACTIVE: { label: 'Aktiven', variant: 'default' },
      INACTIVE: { label: 'Neaktiven', variant: 'secondary' },
      WEAK: { label: 'Šibek', variant: 'outline' },
      SICK: { label: 'Bolnih', variant: 'destructive' },
      PREPARING_WINTER: { label: 'Priprava na zimo', variant: 'outline' },
      WINTERING: { label: 'Zimovanje', variant: 'secondary' }
    }

    const config = statusConfig[status] || { label: status, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Health badge
  const getHealthBadge = (health: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      EXCELLENT: { label: 'Odlično', variant: 'default' },
      GOOD: { label: 'Dobro', variant: 'default' },
      FAIR: { label: 'Srednje', variant: 'outline' },
      POOR: { label: 'Slabo', variant: 'destructive' },
      CRITICAL: { label: 'Kritično', variant: 'destructive' }
    }
    const h = config[health] || { label: health, variant: 'outline' as const }
    return <Badge variant={h.variant}>{h.label}</Badge>
  }

  // Severity badge
  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      LOW: { label: 'Nizka', variant: 'outline' },
      MEDIUM: { label: 'Srednja', variant: 'default' },
      HIGH: { label: 'Visoka', variant: 'destructive' },
      CRITICAL: { label: 'Kritična', variant: 'destructive' }
    }
    const s = config[severity] || { label: severity, variant: 'outline' as const }
    return <Badge variant={s.variant}>{s.label}</Badge>
  }

  // Filter panjev
  const filteredHives = hives.filter(hive =>
    hive.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (hive.location && hive.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (hive.notes && hive.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Graf teže
  const WeightChart = () => {
    if (!weightAnalysis?.chartData || weightAnalysis.chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Ni podatkov za graf
        </div>
      )
    }

    const maxWeight = Math.max(...weightAnalysis.chartData.map((d: any) => d.weight))
    const minWeight = Math.min(...weightAnalysis.chartData.map((d: any) => d.weight))
    const range = maxWeight - minWeight || 1

    return (
      <div className="h-64 border rounded-lg p-4 bg-card">
        <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
          {/* X os */}
          <line x1="0" y1="60" x2="100" y2="60" stroke="#ccc" strokeWidth="0.5" />
          
          {/* Y os */}
          <line x1="0" y1="0" x2="0" y2="60" stroke="#ccc" strokeWidth="0.5" />
          
          {/* Y oznake */}
          <text x="-2" y="5" fontSize="3" fill="#666" textAnchor="end">
            {maxWeight.toFixed(0)}kg
          </text>
          <text x="-2" y="60" fontSize="3" fill="#666" textAnchor="end">
            {minWeight.toFixed(0)}kg
          </text>

          {/* Graf */}
          <polyline
            points={weightAnalysis.chartData.map((d: any, i: number) => {
              const x = (i / (weightAnalysis.chartData.length - 1)) * 100
              const y = 60 - ((d.weight - minWeight) / range) * 50
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Tocke */}
          {weightAnalysis.chartData.map((d: any, i: number) => {
            const x = (i / (weightAnalysis.chartData.length - 1)) * 100
            const y = 60 - ((d.weight - minWeight) / range) * 50
            return (
              <circle key={i} cx={x} cy={y} r="1.5" fill="#f59e0b" />
            )
          })}
        </svg>
      </div>
    )
  }

  // Cleanup za kamero
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-white p-2 rounded-lg">
                <Beaker className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Čebelarski Pomočnik</h1>
                <p className="text-sm text-muted-foreground">
                  Upravljanje čebeljaka, tehtnice in AI analiza
                </p>
              </div>
            </div>
            {selectedHive && (
              <Button variant="outline" onClick={() => setSelectedHive(null)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Nazaj na seznam
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {!selectedHive ? (
          // Seznam panjev
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
              <TabsTrigger value="hives">Panji</TabsTrigger>
              <TabsTrigger value="scales">Tehtnice</TabsTrigger>
              <TabsTrigger value="diseases">Bolezni</TabsTrigger>
            </TabsList>

            {/* Panji Tab */}
            <TabsContent value="hives" className="space-y-6">
              {/* Search and Add */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Išči po imenu, lokaciji ali opombah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Dodaj Panj
                </Button>
              </div>

              {/* Hives Grid */}
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nalaganje panjev...
                </div>
              ) : filteredHives.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Beaker className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Ni še nobenega panja</p>
                  <p className="text-muted-foreground mb-4">Dodajte svoj prvi panj, da začnete z upravljanjem</p>
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    Dodaj prvi panj
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHives.map((hive) => (
                    <Card key={hive.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openHiveDetails(hive)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl">{hive.name}</CardTitle>
                          {getStatusBadge(hive.status)}
                        </div>
                        {hive.location && (
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {hive.location}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {hive.beeCount && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Družin:</span>
                            <span className="font-medium">{hive.beeCount}</span>
                          </div>
                        )}
                        {hive.lastInspection && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Zadnja inspekcija:</span>
                            <span className="font-medium">
                              {new Date(hive.lastInspection).toLocaleDateString('sl-SI')}
                            </span>
                          </div>
                        )}
                        {hive.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {hive.notes}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" variant="outline">
                          Odpri Panj
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tehtnice Tab */}
            <TabsContent value="scales" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Daljinske Tehtnice</h2>
                <Button onClick={() => setShowAddScaleDialog(true)} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Dodaj Tehtnico
                </Button>
              </div>

              {scales.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Scale className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Ni dodanih tehtnic</p>
                  <p className="text-muted-foreground mb-4">
                    Dodajte tehtnico za avtomatsko branje uteži
                  </p>
                  <Button onClick={() => setShowAddScaleDialog(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    Dodaj tehtnico
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scales.map((scale) => (
                    <Card key={scale.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl">{scale.name}</CardTitle>
                          <Badge variant={scale.isActive ? 'default' : 'secondary'}>
                            {scale.isActive ? 'Aktivna' : 'Neaktivna'}
                          </Badge>
                        </div>
                        {scale.location && (
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {scale.location}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {scale.hive && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Panj:</span>
                            <span className="ml-2 font-medium">{scale.hive.name}</span>
                          </div>
                        )}
                        {scale.ipAddress && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">IP:</span>
                            <span className="ml-2 font-medium">{scale.ipAddress}:{scale.port}</span>
                          </div>
                        )}
                        {scale.lastReading && (
                          <div className="text-sm">
                            <Calendar className="w-4 h-4 inline mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">Zadnje branje:</span>
                            <span className="ml-2 font-medium">
                              {new Date(scale.lastReading).toLocaleString('sl-SI')}
                            </span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button
                          className="flex-1 gap-2"
                          disabled={!scale.isActive}
                          onClick={() => readScale(scale.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Preberi
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Graf
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Bolezni Tab */}
            <TabsContent value="diseases" className="space-y-6">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nalaganje bolezni...
                </div>
              ) : diseases.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Ni podatkov o boleznih</p>
                  <p className="text-muted-foreground">Podatki o boleznih bodo dodani ob prvem pregledu</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {diseases.map((disease) => (
                    <Card key={disease.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl">{disease.nameSl || disease.name}</CardTitle>
                          {getSeverityBadge(disease.severity)}
                        </div>
                        <CardDescription>{disease.name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Opis</h4>
                          <p className="text-sm text-muted-foreground">{disease.description}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Simptomi</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {JSON.parse(disease.symptoms || '[]').map((symptom: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-500">•</span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {disease.treatment && (
                          <div>
                            <h4 className="font-medium mb-2">Zdravljenje</h4>
                            <p className="text-sm text-muted-foreground">{disease.treatment}</p>
                          </div>
                        )}
                        {disease.prevention && (
                          <div>
                            <h4 className="font-medium mb-2">Preventiva</h4>
                            <p className="text-sm text-muted-foreground">{disease.prevention}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Podrobnosti panja
          <div className="space-y-6">
            {/* Hive Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">{selectedHive.name}</h2>
                {selectedHive.location && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedHive.location}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {getStatusBadge(selectedHive.status)}
                <Button onClick={() => setShowInspectionDialog(true)} className="gap-2">
                  <Camera className="w-5 h-5" />
                  Nova inspekcija
                </Button>
              </div>
            </div>

            {/* Hive Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Status</CardDescription>
                  <CardTitle className="text-lg">{getStatusBadge(selectedHive.status)}</CardTitle>
                </CardHeader>
              </Card>
              {selectedHive.beeCount && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Družin</CardDescription>
                    <CardTitle className="text-lg">{selectedHive.beeCount}</CardTitle>
                  </CardHeader>
                </Card>
              )}
              {selectedHive.lastInspection && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Zadnja inspekcija</CardDescription>
                    <CardTitle className="text-lg">
                      {new Date(selectedHive.lastInspection).toLocaleDateString('sl-SI')}
                    </CardTitle>
                  </CardHeader>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Število inspekcij</CardDescription>
                  <CardTitle className="text-lg">{hiveInspections.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Notes */}
            {selectedHive.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Opombe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{selectedHive.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Weight Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analiza uteži</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={weightDays.toString()} onValueChange={(v) => setWeightDays(parseInt(v))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dni</SelectItem>
                        <SelectItem value="14">14 dni</SelectItem>
                        <SelectItem value="30">30 dni</SelectItem>
                        <SelectItem value="60">60 dni</SelectItem>
                        <SelectItem value="90">90 dni</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => {
                      if (selectedHive) {
                        fetchWeightAnalysis(selectedHive.id, weightDays)
                      }
                    }}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {weightAnalysis && weightAnalysis.statistics ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Min teža:</span>
                        <span className="ml-2 font-medium">{weightAnalysis.statistics.minWeight} kg</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Max teža:</span>
                        <span className="ml-2 font-medium">{weightAnalysis.statistics.maxWeight} kg</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Povprečje:</span>
                        <span className="ml-2 font-medium">{weightAnalysis.statistics.avgWeight} kg</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Medilo:</span>
                        <span className="ml-2 font-medium">{weightAnalysis.statistics.avgHoneyYield} kg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">Sprememba:</span>
                      <Badge variant={weightAnalysis.statistics.trend === 'RASTE' ? 'default' : 'destructive'}>
                        {weightAnalysis.statistics.change >= 0 ? '+' : ''}{weightAnalysis.statistics.change} kg
                      </Badge>
                      <span className="text-muted-foreground">({weightAnalysis.statistics.trend})</span>
                    </div>
                    <WeightChart />
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Ni podatkov za analizo
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inspections History */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Zgodovina inspekcij</h3>
              {hiveInspections.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    Še ni inspekcij za ta panj
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {hiveInspections.map((inspection) => (
                    <Card key={inspection.id}>
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">
                              <Calendar className="w-4 h-4 inline mr-2" />
                              {new Date(inspection.date).toLocaleDateString('sl-SI', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {new Date(inspection.date).toLocaleTimeString('sl-SI')}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getHealthBadge(inspection.beeHealth)}
                            {inspection.queenSpotted !== null && (
                              <Badge variant={inspection.queenSpotted ? 'default' : 'secondary'}>
                                <Crown className="w-3 h-3 mr-1" />
                                {inspection.queenSpotted ? 'Matica' : 'Brez matice'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {inspection.beePopulation && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Populacija:</span>
                              <span className="ml-2 font-medium">{inspection.beePopulation}</span>
                            </div>
                          )}
                          {inspection.broodFrames !== null && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Leglo:</span>
                              <span className="ml-2 font-medium">{inspection.broodFrames} ok.</span>
                            </div>
                          )}
                          {inspection.honeyFrames !== null && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Med:</span>
                              <span className="ml-2 font-medium">{inspection.honeyFrames} ok.</span>
                            </div>
                          )}
                          {inspection.pollenFrames !== null && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Prah:</span>
                              <span className="ml-2 font-medium">{inspection.pollenFrames} ok.</span>
                            </div>
                          )}
                        </div>

                        {/* Images */}
                        {inspection.images.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Slike</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {inspection.images.map((image, idx) => (
                                <div
                                  key={image.id}
                                  className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                                  onClick={() => {
                                    setSelectedInspection(inspection)
                                    setCurrentImageIndex(idx)
                                  }}
                                >
                                  <img
                                    src={image.imageUrl}
                                    alt={`Inspekcijska slika ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {image.detectedIssues && (
                                    <div className="absolute top-2 right-2">
                                      <AlertOctagon className="w-6 h-6 text-red-500" />
                                    </div>
                                  )}
                                  {image.queenDetected && (
                                    <div className="absolute bottom-2 left-2">
                                      <Badge className="text-xs">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Matica
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Analysis Summary */}
                        {inspection.images.some(img => img.aiAnalysis) && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                              <h4 className="font-medium">AI Analiza</h4>
                            </div>
                            {inspection.images.map((image) => {
                              const analysis = image.aiAnalysis ? JSON.parse(image.aiAnalysis) : null
                              if (!analysis) return null
                              return (
                                <div key={image.id} className="text-sm space-y-1">
                                  <p><strong>Zdravje:</strong> {analysis.overallHealth || 'N/A'}</p>
                                  {analysis.summary && (
                                    <p className="text-muted-foreground">{analysis.summary}</p>
                                  )}
                                  {analysis.queenAnalysis && (
                                    <div className="mt-2 p-2 bg-background rounded">
                                      <p><strong>Matica:</strong> {analysis.queenAnalysis.queenSpotted ? 'Zaznana' : 'Nezaznana'}</p>
                                      {analysis.queenAnalysis.queenSpotted && (
                                        <>
                                          <p><strong>Lokacija:</strong> {analysis.queenAnalysis.queenLocation}</p>
                                          <p><strong>Zdravje:</strong> {analysis.queenAnalysis.queenHealth}</p>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Notes */}
                        {inspection.notes && (
                          <div>
                            <h4 className="font-medium mb-2">Opombe</h4>
                            <p className="text-sm text-muted-foreground">{inspection.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto bg-card">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2025 Čebelarski Pomočnik - AI-powered Hive Management
        </div>
      </footer>

      {/* Add Hive Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nov panj</DialogTitle>
            <DialogDescription>Vnesite informacije o novem panju v čebeljak</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Ime panja *</Label>
              <Input
                id="name"
                placeholder="Npr. Panj 1"
                value={newHive.name}
                onChange={(e) => setNewHive({ ...newHive, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Lokacija</Label>
              <Input
                id="location"
                placeholder="Npr. Čebeljak Ljubljana"
                value={newHive.location}
                onChange={(e) => setNewHive({ ...newHive, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="beeCount">Število družin</Label>
              <Input
                id="beeCount"
                type="number"
                placeholder="Npr. 1"
                value={newHive.beeCount}
                onChange={(e) => setNewHive({ ...newHive, beeCount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Opombe</Label>
              <Textarea
                id="notes"
                placeholder="Dodatne informacije..."
                value={newHive.notes}
                onChange={(e) => setNewHive({ ...newHive, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Prekliči
            </Button>
            <Button onClick={handleAddHive}>Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Scale Dialog */}
      <Dialog open={showAddScaleDialog} onOpenChange={setShowAddScaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj novo tehtnico</DialogTitle>
            <DialogDescription>Vnesite informacije o novi daljinski tehtnici</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="scaleName">Ime tehtnice *</Label>
              <Input
                id="scaleName"
                placeholder="Npr. Tehtnica 1"
                value={newScale.name}
                onChange={(e) => setNewScale({ ...newScale, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="scaleLocation">Lokacija</Label>
              <Input
                id="scaleLocation"
                placeholder="Npr. Čebeljak Ljubljana"
                value={newScale.location}
                onChange={(e) => setNewScale({ ...newScale, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="scaleHive">Povezani panj</Label>
              <Select value={newScale.hiveId} onValueChange={(v) => setNewScale({ ...newScale, hiveId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izberite panj (opcijsko)" />
                </SelectTrigger>
                <SelectContent>
                  {hives.map((hive) => (
                    <SelectItem key={hive.id} value={hive.id}>
                      {hive.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ipAddress">IP naslov</Label>
              <Input
                id="ipAddress"
                placeholder="Npr. 192.168.1.100"
                value={newScale.ipAddress}
                onChange={(e) => setNewScale({ ...newScale, ipAddress: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="port">Vrata</Label>
              <Input
                id="port"
                type="number"
                placeholder="Npr. 80"
                value={newScale.port}
                onChange={(e) => setNewScale({ ...newScale, port: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddScaleDialog(false)}>
              Prekliči
            </Button>
            <Button onClick={handleAddScale}>Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Dialog */}
      <Dialog open={showInspectionDialog} onOpenChange={(open) => {
        setShowInspectionDialog(open)
        if (!open) {
          stopCamera()
          setCapturedImage(null)
          setAiAnalysis(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova inspekcija - {selectedHive?.name}</DialogTitle>
            <DialogDescription>
              Zajemite sliko in vnesite podatke o stanju panja
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Camera/Image Capture */}
            <div>
              <Label className="text-base font-semibold">Slika panja</Label>
              <div className="mt-3">
                {!capturedImage ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={startCamera} variant="outline" className="flex-1">
                        <Camera className="w-5 h-5 mr-2" />
                        Odpri kamero
                      </Button>
                      <Button onClick={captureImage} className="flex-1" disabled={!streamRef.current}>
                        <Camera className="w-5 h-5 mr-2" />
                        Zajemi sliko
                      </Button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">- ali -</div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Zajeta slika"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCapturedImage(null)
                          setAiAnalysis(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {!aiAnalysis && !analyzingImage && (
                      <Button onClick={analyzeImage} className="w-full gap-2">
                        <Brain className="w-5 h-5" />
                        Analiziraj sliko z AI
                      </Button>
                    )}

                    {analyzingImage && (
                      <div className="flex items-center justify-center gap-3 py-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analiza slike v teku...</span>
                      </div>
                    )}

                    {aiAnalysis && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                          <h4 className="font-semibold">Rezultati analize</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Zdravje:</span>
                            <Badge className="ml-2">{aiAnalysis.overallHealth}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Populacija:</span>
                            <Badge className="ml-2" variant="outline">{aiAnalysis.beePopulation}</Badge>
                          </div>
                        </div>

                        {aiAnalysis.queenAnalysis && (
                          <div className="bg-background p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-5 h-5 text-amber-600" />
                              <h5 className="font-medium">Analiza matice</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Zaznana:</span>
                                <Badge className="ml-2" variant={aiAnalysis.queenAnalysis.queenSpotted ? 'default' : 'secondary'}>
                                  {aiAnalysis.queenAnalysis.queenSpotted ? 'Da' : 'Ne'}
                                </Badge>
                              </div>
                              {aiAnalysis.queenAnalysis.queenSpotted && (
                                <>
                                  <div>
                                    <span className="text-muted-foreground">Lokacija:</span>
                                    <span className="ml-2 font-medium">{aiAnalysis.queenAnalysis.queenLocation}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Zdravje:</span>
                                    <span className="ml-2 font-medium">{aiAnalysis.queenAnalysis.queenHealth}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {aiAnalysis.signsOfDisease && aiAnalysis.signsOfDisease.length > 0 && (
                          <Alert variant="destructive">
                            <AlertOctagon className="w-4 h-4" />
                            <AlertDescription>
                              <strong>Zaznani znaki bolezni:</strong>
                              <ul className="mt-2 list-disc list-inside">
                                {aiAnalysis.signsOfDisease.map((sign, idx) => (
                                  <li key={idx}>{sign}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {aiAnalysis.possibleDiseases && aiAnalysis.possibleDiseases.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Možne bolezni</h5>
                            <div className="space-y-2">
                              {aiAnalysis.possibleDiseases.map((disease, idx) => (
                                <Alert key={idx} variant={disease.probability === 'visoka' ? 'destructive' : 'default'}>
                                  <AlertDescription>
                                    <strong>{disease.name}</strong> (verjetnost: {disease.probability})
                                    {disease.detectedSymptoms && disease.detectedSymptoms.length > 0 && (
                                      <ul className="mt-1 list-disc list-inside text-sm">
                                        {disease.detectedSymptoms.map((symptom, sidx) => (
                                          <li key={sidx}>{symptom}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiAnalysis.observations && aiAnalysis.observations.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Opazki</h5>
                            <ul className="text-sm space-y-1">
                              {aiAnalysis.observations.map((obs, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <TrendingUp className="w-4 h-4 mt-0.5 text-amber-600" />
                                  {obs}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Priporočila</h5>
                            <ul className="text-sm space-y-1">
                              {aiAnalysis.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <ShieldCheck className="w-4 h-4 mt-0.5 text-green-600" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beeHealth">Zdravje čebel</Label>
                <Select value={newInspection.beeHealth} onValueChange={(v) => setNewInspection({ ...newInspection, beeHealth: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Odlično</SelectItem>
                    <SelectItem value="GOOD">Dobro</SelectItem>
                    <SelectItem value="FAIR">Srednje</SelectItem>
                    <SelectItem value="POOR">Slabo</SelectItem>
                    <SelectItem value="CRITICAL">Kritično</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="beePopulation">Populacija čebel</Label>
                <Input
                  id="beePopulation"
                  type="number"
                  placeholder="Npr. 50000"
                  value={newInspection.beePopulation}
                  onChange={(e) => setNewInspection({ ...newInspection, beePopulation: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="broodFrames">Leglo (okviri)</Label>
                <Input
                  id="broodFrames"
                  type="number"
                  placeholder="Npr. 8"
                  value={newInspection.broodFrames}
                  onChange={(e) => setNewInspection({ ...newInspection, broodFrames: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="honeyFrames">Med (okviri)</Label>
                <Input
                  id="honeyFrames"
                  type="number"
                  placeholder="Npr. 10"
                  value={newInspection.honeyFrames}
                  onChange={(e) => setNewInspection({ ...newInspection, honeyFrames: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pollenFrames">Prah (okviri)</Label>
                <Input
                  id="pollenFrames"
                  type="number"
                  placeholder="Npr. 4"
                  value={newInspection.pollenFrames}
                  onChange={(e) => setNewInspection({ ...newInspection, pollenFrames: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="queenSpotted"
                  checked={newInspection.queenSpotted}
                  onChange={(e) => setNewInspection({ ...newInspection, queenSpotted: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="queenSpotted" className="mb-0">Zaznana matica</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Opombe</Label>
              <Textarea
                id="notes"
                placeholder="Dodatne informacije o inspekciji..."
                value={newInspection.notes}
                onChange={(e) => setNewInspection({ ...newInspection, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInspectionDialog(false)}>
              Prekliči
            </Button>
            <Button onClick={handleAddInspection}>Shrani inspekcijo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      {selectedInspection && selectedInspection.images.length > 0 && (
        <Dialog open={!!selectedInspection} onOpenChange={() => setSelectedInspection(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Slika inspekcije</DialogTitle>
              <DialogDescription>
                {new Date(selectedInspection.date).toLocaleDateString('sl-SI')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedInspection.images[currentImageIndex].imageUrl}
                  alt="Inspekcijska slika"
                  className="w-full h-full object-contain"
                />
                {selectedInspection.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((i) => i > 0 ? i - 1 : selectedInspection.images.length - 1)}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((i) => i < selectedInspection.images.length - 1 ? i + 1 : 0)}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
                {selectedInspection.images[currentImageIndex].queenDetected && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="text-lg">
                      <Crown className="w-4 h-4 mr-1" />
                      Matica zaznana
                    </Badge>
                  </div>
                )}
              </div>

              {selectedInspection.images[currentImageIndex].detectedIssues && (
                <Alert variant="destructive">
                  <AlertOctagon className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Zaznani problemi:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {JSON.parse(selectedInspection.images[currentImageIndex].detectedIssues!).map((issue: string, idx: number) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {selectedInspection.images[currentImageIndex].aiAnalysis && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    <h4 className="font-semibold">AI Analiza</h4>
                  </div>
                  <ScrollArea className="max-h-96">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(selectedInspection.images[currentImageIndex].aiAnalysis!), null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
