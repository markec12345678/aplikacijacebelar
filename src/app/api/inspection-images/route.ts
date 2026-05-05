import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Dodaj sliko inspekciji
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inspectionId, imageUrl, aiAnalysis, detectedIssues, queenDetected } = body

    if (!inspectionId || !imageUrl) {
      return NextResponse.json({ error: 'ID inspekcije in URL slike sta obvezna' }, { status: 400 })
    }

    const image = await db.inspectionImage.create({
      data: {
        inspectionId,
        imageUrl,
        aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        detectedIssues: detectedIssues ? JSON.stringify(detectedIssues) : null,
        queenDetected: queenDetected || null
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Napaka pri dodajanju slike:', error)
    return NextResponse.json({ error: 'Napaka pri dodajanju slike' }, { status: 500 })
  }
}

// GET - Pridobi vse slike za inspekcijo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inspectionId = searchParams.get('inspectionId')

    if (!inspectionId) {
      return NextResponse.json({ error: 'ID inspekcije je obvezen' }, { status: 400 })
    }

    const images = await db.inspectionImage.findMany({
      where: { inspectionId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Napaka pri pridobivanju slik:', error)
    return NextResponse.json({ error: 'Napaka pri pridobivanju slik' }, { status: 500 })
  }
}
