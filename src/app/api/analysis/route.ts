import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Analiza uteži za panj
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hiveId = searchParams.get('hiveId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!hiveId) {
      return NextResponse.json({ error: 'ID panja je obvezen' }, { status: 400 })
    }

    // Pridobi merilve za obdobje
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const weights = await db.weight.findMany({
      where: {
        hiveId,
        date: { gte: startDate },
        source: 'SCALE'
      },
      orderBy: { date: 'asc' }
    })

    if (weights.length === 0) {
      return NextResponse.json({
        success: true,
        hiveId,
        days,
        message: 'Ni meritev v izbranem obdobju',
        data: null
      })
    }

    // Izračun statistike
    const weightValues = weights.map(w => w.hiveWeight || 0).filter(v => v > 0)
    const minWeight = Math.min(...weightValues)
    const maxWeight = Math.max(...weightValues)
    const avgWeight = weightValues.reduce((a, b) => a + b, 0) / weightValues.length

    // Prva in zadnja vrednost
    const firstWeight = weights[0]?.hiveWeight || avgWeight
    const lastWeight = weights[weights.length - 1]?.hiveWeight || avgWeight

    // Sprememba v obdobju
    const change = lastWeight - firstWeight
    const changePercent = firstWeight > 0 ? (change / firstWeight) * 100 : 0

    // Trend - rastoč ali padajoč
    const trend = change >= 0 ? 'RASTE' : 'PADA'
    const trendStrength = Math.abs(changePercent)

    // Ocena medila (povprečno iz vseh)
    const avgHoneyYield = weights
      .map(w => w.honeyYield || 0)
      .reduce((a, b) => a + b, 0) / weights.length

    // Pripravi podatke za graf
    const chartData = weights.map(w => ({
      date: w.date.toISOString(),
      weight: w.hiveWeight || 0,
      honeyYield: w.honeyYield || 0
    }))

    return NextResponse.json({
      success: true,
      hiveId,
      days,
      statistics: {
        minWeight: Math.round(minWeight * 10) / 10,
        maxWeight: Math.round(maxWeight * 10) / 10,
        avgWeight: Math.round(avgWeight * 10) / 10,
        firstWeight: Math.round(firstWeight * 10) / 10,
        lastWeight: Math.round(lastWeight * 10) / 10,
        change: Math.round(change * 10) / 10,
        changePercent: Math.round(changePercent * 10) / 10,
        trend,
        trendStrength: Math.round(trendStrength * 10) / 10,
        avgHoneyYield: Math.round(avgHoneyYield * 10) / 10
      },
      chartData,
      measurementsCount: weights.length,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Napaka pri analizi uteži:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri analizi uteži',
      details: error instanceof Error ? error.message : 'Neznana napaka'
    }, { status: 500 })
  }
}
