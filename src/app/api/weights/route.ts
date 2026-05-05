import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Pridobi vse uteži ali za določen panj
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hiveId = searchParams.get('hiveId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause = hiveId ? { hiveId } : {}

    const weights = await db.weight.findMany({
      where: whereClause,
      include: {
        hive: true
      },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json(weights)
  } catch (error) {
    console.error('Napaka pri pridobivanju uteži:', error)
    return NextResponse.json({ error: 'Napaka pri pridobivanju uteži' }, { status: 500 })
  }
}

// POST - Dodaj novo utež
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      hiveId,
      hiveWeight,
      honeyYield,
      framesCount,
      framesWithHoney,
      emptyFrames,
      notes,
      source
    } = body

    if (!hiveId) {
      return NextResponse.json({ error: 'ID panja je obvezen' }, { status: 400 })
    }

    const weight = await db.weight.create({
      data: {
        hiveId,
        hiveWeight: hiveWeight || null,
        honeyYield: honeyYield || null,
        framesCount: framesCount || null,
        framesWithHoney: framesWithHoney || null,
        emptyFrames: emptyFrames || null,
        notes: notes || null,
        source: source || 'MANUAL'
      }
    })

    return NextResponse.json(weight, { status: 201 })
  } catch (error) {
    console.error('Napaka pri dodajanju uteži:', error)
    return NextResponse.json({ error: 'Napaka pri dodajanju uteži' }, { status: 500 })
  }
}

// PUT - Posodobi utež
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      hiveWeight,
      honeyYield,
      framesCount,
      framesWithHoney,
      emptyFrames,
      notes
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID uteži je obvezen' }, { status: 400 })
    }

    const weight = await db.weight.update({
      where: { id },
      data: {
        ...(hiveWeight !== undefined && { hiveWeight: hiveWeight || null }),
        ...(honeyYield !== undefined && { honeyYield: honeyYield || null }),
        ...(framesCount !== undefined && { framesCount: framesCount || null }),
        ...(framesWithHoney !== undefined && { framesWithHoney: framesWithHoney || null }),
        ...(emptyFrames !== undefined && { emptyFrames: emptyFrames || null }),
        ...(notes !== undefined && { notes: notes || null })
      }
    })

    return NextResponse.json(weight)
  } catch (error) {
    console.error('Napaka pri posodabljanju uteži:', error)
    return NextResponse.json({ error: 'Napaka pri posodabljanju uteži' }, { status: 500 })
  }
}

// DELETE - Izbriši utež
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID uteži je obvezen' }, { status: 400 })
    }

    await db.weight.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Napaka pri brisanju uteži:', error)
    return NextResponse.json({ error: 'Napaka pri brisanju uteži' }, { status: 500 })
  }
}
