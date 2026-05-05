'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Beaker, Search, AlertTriangle, Calendar, MapPin,
  Camera, X, ChevronLeft, ChevronRight, Loader2, Brain,
  Activity, TrendingUp, ShieldCheck, AlertOctagon
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
  images: InspectionImage[]
}

interface InspectionImage {
  id: string
  imageUrl: string
  aiAnalysis: string | null
  detectedIssues: string | null
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
}

export default function BeekeeperApp() {
  const [hives, setHives] = useState<Hive[]>([])
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null)
  const [hiveInspections, setHiveInspections] = useState<Inspection[]>([])
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

  const [newInspection, setNewInspection] = useState({
    beeHealth: 'GOOD',
    beePopulation: '',
    broodFrames: '',
    honeyFrames: '',
    pollenFrames: '',
    notes: ''
  })

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [activeTab, setActiveTab] = useState('hives')

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchHives(), fetchDiseases()])
      setLoading(false)
    }
    loadData()
  }, [])

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

  // Shrani sliko kot base64 (v praksi bi jo naložili na storage)
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
        body: JSON.stringify({ imageUrl: capturedImage })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAiAnalysis(data.analysis)
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
            : null
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
                : null
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
          notes: ''
        })
      }
    } catch (error) {
      console.error('Napaka pri dodajanju inspekcije:', error)
    }
  }

  // Odprtje podrobnosti panja
  const openHiveDetails = async (hive: Hive) => {
    setSelectedHive(hive)
    await fetchInspections(hive.id)
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
                <p className="text-sm text-muted-foreground">Upravljanje čebeljaka in analiza zdravja</p>
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
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="hives">Panji</TabsTrigger>
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
                          {getHealthBadge(inspection.beeHealth)}
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

                        {aiAnalysis.summary && (
                          <div className="bg-white dark:bg-slate-950 p-3 rounded border">
                            <h5 className="font-medium mb-1">Povzetek</h5>
                            <p className="text-sm text-muted-foreground">{aiAnalysis.summary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="beeHealth">Zdravje čebel</Label>
                <select
                  id="beeHealth"
                  className="w-full mt-1.5 px-3 py-2 border rounded-md bg-background"
                  value={newInspection.beeHealth}
                  onChange={(e) => setNewInspection({ ...newInspection, beeHealth: e.target.value })}
                >
                  <option value="EXCELLENT">Odlično</option>
                  <option value="GOOD">Dobro</option>
                  <option value="FAIR">Srednje</option>
                  <option value="POOR">Slabo</option>
                  <option value="CRITICAL">Kritično</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="beePopulation">Populacija</Label>
                  <Input
                    id="beePopulation"
                    type="number"
                    placeholder="Število"
                    value={newInspection.beePopulation}
                    onChange={(e) => setNewInspection({ ...newInspection, beePopulation: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="broodFrames">Leglo (okvirji)</Label>
                  <Input
                    id="broodFrames"
                    type="number"
                    placeholder="Št. okvirov"
                    value={newInspection.broodFrames}
                    onChange={(e) => setNewInspection({ ...newInspection, broodFrames: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="honeyFrames">Med (okvirji)</Label>
                  <Input
                    id="honeyFrames"
                    type="number"
                    placeholder="Št. okvirov"
                    value={newInspection.honeyFrames}
                    onChange={(e) => setNewInspection({ ...newInspection, honeyFrames: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pollenFrames">Prah (okvirji)</Label>
                  <Input
                    id="pollenFrames"
                    type="number"
                    placeholder="Št. okvirov"
                    value={newInspection.pollenFrames}
                    onChange={(e) => setNewInspection({ ...newInspection, pollenFrames: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Opombe</Label>
                <Textarea
                  id="notes"
                  placeholder="Dodatne opombe o inspekciji..."
                  value={newInspection.notes}
                  onChange={(e) => setNewInspection({ ...newInspection, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowInspectionDialog(false)
              stopCamera()
              setCapturedImage(null)
              setAiAnalysis(null)
            }}>
              Prekliči
            </Button>
            <Button onClick={handleAddInspection}>Shrani inspekcijo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      {selectedInspection && (
        <Dialog open={!!selectedInspection} onOpenChange={() => setSelectedInspection(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Slike inspekcije</DialogTitle>
              <DialogDescription>
                {new Date(selectedInspection.date).toLocaleDateString('sl-SI')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedInspection.images[currentImageIndex] && (
                <>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedInspection.images[currentImageIndex].imageUrl}
                      alt={`Slika ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {selectedInspection.images.length > 1 && (
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentImageIndex + 1} / {selectedInspection.images.length}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentImageIndex(
                          Math.min(selectedInspection.images.length - 1, currentImageIndex + 1)
                        )}
                        disabled={currentImageIndex === selectedInspection.images.length - 1}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}

                  {/* AI Analysis for current image */}
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
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
