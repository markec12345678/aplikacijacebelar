import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Preberi tehtnico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scaleId } = body

    if (!scaleId) {
      return NextResponse.json({ error: 'ID tehtnice je obvezen' }, { status: 400 })
    }

    // Najdi tehtnico
    const scale = await db.scale.findUnique({
      where: { id: scaleId },
      include: { hive: true }
    })

    if (!scale) {
      return NextResponse.json({ error: 'Tehtnica ni najdena' }, { status: 404 })
    }

    if (!scale.isActive) {
      return NextResponse.json({ error: 'Tehtnica ni aktivna' }, { status: 400 })
    }

    // SIMULACIJA - V pravi aplikaciji bi tukaj brali iz tehtnice preko omrežja
    // Zaenkrat simuliramo branje z naključno vrednostjo, če tehtnica nima povezanega panja
    // Ali pa uporabimo zadnjo vrednost + majhno spremembo

    let weight: number
    let honeyYield: number | null = null

    if (scale.hiveId) {
      // Dobi zadnjo vrednost za ta panj
      const lastWeight = await db.weight.findFirst({
        where: { hiveId: scale.hiveId },
        orderBy: { date: 'desc' }
      })

      // Simuliramo spremembo teže (-5 do +5 kg)
      const change = (Math.random() - 0.5) * 10
      const baseWeight = lastWeight?.hiveWeight || 80 // privzeto 80kg
      weight = Math.max(0, baseWeight + change)

      // Ocena medila (cca 15-25% od teže panja brez škatle)
      honeyYield = Math.round(weight * 0.2 * 10) / 10
    } else {
      // Brez povezanega panja - naključna vrednost
      weight = Math.round((Math.random() * 100 + 20) * 10) / 10
    }

    // Posodobi zadnji branje
    await db.scale.update({
      where: { id: scaleId },
      data: { lastReading: new Date() }
    })

    return NextResponse.json({
      success: true,
      weight: weight,
      honeyYield: honeyYield,
      timestamp: new Date(),
      scaleId: scale.id,
      hiveId: scale.hiveId
    })
  } catch (error) {
    console.error('Napaka pri branju tehtnice:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri branju tehtnice',
      details: error instanceof Error ? error.message : 'Neznana napaka'
    }, { status: 500 })
  }
}
