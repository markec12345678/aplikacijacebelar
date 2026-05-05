import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST - Analiziraj spletno stran
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL je obvezen' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const result = await zai.functions.invoke('page_reader', {
      url
    })

    return NextResponse.json({
      success: true,
      title: result.data.title,
      html: result.data.html,
      text: result.data.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      url: result.data.url,
      publishedTime: result.data.publishedTime
    })
  } catch (error) {
    console.error('Napaka pri branju spletne strani:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri branju spletne strani',
      details: error instanceof Error ? error.message : 'Neznana napaka'
    }, { status: 500 })
  }
}
