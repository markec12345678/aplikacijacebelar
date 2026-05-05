import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Počisti obstoječe bolezni
    await db.disease.deleteMany({})

    // Dodaj bolezni
    const diseases = [
      {
        name: 'Varroa destructor (Varoza)',
        nameSl: 'Varoza',
        description: 'Varoza je parazitska bolezen, ki jo povzroča pršica Varroa destructor. Napada čebele odrasle in ličinke ter je ena največjih groženj čebelarstvu.',
        symptoms: JSON.stringify([
          'Sibke čebele z deformiranimi krili',
          'Odrgnjene krilne membrane',
          'Manjša velikost čebel',
          'Povečana smrtnost ličink',
          'Prisotnost pršic na čebelah'
        ]),
        treatment: 'Zdravljenje z mlečno kislinami, timolom, amitrazom ali drugimi akaricidi. Redno spremljanje stopnje okužbe.',
        prevention: 'Uporaba matic z odpornostjo na varozo, redna preverjanja, uporaba predelanih panjev, biotehnični ukrepi (rezanje ličink).',
        severity: 'CRITICAL'
      },
      {
        name: 'American Foulbrood (Ameriška gnilec)',
        nameSl: 'Ameriška glistečnost',
        description: 'Ameriška glistečnost je nalezljiva bakterijska bolezen legla, ki jo povzroča Paenibacillus larvae. Pogubna je za ličinke in ni zdravljiva.',
        symptoms: JSON.stringify([
          'Siva do rjava barva pokritih okvirov',
          'Gnezdni pokrovci so luknjasti ali vrstičasti',
          'Pokrovci so potopljeni',
          'Smetanevasto do gumijasto konsistenco ličink',
          'Nepravilen vonj (jajčevček)'
        ]),
        treatment: 'Ukrepi v okviru nacionalnih predpisov, pogosto zahteva uničenje okvirov ali celotnega panja.',
        prevention: 'Higiena, prezračevanje, izogibanje okuženim materialom, redni pregledi.',
        severity: 'CRITICAL'
      },
      {
        name: 'European Foulbrood (Evropska glistečnost)',
        nameSl: 'Evropska glistečnost',
        description: 'Evropska glistečnost je bakterijska bolezen legla, ki jo povzroča Melissococcus plutonius. Vpliva na ličinke in je manj smrtna kot ameriška glistečnost.',
        symptoms: JSON.stringify([
          'Ličinke umrejo v različnih fazah',
          'Ličinke so nagnjene, spremenjene barve (rumenkaste do rjave)',
          'Vonn učinek (kislo)'
        ]),
        treatment: 'Zdravljenje z antibiotiki (z dovoljenjem), okrepitev družine, prezračevanje, dodajanje zdravih okvirov.',
        prevention: 'Higiena, izogibanje stresu za čebele, dobra prehrana, redni pregledi.',
        severity: 'HIGH'
      },
      {
        name: 'Chalkbrood',
        nameSl: 'Kamnita legla',
        description: 'Kamnita legla je glivična bolezen legla, ki jo povzroča Ascosphaera apis. Ličinke mumificirajo in postanejo trde kot kamen.',
        symptoms: JSON.stringify([
          'Mumificirane ličinke v okvirih',
          'Ličinke so trde, porcelanaste',
          'Sprva bela, kasneje siva ali črna barva',
          'Ličinke so enostavno odstranljive'
        ]),
        treatment: 'Ni zdravljenja, družina se lahko okrepi sama z dobrimi pogoji.',
        prevention: 'Prezračevanje, izogibanje vlage in hladi, dobra prehrana, zamenjava matice.',
        severity: 'MEDIUM'
      },
      {
        name: 'Nosema (Nosemosis)',
        nameSl: 'Nozejoza',
        description: 'Nozejoza je bolezen odraslih čebel, ki jo povzroča mikrosporidijska gliva Nosema spp. Napada črevo in vpliva na prehrano in energijsko ravnovesje.',
        symptoms: JSON.stringify([
          'Razširjenost (diareja) pri čebelah',
          'Sibke čebele',
          'Zmanjšana aktivnost',
          'Okužene čebele izkašljujejo'
        ]),
        treatment: 'Zdravljenje s fumagilinom ali drugimi antiprotozojskimi sredstvi.',
        prevention: 'Dobra prehrana, prezračevanje, izogibanje stresu, redna zamenjava panjev.',
        severity: 'HIGH'
      },
      {
        name: 'Wax Moth (Goveja molja)',
        nameSl: 'Goveja molja',
        description: 'Goveja molja je škodljivec, ki napada čebelje vosk. Ličinke molje jedo vosak, med in plesen.',
        symptoms: JSON.stringify([
          'Mrežaste steze v vosku',
          'Goveji iztrebki v okvirih',
          'Poškodovani okvirji',
          'Prisotnost ličink in odraslih moljev'
        ]),
        treatment: 'Odstranjevanje prizadetih okvirov, fizična uničenje ličink, uporaba pasivnih pasti.',
        prevention: 'Močne družine, redni pregledi, shranjevanje okvirov v hladnih, suhih pogojih.',
        severity: 'MEDIUM'
      },
      {
        name: 'Sacbrood',
        nameSl: 'Vrečasta glistečnost',
        description: 'Vrečasta glistečnost je virusna bolezen legla, ki jo povzroča Sacbrood virus. Ličinke razvijajo vrečo in umrejo.',
        symptoms: JSON.stringify([
          'Ličinke z vrečastim izgledom',
          'Siva do rjava barva',
          'Pokrovci so odprti',
          'Vlažna, gumijasta tekstura'
        ]),
        treatment: 'Ni specifičnega zdravljenja. Družina se lahko okrepi sami.',
        prevention: 'Higiena, redni pregledi, izogibanje stresu, krepitev družine.',
        severity: 'LOW'
      },
      {
        name: 'Deformed Wing Virus (DWV)',
        nameSl: 'Virus deformiranih kril',
        description: 'Virus deformiranih kril se pogosto prenaša s pršico Varroa. Povzroča deformacije kril in oslabljenost družin.',
        symptoms: JSON.stringify([
          'Deformirana kril pri odraslih čebelah',
          'Sibka družina',
          'Povečana smrtnost',
          'Pomanjkanje kraljice'
        ]),
        treatment: 'Ni zdravljenja. Nadziranje varroze pomaga zmanjšati širjenje virusa.',
        prevention: 'Kontrola varroze, uporaba matic z odpornostjo, krepitev družin.',
        severity: 'HIGH'
      }
    ]

    for (const disease of diseases) {
      await db.disease.create({
        data: disease
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Dodano bolezni:',
      count: diseases.length
    })
  } catch (error) {
    console.error('Napaka pri sejanju:', error)
    return NextResponse.json({
      success: false,
      error: 'Napaka pri sejanju bolezni'
    }, { status: 500 })
  }
}
