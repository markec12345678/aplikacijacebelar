import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Pridobi vse inspekcije ali za določen panj
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hiveId = searchParams.get('hiveId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause = hiveId ? { hiveId } : {}

    const inspections = await db.inspection.findMany({
      where: whereClause,
      include: {
        images: true,
        hive: true
      },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json(inspections)
  } catch (error) {
    console.error('Napaka pri pridobivanju inspekcij:', error)
    return NextResponse.json({ error: 'Napaka pri pridobivanju inspekcij' }, { status: 500 })
  }
}

// POST - Dodaj novo inspekcijo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      hiveId,
      beeHealth,
      beePopulation,
      broodFrames,
      honeyFrames,
      pollenFrames,
      notes,
      diseases,
      queenSpotted
    } = body

    if (!hiveId) {
      return NextResponse.json({ error: 'ID panja je obvezen' }, { status: 400 })
    }

    const inspection = await db.inspection.create({
      data: {
        hiveId,
        beeHealth: beeHealth || 'GOOD',
        beePopulation: beePopulation || null,
        broodFrames: broodFrames || null,
        honeyFrames: honeyFrames || null,
        pollenFrames: pollenFrames || null,
        notes: notes || null,
        diseases: diseases ? JSON.stringify(diseases) : null,
        queenSpotted: queenSpotted || null
      }
    })

    // Posodobi lastInspection pri panju
    await db.hive.update({
      where: { id: hiveId },
      data: {
        lastInspection: new Date(),
        status: beeHealth === 'CRITICAL' || beeHealth === 'POOR' ? 'SICK' : 'ACTIVE'
      }
    })

    return NextResponse.json(inspection, { status: 201 })
  } catch (error) {
    console.error('Napaka pri dodajanju inspekcije:', error)
    return NextResponse.json({ error: 'Napaka pri dodajanju inspekcije' }, { status: 500 })
  }
}

// PUT - Posodobi inspekcijo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      beeHealth,
      beePopulation,
      broodFrames,
      honeyFrames,
      pollenFrames,
      notes,
      queenSpotted
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID inspekcije je obvezen' }, { status: 400 })
    }

    const inspection = await db.inspection.update({
      where: { id },
      data: {
        ...(beeHealth !== undefined && { beeHealth }),
        ...(beePopulation !== undefined && { beePopulation: beePopulation || null }),
        ...(broodFrames !== undefined && { broodFrames: broodFrames || null }),
        ...(honeyFrames !== undefined && { honeyFrames: honeyFrames || null }),
        ...(pollenFrames !== undefined && { pollenFrames: pollenFrames || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(queenSpotted !== undefined && { queenSpotted: queenSpotted || null })
      }
    })

    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Napaka pri posodabljanju inspekcije:', error)
    return NextResponse.json({ error: 'Napaka pri posodabljanju inspekcije' }, { status: 500 })
  }
}

// DELETE - Izbriši inspekcijo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID inspekcije je obvezen' }, { status: 400 })
    }

    await db.inspection.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Napaka pri brisanju inspekcije:', error)
    return NextResponse.json({ error: 'Napaka pri brisanju inspekcije' }, { status: 500 })
  }
}
