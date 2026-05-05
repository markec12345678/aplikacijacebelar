import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Pridobi vse panje
export async function GET() {
  try {
    const hives = await db.hive.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(hives)
  } catch (error) {
    console.error('Napaka pri pridobivanju panjev:', error)
    return NextResponse.json({ error: 'Napaka pri pridobivanju panjev' }, { status: 500 })
  }
}

// POST - Dodaj nov panj
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, notes, beeCount } = body

    if (!name) {
      return NextResponse.json({ error: 'Ime panja je obvezno' }, { status: 400 })
    }

    const hive = await db.hive.create({
      data: {
        name,
        location: location || null,
        notes: notes || null,
        beeCount: beeCount || null,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(hive, { status: 201 })
  } catch (error) {
    console.error('Napaka pri dodajanju panja:', error)
    return NextResponse.json({ error: 'Napaka pri dodajanju panja' }, { status: 500 })
  }
}

// PUT - Posodobi panj
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, location, notes, beeCount, status } = body

    if (!id) {
      return NextResponse.json({ error: 'ID panja je obvezen' }, { status: 400 })
    }

    const hive = await db.hive.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location: location || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(beeCount !== undefined && { beeCount: beeCount || null }),
        ...(status !== undefined && { status })
      }
    })

    return NextResponse.json(hive)
  } catch (error) {
    console.error('Napaka pri posodabljanju panja:', error)
    return NextResponse.json({ error: 'Napaka pri posodabljanju panja' }, { status: 500 })
  }
}

// DELETE - Izbriši panj
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID panja je obvezen' }, { status: 400 })
    }

    await db.hive.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Napaka pri brisanju panja:', error)
    return NextResponse.json({ error: 'Napaka pri brisanju panja' }, { status: 500 })
  }
}
