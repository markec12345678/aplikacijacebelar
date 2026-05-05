import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Preberi težo iz tehtnice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scaleId } = body

    if (!scaleId) {
      return NextResponse.json({ error: 'ID tehtnice je obvezen' }, { status: 400 })
    }

    // Pridobi tehtnico iz baze
    const scale = await db.scales.findUnique({
      where: { id: scaleId },
      include: {
        hive: true
      }
    })

    if (!scale) {
      return NextResponse.json({ error: 'Tehtnica ni najdena' }, { status: 404 })
    }

    if (!scale.ipAddress || !scale.port) {
      return NextResponse.json({ error: 'Tehtnica nima nastavljenega IP naslova ali vrat' }, { status: 400 })
    }

    // Simuliraj branje iz tehtnice (v praksi bi se tukaj povezali z dejansko tehtnico)
    // TCM-13A tehtnica ima običajno HTTP endpoint za branje podatkov
    let weight: number
    let temperature: number | null = null
    let humidity: number | null = null

    try {
      // Poskusi povezati s tehtnico (simulacija za demo)
      // V praksi: const response = await fetch(`http://${scale.ipAddress}:${scale.port}/weight`)
      
      // Za demo: generiraj naključno težo med 40 in 120 kg
      const lastWeight = await db.weights.findFirst({
        where: { hiveId: scale.hiveId || undefined },
        orderBy: { date: 'desc' }
      })

      const baseWeight = lastWeight?.hiveWeight || 60
      // Variacija +/- 2kg
      weight = baseWeight + (Math.random() - 0.5) * 4

      // Simuliraj temperaturo in vlažnost
      temperature = 20 + Math.random() * 15 // 20-35°C
      humidity = 50 + Math.random() * 30 // 50-80%

    } catch (error) {
      console.error('Napaka pri povezavi s tehtnico:', error)
      return NextResponse.json({ error: 'Napaka pri povezavi s tehtnico' }, { status: 500 })
    }

    // Shrani branje v bazo če obstaja povezan panj
    let savedWeight = null
    if (scale.hiveId) {
      savedWeight = await db.weights.create({
        data: {
          hiveId: scale.hiveId,
          hiveWeight: weight,
          honeyYield: Math.max(0, weight - 40), // Predpostavka: okvir tehta ~40kg
          source: 'SCALE',
          notes: temperature && humidity
            ? `Temp: ${temperature.toFixed(1)}°C, Vlažnost: ${humidity.toFixed(1)}%`
            : null
        }
      })

      // Posodobi čas zadnjega branja tehtnice
      await db.scales.update({
        where: { id: scaleId },
        data: { lastReading: new Date() }
      })

      // Posodobi čas zadnje inspekcije panja
      await db.hive.update({
        where: { id: scale.hiveId },
        data: { lastInspection: new Date() }
      })
    }

    return NextResponse.json({
      success: true,
      weight: weight.toFixed(2),
      temperature: temperature ? temperature.toFixed(1) : null,
      humidity: humidity ? humidity.toFixed(1) : null,
      honeyYield: savedWeight?.honeyYield.toFixed(2) || Math.max(0, weight - 40).toFixed(2),
      source: 'SCALE',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Napaka pri branju tehtnice:', error)
    return NextResponse.json({ error: 'Napaka pri branju tehtnice' }, { status: 500 })
  }
}
