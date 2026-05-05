import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST - Analiziraj sliko panja z AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, analyzeQueen = true, analyzeDiseases = true } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL slike je obvezen' }, { status: 400 })
    }

    const zai = await ZAI.create()

    // Sestavimo prompt glede na to, kaj želimo analizirati
    let prompt = `Analiziraj to sliko čebeljega panja in podaj podrobno oceno. Odgovor mora biti v slovenščini in v JSON formatu s sledečo strukturo:
{
  "overallHealth": "ODLIČNO | DOBRO | SREDNJE | SLABO | KRITIČNO",
  "beePopulation": "ODLIČNA | DOBRA | SREDNJA | NIZKA",
  "signsOfDisease": ["seznam zaznanih znakov bolezni ali prazno, če ni nič"],
  "possibleDiseases": [
    {
      "name": "ime bolezni",
      "probability": "visoka | srednja | nizka",
      "detectedSymptoms": ["seznam zaznanih simptomov"]
    }
  ],
  "observations": [
    "seznam drugih opazkov",
    "npr. prisotnost kraljice",
    "stanje okvira",
    "prisotnost medu",
    "prisotnost cvetnega prahu"
  ],
  "recommendations": [
    "seznam priporočil za cebelarja"
  ],
  "summary": "kratko povzetek analize v 1-2 stavkih"
`

    if (analyzeQueen) {
      prompt += `,
  "queenAnalysis": {
    "queenSpotted": true/false,
    "queenLocation": "opis lokacije kraljice na sliki",
    "queenHealth": "DOBRO | POVRAČENA | NEZNANO",
    "queenPattern": [
      "opis vzorca čebel, ki kažejo prisotnost kraljice",
      "npr. obroč okrog kraljice",
      "vrstica čebel"
    ],
    "eggCellsVisible": true/false,
    "broodPattern": "DOBR vzorec legla | SLAB vzorec legla | BREZ legla"
  }`
    } else {
      prompt += `,
  "queenAnalysis": null`
    }

    prompt += `
}

Pozorno preglej sliko in iskaj:
${analyzeDiseases ? `- Znake bolezni (varroa, nosež, afrikanizirane čebele, glistačnost, itd.)` : ''}
- Stanje čebel (število, aktivnost)
${analyzeQueen ? `
- PRISOTNOST MATICE:
  * Išči večjo čebelo z razločnim telesom
  * Išči čebele, ki se obnašajo občutljivo ali so sicer obrobljene
  * Išči obroč ali vzorec čebel, ki je lahko okoli matice
  * Išči znake razlegelih celic (jajčeca)
  * Ocenjaj, ali je vzorec legla pravilen` : ''}
- Stanje okvirov (čista, umazana, z medom, z leglom)
- Katerikoli drug vidik, ki je pomemben za zdravje čebel
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

    // Poskusi parsati JSON iz odgovora
    let analysis
    try {
      // Poišči JSON v odgovoru (lahko je v ```json bloku)
      const jsonMatch = content?.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        // Če ni JSON formata, vrni surov odgovor
        analysis = {
          rawAnalysis: content,
          overallHealth: 'NEZNANO',
          summary: 'Analiza ni bila uspešno prevedena v JSON'
        }
      }
    } catch (e) {
      analysis = {
        rawAnalysis: content,
        overallHealth: 'NEZNANO',
        summary: 'Napaka pri parsanju odgovora'
      }
    }

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Napaka pri analizi slike:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri analizi slike',
      details: error instanceof Error ? error.message : 'Neznana napaka'
    }, { status: 500 })
  }
}
