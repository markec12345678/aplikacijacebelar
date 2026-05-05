import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Pridobi vse tehtnice
export async function GET() {
  try {
    const scales = await db.scale.findMany({
      include: {
        hive: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(scales)
  } catch (error) {
    console.error('Napaka pri pridobivanju tehtnic:', error)
    return NextResponse.json({ error: 'Napaka pri pridobivanju tehtnic' }, { status: 500 })
  }
}

// POST - Dodaj novo tehtnico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, hiveId, ipAddress, port } = body

    if (!name) {
      return NextResponse.json({ error: 'Ime tehtnice je obvezno' }, { status: 400 })
    }

    const scale = await db.scale.create({
      data: {
        name,
        location: location || null,
        hiveId: hiveId || null,
        ipAddress: ipAddress || null,
        port: port || null,
        isActive: true
      }
    })

    return NextResponse.json(scale, { status: 201 })
  } catch (error) {
    console.error('Napaka pri dodajanju tehtnice:', error)
    return NextResponse.json({ error: 'Napaka pri dodajanju tehtnice' }, { status: 500 })
  }
}

// PUT - Posodobi tehtnico
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, location, hiveId, ipAddress, port, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID tehtnice je obvezen' }, { status: 400 })
    }

    const scale = await db.scale.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location: location || null }),
        ...(hiveId !== undefined && { hiveId: hiveId || null }),
        ...(ipAddress !== undefined && { ipAddress: ipAddress || null }),
        ...(port !== undefined && { port: port || null }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(scale)
  } catch (error) {
    console.error('Napaka pri posodabljanju tehtnice:', error)
    return NextResponse.json({ error: 'Napaka pri posodabljanju tehtnice' }, { status: 500 })
  }
}

// DELETE - Izbriši tehtnico
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID tehtnice je obvezen' }, { status: 400 })
    }

    await db.scale.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Napaka pri brisanju tehtnice:', error)
    return NextResponse.json({ error: 'Napaka pri brisanju tehtnice' }, { status: 500 })
  }
}
