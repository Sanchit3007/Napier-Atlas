import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Every figure below comes from a source in that strain's `sources`. Yields are fresh fodder per acre a year;
// methane figures are lab results per ton of organic matter. (1 hectare = 2.47 acres.)
const SOURCES = {
  grassBmp: {
    label: 'Methane potential of 11 Thai field grasses incl. Napier (SEATUC Journal of Science and Engineering)',
    url: 'https://www.jstage.jst.go.jp/article/sjse/2/1/2_8/_article/-char/en',
  },
  dwarfBmp: {
    label: 'Methane production of dwarf Napier with alkaline pretreatment (RMUTL Engineering Journal)',
    url: 'https://ph01.tci-thaijo.org/index.php/RMUTLEngJ/article/view/184104',
  },
  tnauHybrid: {
    label: 'TNAU Agritech – Cumbu Napier hybrid: planting and harvest intervals',
    url: 'https://agritech.tnau.ac.in/agriculture/CropProduction/Forage%20Crops/foragecrops_cumbunapier.html',
  },
  pccPakchong: {
    label: 'Philippine Carabao Center – Super Napier (Pakchong-1) seminar by Dr. Krailas Kiyothong',
    url: 'https://www.pcc.gov.ph/super-napier-seen-to-boost-local-dairy-production/',
  },
  co5Kau: {
    label: 'CO-5: a bajra napier hybrid for coconut gardens (Journal of Tropical Agriculture, KAU)',
    url: 'https://jtropag.kau.in/index.php/ojs2/article/view/1450',
  },
  co5Icar: {
    label: 'CO (BN) 5 fed to buffaloes: nutrient composition (Indian Journal of Veterinary & Animal Sciences Research)',
    url: 'https://epubs.icar.org.in/index.php/IJVASR/article/download/130676/63396/498968',
  },
  co5Phyto: {
    label: 'CO (BN) 5 green and dry fodder yield trial, Coimbatore (Journal of Pharmacognosy and Phytochemistry)',
    url: 'https://phytojournal.com/archives/2020/vol9issue4/PartY/9-3-92-819.pdf',
  },
  dwarfUms: {
    label: 'Yield and quality of tall and dwarf Napier cultivars in Malaysia (Universiti Malaysia Sabah)',
    url: 'https://eprints.ums.edu.my/22310/',
  },
  mottJitaa: {
    label: 'Mott, Taiwan and King Napier compared (Journal of the Indonesian Tropical Animal Agriculture)',
    url: 'https://ejournal.undip.ac.id/index.php/jitaa/article/view/7440',
  },
  purpleGoats: {
    label: 'Anthocyanin-rich purple Napier silage for dairy goats (Veterinary World, via PubMed Central)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11784049/',
  },
  purpleAnthocyanin: {
    label: 'Anthocyanin profiles of Napier grass cultivars (Foods, via PubMed Central)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12345973/',
  },
  kingGrass: {
    label: 'Nutritional quality and biomass of King grass at four cutting ages (Scientific Reports, via PubMed Central)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8257580/',
  },
  feedipedia: {
    label: 'Feedipedia (INRAE, CIRAD, AFZ, FAO) – Elephant grass: composition, ash and yields',
    url: 'https://www.feedipedia.org/node/395',
  },
  napierReview: {
    label: 'Napier grass management for dairy and meat production: yield and nutritive value (review, PubMed Central)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10682400/',
  },
} satisfies Record<string, Prisma.StrainSourceCreateInput>;

