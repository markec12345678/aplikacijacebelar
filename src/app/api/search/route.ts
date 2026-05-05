import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST - Išči po spletu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, num = 10 } = body

    if (!query) {
      return NextResponse.json({ error: 'Query je obvezen' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const results = await zai.functions.invoke('web_search', {
      query,
      num
    })

    return NextResponse.json({
      success: true,
      results,
      count: results.length
    })
  } catch (error) {
    console.error('Napaka pri iskanju:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri iskanju',
      details: error instanceof Error ? error.message : 'Neznana napaka'
    }, { status: 500 })
  }
}
