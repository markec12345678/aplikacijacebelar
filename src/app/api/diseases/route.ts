import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Pridobi vse bolezni
export async function GET() {
  try {
    const diseases = await db.disease.findMany({
      orderBy: { severity: 'desc' }
    })
    return NextResponse.json(diseases)
  } catch (error) {
    console.error('Napaka pri pridobivanju bolezni:', error)
    return NextResponse.json({ error: 'Napaka pri pridobivanju bolezni' }, { status: 500 })
  }
}

// POST - Dodaj novo bolezen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nameSl, description, symptoms, treatment, prevention, severity } = body

    if (!name || !description) {
      return NextResponse.json({ error: 'Ime in opis so obvezni' }, { status: 400 })
    }

    const disease = await db.disease.create({
      data: {
        name,
        nameSl: nameSl || null,
        description,
        symptoms: Array.isArray(symptoms) ? JSON.stringify(symptoms) : symptoms,
        treatment: treatment || null,
        prevention: prevention || null,
        severity: severity || 'MEDIUM'
      }
    })

    return NextResponse.json(disease, { status: 201 })
  } catch (error) {
    console.error('Napaka pri dodajanju bolezni:', error)
    return NextResponse.json({ error: 'Napaka pri dodajanju bolezni' }, { status: 500 })
  }
}