const STRAINS: Prisma.NapierStrainCreateInput[] = [
  {
    name: 'Super Napier (Pakchong-1)',
    slug: 'super-napier-pakchong-1',
    scientificName: 'Pennisetum purpureum × Pennisetum glaucum (Napier × pearl millet hybrid)',
    origin: 'Thailand (Dr. Krailas Kiyothong, Department of Livestock Development)',
    crudeProtein: 17.0, // breeder: 16–18%
    dryMatter: 23.0,
    annualYieldTons: 200, // breeder: ~500 t/ha/yr ≈ 200 t/acre, irrigated best case
    firstHarvestDays: 75, // TNAU: first cut 75–80 days after planting
    ratoonCycleDays: 45, // TNAU: then every 45 days
    maxHeightFeet: 15.0,
    bioCngPotential: 'Up to ~250 m³ CH₄ per ton of organic matter (lab tests on Napier grass; no Pakchong-only figure published)',
    suitableSoils: ['Black Cotton', 'Loamy', 'Red Soil', 'Alluvial'],
    waterRequirement: 'Irrigate on day 3 after planting, then about every 10 days (TNAU guidance for hybrid Napier)',
    keyHighlights: [
      'Bred in Thailand by Dr. Krailas Kiyothong as a Napier × pearl millet hybrid',
      'Breeder reports about 500 t/ha of fresh grass a year, against 360–400 t/ha for ordinary Napier',
      'Breeder reports 16–18% crude protein, against 8–12% for ordinary Napier cut at 45–55 days',
    ],
    bestFor: 'Dual purpose: dairy fodder and Bio-CNG feedstock',
    sources: [SOURCES.pccPakchong, SOURCES.tnauHybrid, SOURCES.grassBmp, SOURCES.feedipedia],
  },
  {
    name: 'TNAU CO-5 Hybrid Napier',
    slug: 'tnau-co-5-hybrid',
    scientificName: 'Pennisetum glaucum × Pennisetum purpureum, CO (BN) 5 (fodder cumbu IP 20594 × Napier FD 437)',
    origin: 'Tamil Nadu Agricultural University, Coimbatore (released 2013)',
    crudeProtein: 13.1, // buffalo feeding study: 13.05% of DM
    dryMatter: 21.5, // Coimbatore trial: 12.6 t dry from 58.6 t green per cut
    annualYieldTons: 70, // Kerala trial: 173.6 t/ha green fodder in the open (≈ 70 t/acre)
    firstHarvestDays: 75,
    ratoonCycleDays: 45,
    maxHeightFeet: 11.5,
    bioCngPotential: 'Up to ~250 m³ CH₄ per ton of organic matter (lab tests on Napier grass; no CO-5-only figure published)',
    suitableSoils: ['Red Soil', 'Sandy Loam', 'Alluvial', 'Black Cotton'],
    waterRequirement: 'Irrigate on day 3 after planting, then about every 10 days (TNAU guidance for hybrid Napier)',
    keyHighlights: [
      'Released by TNAU in 2013 from fodder cumbu IP 20594 × Napier FD 437',
      'Gave 174 t/ha of green fodder in the open and 117 t/ha under 50% shade in a Kerala trial',
      'About 13% crude protein in a buffalo feeding study',
    ],
    bestFor: 'Year-round green fodder, including partly shaded plots such as coconut gardens',
    sources: [SOURCES.co5Kau, SOURCES.co5Icar, SOURCES.co5Phyto, SOURCES.tnauHybrid, SOURCES.grassBmp, SOURCES.feedipedia],
  },
  {
    name: 'Dwarf Napier (Mott)',
    slug: 'smart-dwarf-napier',
    scientificName: 'Pennisetum purpureum cv. Mott (dwarf Napier)',
    origin: 'Dwarf selection of Napier grass, grown widely in Southeast Asia',
    crudeProtein: 16.0, // dwarf Napier: 12–20% across harvest ages
    dryMatter: 19.5,
    annualYieldTons: 40, // lowest-yielding type; studies give no reliable annual fresh figure
    firstHarvestDays: 60,
    ratoonCycleDays: 45,
    maxHeightFeet: 5.0,
    bioCngPotential: '181 m³ CH₄ per ton of organic matter (lab test on dwarf Napier after 1-hour alkaline pretreatment)',
    suitableSoils: ['Loamy', 'Red Soil', 'Alluvial'],
    waterRequirement: 'Moderate',
    keyHighlights: [
      'Highest leaf-to-stem ratio (3.93) of the Napier cultivars tested in Malaysia',
      '12–20% crude protein across harvest ages, the best quality of the cultivars tested',
      'Lower dry matter yield than tall types such as Taiwan and King',
    ],
    bestFor: 'High-quality fodder for grazing goats, sheep and dairy cattle',
    sources: [SOURCES.dwarfUms, SOURCES.mottJitaa, SOURCES.dwarfBmp, SOURCES.feedipedia],
  },
  {
    name: 'Red Napier (Purple Napier)',
    slug: 'red-napier-anthocyanin',
    scientificName: 'Pennisetum purpureum (purple semi-dwarf cultivar)',
    origin: 'Developed by the USDA and the University of Georgia; grown in Thailand as purple Napier',
    crudeProtein: 17.5, // Onjai-Uea et al., as cited in the goat silage study: 17.49%
    dryMatter: 22.7, // goat silage study: 22.66%
    annualYieldTons: 46, // review: typical Napier 26 t DM/ha/yr ≈ 46 t fresh/acre at 22.7% DM
    firstHarvestDays: 75,
    ratoonCycleDays: 45,
    maxHeightFeet: 8.0,
    bioCngPotential: 'Up to ~250 m³ CH₄ per ton of organic matter (lab tests on Napier grass; no purple-Napier figure published)',
    suitableSoils: ['Loamy', 'Black Cotton', 'Red Soil'],
    waterRequirement: 'Moderate',
    keyHighlights: [
      'Semi-dwarf purple cultivar developed by the USDA and the University of Georgia',
      'Highest anthocyanin content of the Napier cultivars tested (about 5 mg/g cyanidin-3-glucoside)',
      'Higher crude protein than Napier Pakchong-1 in a Thai comparison',
    ],
    bestFor: 'Dairy and goat fodder; anthocyanin-rich silage is under study',
    sources: [SOURCES.purpleGoats, SOURCES.purpleAnthocyanin, SOURCES.napierReview, SOURCES.grassBmp, SOURCES.feedipedia],
  },
  {
    name: 'Giant King Napier (Biomass Grade)',
    slug: 'giant-king-biomass',
    scientificName: 'Pennisetum purpureum (King grass type)',
    origin: 'Tall King grass type grown for biomass',
    crudeProtein: 9.6, // King grass study: 6.5–12.8% depending on cutting age
    dryMatter: 25.0,
    annualYieldTons: 130, // Feedipedia: up to 80 t DM/ha/yr with high fertiliser ≈ 130 t fresh/acre at 25% DM
    firstHarvestDays: 75,
    ratoonCycleDays: 60, // King grass study: highest biomass when cut every 60 days
    maxHeightFeet: 15.0,
    bioCngPotential: 'Up to ~250 m³ CH₄ per ton of organic matter (lab tests on Napier grass; no King-grass-only figure published)',
    suitableSoils: ['Black Cotton', 'Alluvial', 'Loamy', 'Marginal Lands'],
    waterRequirement: 'Moderate; yield depends heavily on fertiliser',
    keyHighlights: [
      'Fertilised King grass cut every 60 days gave about 124 t of dry matter per hectare a year in a 2021 study',
      'Crude protein fell from about 12.8% to 6.5% as cutting age rose from 30 to 90 days',
      'High-fertiliser Napier stands typically yield 20–80 t of dry matter per hectare a year',
    ],
    bestFor: 'Bio-CNG and biomass feedstock where tonnage matters more than protein',
    sources: [SOURCES.kingGrass, SOURCES.napierReview, SOURCES.grassBmp, SOURCES.feedipedia],
  },
];

// Earlier names that were misleading: the data is for cv. Mott, and for purple Napier rather than "Purple King Grass".
const RENAMED: [from: string, to: string][] = [
  ['Smart Napier (Taiwan Dwarf)', 'Dwarf Napier (Mott)'],
  ['Red Napier (Purple King Grass)', 'Red Napier (Purple Napier)'],
];

async function main() {
  // Updates strains in place, so saved estimates and visitors' history are kept.
  console.log('🌿 Updating 5 Napier grass strains from published sources...');
  await Promise.all(
    STRAINS.map((strain) => prisma.napierStrain.upsert({ where: { slug: strain.slug }, update: strain, create: strain })),
  );

  // Saved estimates find their strain by name, so carry renamed strains over.
  await Promise.all(
    RENAMED.map(([from, to]) =>
      prisma.simulationLog.updateMany({ where: { recommendedStrain: from }, data: { recommendedStrain: to } }),
    ),
  );

  // The consultation inquiries were placeholder records for the dropped Module 6.
  const removed = await prisma.consultationInquiry.deleteMany();
  console.log(`🧹 Removed ${removed.count} placeholder consultation inquiries`);

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
