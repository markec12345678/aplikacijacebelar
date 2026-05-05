import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// POST - Popoln workflow: poslikaj → analiziraj → shrani → priporočila
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      hiveId,
      imageUrl, // base64 slika
      analyzeQueen = true,
      analyzeDiseases = true,
      additionalData = {} // Dodatni podatki o inspekciji (beePopulation, broodFrames, etc.)
    } = body

    if (!hiveId) {
      return NextResponse.json({ error: 'ID panja je obvezen' }, { status: 400 })
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL slike je obvezen' }, { status: 400 })
    }

    // KORAK 1: AI analiza slike
    const zai = await ZAI.create()

    let prompt = `Analiziraj to sliko čebeljega panja in podaj podrobno oceno. Odgovor mora biti v slovenščini in v JSON formatu s sledečo strukturo:
{
  "overallHealth": "ODLIČNO | DOBRO | SREDNJE | SLABO | KRITIČNO",
  "healthScore": 0-100,
  "beePopulation": "ODLIČNA | DOBRA | SREDNJA | NIZKA",
  "signsOfDisease": ["seznam zaznanih znakov bolezni ali prazno, če ni nič"],
  "possibleDiseases": [
    {
      "name": "ime bolezni",
      "probability": "visoka | srednja | nizka",
      "severity": "nizka | srednja | visoka | kritična",
      "detectedSymptoms": ["seznam zaznanih simptomov"],
      "urgency": "nemudno zdravljenje | zdravljenje v 24h | zdravljenje v tednu dni | redna kontrola"
    }
  ],
  "observations": [
    "seznam drugih opazkov",
    "npr. prisotnost kraljice",
    "stanje okvira",
    "prisotnost medu",
    "prisotnost cvetnega prahu",
    "prisotnost hrane"
  ],
  "recommendations": [
    "seznam specifičnih priporočil za cebelarja",
    "razvrščenih po pomembnosti"
  ],
  "actionItems": [
    {
      "action": "opis dejanja",
      "priority": "visoka | srednja | nizka",
      "deadline": "nemudno | 24 urah | v tednu dni | naslednja inspekcija"
    }
  ],
  "summary": "kratko povzetek analize v 2-3 stavkih"
`

    if (analyzeQueen) {
      prompt += `,
  "queenAnalysis": {
    "queenSpotted": true/false,
    "queenLocation": "opis lokacije matice na sliki",
    "queenHealth": "DOBRO | POVRAČENA | NEZNANO",
    "queenAge": "matica je mlada (1-2 leta) | matica je starejša (3+ leta) | ni mogoče določiti",
    "queenPattern": [
      "opis vzorca čebel, ki kažejo prisotnost matice",
      "npr. obroč okrog matice",
      "vrstica čebel",
      "občutljivo obnašanje drugih čebel"
    ],
    "eggCellsVisible": true/false,
    "broodPattern": "DOBER VZOREC LEGLA | SLAB VZOREC LEGLA | BREZ LEGLA | ZMEŠAN VZOREC",
    "broodHealth": "zdravo | obolevno | omejeno",
    "workerActivity": "visoka | srednja | nizka"
  }`
    } else {
      prompt += `,
  "queenAnalysis": null`
    }

    prompt += `
}

POZORNO PREGLEDAJ SLIKO IN ISKAJ:
${analyzeDiseases ? `- ZNAKI BOLEZNI:
  * Varroa (razvojne celice z odprtimi pokrovčki, deformirane čebele)
  * Nosež (črne punečne celice, gnusni vonj)
  * Glistačnost (povečani trebuhi, umirajoče ličinke)
  * Melissococcus pluton (belo, vodeno leglo)
  * Ascosphaera apis (mumificirane ličinke)
  * Škodljivci (molj, miš, mravlje)
  * Kuga (črne punečne celice z gnojem)
  * Bakterijske okužbe (gnilnost, paratifus)
  * Fizične poškodbe (okvare, škoda od ptic)` : ''}
${analyzeQueen ? `- PRISOTNOST MATICE:
  * Išči VEČJO čebelo z razločnim telesom (matica je 50% večja od delavk)
  * Išči čebele, ki se obnašajo OBČUTLJIVO ali so drugače obrobljene kot delavke
  * Išči OBROČ ali VZOREC čebel, ki je lahko okoli matice
  * Išči ZNAKE RAZLEGALEH celic (jajčeca so okrogle v obročih)
  * Ocenjaj, ali je vzorec legla PRAVILEN (kompakten, brez praznih mest)
  * Matička je lahko BREZ OZNAKB oz. se obnaša drugače od drugih čebel
  * Dejavne delavke kažejo prisotnost matice` : ''}
- STANJE ČEBEL:
  * Število populacije (veliko, srednje, malo)
  * Aktivnost (letijo, zbiralke, straže)
  * Zdravstveno stanje (koža, krila, posamezne čebele)
- STANJE OKVIROV:
  * Čisti (zlate, svetle)
  * Umazani (črni, gnusni)
  * Z medom (polni srebrnimi pokrovčki)
  * Z leglom (odprte celice, razlegle)
  * Prazni (brez vsebine)
- PRISOTNOST HRANE:
  * Med (srebrni pokrovčki)
  * Cvetni prah (rumene/oranžne celice)
  - Pelud (zunaj panja)
- DRUGI OPAZKI:
  * Tok letenja
  * Vonj (dišava, gnusni vonj, kvasni vonj)
  * Poškodbe (členi, puknjene celice)

POMEMBNA NAVODILA:
- MATIČKA (kraljica) je VELJA in razločna od delavk (približno 2x večja)
- Okoli matičke je pogosto OBROČ čebel
- Razlegle celice (jajčeca) so OKROGLE v obročih, ne v razmajanih vzorcih
- Prisotnost matičke kaže ZDRAV in aktiven panj
- ZNAKI BOLEZNI so nujni za prepoznavo - če so prisotni, navedi vse
- PRIPOOROČILA morajo biti PRAKTIČNA in UKREPNA (kaj narediti, kdaj, kako)
- PRIHODNOST je pomembna - vključi priporočila za nadaljnje ukrepe
`

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    })

    const content = response.choices[0]?.message?.content

    // Parsiraj JSON odgovor
    let analysis
    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Ni JSON odgovora')
      }
    } catch (e) {
      analysis = {
        rawAnalysis: content,
        overallHealth: 'NEZNANO',
        healthScore: 50,
        summary: 'Analiza ni bila uspešno prevedena v JSON'
      }
    }

    // KORAK 2: Ustvari inspekcijo
    const healthMap: Record<string, string> = {
      'ODLIČNO': 'EXCELLENT',
      'DOBRO': 'GOOD',
      'SREDNJE': 'FAIR',
      'SLABO': 'POOR',
      'KRITIČNO': 'CRITICAL',
      'NEZNANO': 'GOOD'
    }

    const inspection = await db.inspection.create({
      data: {
        hiveId,
        beeHealth: healthMap[analysis.overallHealth] || 'GOOD',
        beePopulation: additionalData.beePopulation || null,
        broodFrames: additionalData.broodFrames || null,
        honeyFrames: additionalData.honeyFrames || null,
        pollenFrames: additionalData.pollenFrames || null,
        notes: analysis.summary || null,
        diseases: analysis.possibleDiseases?.length > 0
          ? JSON.stringify(analysis.possibleDiseases.map((d: any) => d.name))
          : null,
        queenSpotted: analysis.queenAnalysis?.queenSpotted || null
      }
    })

    // KORAK 3: Shrani sliko z AI analizo
    const image = await db.inspectionImage.create({
      data: {
        inspectionId: inspection.id,
        imageUrl,
        aiAnalysis: JSON.stringify(analysis),
        detectedIssues: analysis.signsOfDisease?.length > 0
          ? JSON.stringify(analysis.signsOfDisease)
          : null,
        queenDetected: analysis.queenAnalysis?.queenSpotted || null
      }
    })

    // KORAK 4: Posodobi status panja glede na analizo
    let hiveStatus = 'ACTIVE'
    if (analysis.overallHealth === 'KRITIČNO' || analysis.overallHealth === 'SLABO') {
      hiveStatus = 'SICK'
    } else if (analysis.overallHealth === 'SREDNJE') {
      hiveStatus = 'WEAK'
    }

    // Če ni matice, označi kot šibek
    if (analyzeQueen && !analysis.queenAnalysis?.queenSpotted) {
      hiveStatus = 'WEAK'
    }

    await db.hive.update({
      where: { id: hiveId },
      data: {
        lastInspection: new Date(),
        status: hiveStatus as any
      }
    })

    // KORAK 5: Ustvari priporočila na podlagi analize
    const recommendations = {
      urgentActions: analysis.actionItems?.filter((item: any) => item.priority === 'visoka') || [],
      scheduledActions: analysis.actionItems?.filter((item: any) => item.priority === 'srednja') || [],
      futureActions: analysis.actionItems?.filter((item: any) => item.priority === 'nizka') || [],
      generalRecommendations: analysis.recommendations || [],
      detectedDiseases: analysis.possibleDiseases || [],
      healthStatus: {
        overall: analysis.overallHealth,
        score: analysis.healthScore,
        needsAttention: analysis.overallHealth !== 'ODLIČNO' && analysis.overallHealth !== 'DOBRO'
      },
      queenStatus: analysis.queenAnalysis ? {
        present: analysis.queenAnalysis.queenSpotted,
        health: analysis.queenAnalysis.queenHealth,
        needsReplacement: !analysis.queenAnalysis.queenSpotted ||
                         analysis.queenAnalysis.queenHealth === 'POVRAČENA'
      } : null
    }

    return NextResponse.json({
      success: true,
      data: {
        inspection,
        image,
        analysis,
        recommendations,
        hive: {
          id: hiveId,
          status: hiveStatus,
          lastInspection: new Date()
        }
      },
      message: workflowMessage(analysis)
    }, { status: 201 })

  } catch (error) {
    console.error('Napaka pri workflowu:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri izvajanju workflowa',
      details: error instanceof Error ? error.message : 'Neznana napaka'
    }, { status: 500 })
  }
}

function workflowMessage(analysis: any): string {
  const messages = {
    'ODLIČNO': 'Panj je v odličnem stanju. Nadaljujte z rednimi pregledi.',
    'DOBRO': 'Panj je v dobrem stanju. Zavedajte se priporočil za izboljšanje.',
    'SREDNJE': 'Panj zahteva pozornost. Sledite priporočilom za izboljšanje stanja.',
    'SLABO': 'Panj je v slabem stanju. Nemudoma izvedite ukrepe za izboljšanje.',
    'KRITIČNO': 'KRITIČNO: Panj zahteva nemudno ukrepanje! Takoj začnite z zdravljenjem.',
    'NEZNANO': 'Analiza je bila končana. Pregledajte rezultate in izvedite potrebne ukrepe.'
  }

  return messages[analysis.overallHealth] || 'Analiza končana.'
}
