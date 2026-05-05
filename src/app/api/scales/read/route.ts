import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Preberi vse tehtnice z zgodovino meritevami
export async function GET(request: NextRequest) {
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
