import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Preberi vse tehtnice
export async function GET() {
  try {
    const scales = await db.scales.findMany({
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

    // Validacija
    if (!name) {
      return NextResponse.json({ error: 'Ime tehtnice je obvezno' }, { status: 400 })
    }

    // Ustvari tehtnico
    const scale = await db.scales.create({
      data: {
        name,
        location: location || null,
        hiveId: hiveId || null,
        ipAddress: ipAddress || null,
        port: port ? parseInt(port) : null
      },
      include: {
        hive: true
      }
    })

    return NextResponse.json(scale)
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
      return NextResponse.json({ error: 'ID tehtnice je obvezno' }, { status: 400 })
    }

    // Posodobi tehtnico
    const scale = await db.scales.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(hiveId !== undefined && { hiveId }),
        ...(ipAddress !== undefined && { ipAddress }),
        ...(port !== undefined && { port: port ? parseInt(port) : null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        hive: true
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

    await db.scales.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Napaka pri brisanju tehtnice:', error)
    return NextResponse.json({ error: 'Napaka pri brisanju tehtnice' }, { status: 500 })
  }
}
