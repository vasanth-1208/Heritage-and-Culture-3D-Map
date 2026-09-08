// ─── Virtual Tourism – Destination Data Store ─────────────────────────────
const DESTINATIONS = [
  {
    id: 2,
    slug: "amber-fort-jaipur",
    name: "Amber Fort",
    city: "Jaipur",
    state: "Rajasthan",
    lat: 26.9855,
    lng: 75.8513,
    image: "/images/cards/rajasthan/jaipur/amber-fort.jpg",
    categories: ["Forts & Palaces", "UNESCO"],
    description: "A majestic hilltop fort built from red sandstone and marble, blending Hindu and Mughal architectural styles.",
    featured: true,
    recommendedTheme: "light"   // Sunlit sandstone & marble — warm golden tones shine in light mode
  },
  {
    id: 1,
    slug: "meenakshi-amman-temple-madurai",
    name: "Meenakshi Amman Temple",
    city: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9195,
    lng: 78.1193,
    image: "/images/cards/tamilnadu/madurai/madurai-meenakshiamman-temple-cards.jpg",
    categories: ["Temples", "Art & Culture"],
    description: "An iconic Dravidian temple complex in Madurai, celebrated for towering gopurams and intricate sculptures.",
    featured: true,
    languages: ["EN", "HI", "TA"],
    tourConfig: { tid: "madurai", xmlVersion: "20260403-1945", soundVersion: "20260403-1945" },
    recommendedTheme: "dark",    // Vivid polychrome gopurams — colors pop dramatically against dark backgrounds
    capabilities: {
      tour360: true,
      vrHeadset: true,
      multiLanguage: true,
      vr180: false,
      aiGuide: false,
      digitalTwin: false,
      spatialVR: false
    },
    gallery: [
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-1.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-2.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-3.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-4.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-5.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-6.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-7.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-8.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-9.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-10.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-11.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-12.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-13.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-14.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-15.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-16.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-17.jpg",
      "/images/gallery/tamilnadu/madurai/madurai-meenakshi-vt-18.jpg"
    ]
  },
  {
    id: 3,
    slug: "vijaya-vitthala-temple-hampi",
    name: "Vijaya Vitthala Temple",
    city: "Hampi",
    state: "Karnataka",
    lat: 15.3350,
    lng: 76.4600,
    image: "/images/cards/karnataka/hampi/vijaya-vitthala-stone-chariot.jpg",
    categories: ["UNESCO"],
    description: "A masterpiece of Vijayanagara architecture in Hampi, famed for its stone chariot and ornate temple halls.",
    featured: false,
    recommendedTheme: "light"   // Open-air ruins bathed in natural light — earthy stone tones suit light mode
  },
  {
    id: 4,
    slug: "mysore-palace-mysore",
    name: "Mysore Palace",
    city: "Mysore",
    state: "Karnataka",
    lat: 12.3052,
    lng: 76.6552,
    image: "/images/cards/karnataka/mysore-palace/mysore-palace-vt-cards-1.jpg",
    categories: ["Forts & Palaces", "Art & Culture"],
    description: "A historical palace and royal residence, known for its incredible architecture and illuminations.",
    featured: true,
    languages: ["EN", "HI", "KN"],
    tourConfig: { tid: "mysore", xmlVersion: "20260403-1945", soundVersion: "20260403-1945" },
    recommendedTheme: "dark",    // Iconic 100K-bulb night illumination — dark mode is the signature experience
    capabilities: {
      tour360: true,
      vrHeadset: true,
      multiLanguage: true,
      vr180: false,
      aiGuide: false,
      digitalTwin: false,
      spatialVR: false
    },
    gallery: [
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-01.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-02.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-03.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-04.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-05.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-06.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-07.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-08.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-09.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-10.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-11.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-12.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-13.jpg",
      "/images/gallery/karnataka/mysore-palace/mysore-palace-vt-14.jpg"
    ]
  },
  {
    id: 5,
    slug: "thirumalai-nayakkar-mahal-madurai",
    name: "Thirumalai Nayakkar Mahal",
    city: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9238,
    lng: 78.1232,
    image: "/images/cards/tamilnadu/madurai/thirumalai-nayakkar-mahal.jpg",
    categories: ["Forts & Palaces", "Art & Culture"],
    description: "A grand 17th-century palace in Madurai known for its Indo-Saracenic arches, massive pillars, and royal court halls.",
    featured: false,
    recommendedTheme: "dark"    // Deep arched interiors with dramatic pillar shadows — dark mode enhances depth
  },
  {
    id: 6,
    slug: "ajanta-caves-aurangabad",
    name: "Ajanta Caves",
    city: "Aurangabad",
    state: "Maharashtra",
    lat: 20.5519,
    lng: 75.7033,
    image: "/images/cards/maharashtra/aurangabad/ajanta-caves.jpg",
    categories: ["UNESCO", "Art & Culture"],
    description: "A UNESCO World Heritage ensemble of ancient rock-cut Buddhist cave monuments with priceless murals and sculptures.",
    featured: true,
    languages: ["EN", "HI"],
    tourConfig: { tid: "ajanta", xmlVersion: "20260410-1410", soundVersion: "20260410-1410" },
    recommendedTheme: "dark",    // Cave interiors with ancient murals — dark mode mirrors the natural low-light ambiance
    capabilities: {
      tour360: true,
      vrHeadset: true,
      multiLanguage: true,
      vr180: false,
      aiGuide: false,
      digitalTwin: false,
      spatialVR: false
    }
  },
  {
    id: 7,
    slug: "ellora-caves-aurangabad",
    name: "Ellora Caves",
    city: "Aurangabad",
    state: "Maharashtra",
    lat: 20.0268,
    lng: 75.1790,
    image: "/images/cards/maharashtra/aurangabad/ellora-caves-kailasa.jpg",
    categories: ["UNESCO", "Art & Culture"],
    description: "A remarkable UNESCO heritage complex featuring Buddhist, Hindu, and Jain cave monuments carved from basalt cliffs.",
    featured: true,
    languages: ["EN", "HI"],
    tourConfig: { tid: "ellora", xmlVersion: "20260526-1648", soundVersion: "20260526-1648" },
    recommendedTheme: "dark",    // Basalt cliff carvings with deep shadow play — dark mode heightens sculptural drama
    capabilities: {
      tour360: true,
      vrHeadset: true,
      multiLanguage: true,
      vr180: false,
      aiGuide: false,
      digitalTwin: false,
      spatialVR: false
    }
  },
  {
    id: 8,
    slug: "shore-temple-mahabalipuram",
    name: "Shore Temple",
    city: "Mahabalipuram",
    state: "Tamil Nadu",
    lat: 12.6166,
    lng: 80.1999,
    image: "/images/cards/tamilnadu/mahabalipuram/shore-temple.jpg",
    categories: ["UNESCO"],
    description: "A historic Pallava-era temple on the Bay of Bengal, part of Mahabalipuram's UNESCO-listed monuments.",
    featured: false,
    recommendedTheme: "light"   // Coastal temple with ocean backdrop — bright sky and blue water suit light mode
  },
  {
    id: 9,
    slug: "five-rathas-mahabalipuram",
    name: "Five Rathas",
    city: "Mahabalipuram",
    state: "Tamil Nadu",
    lat: 12.6076,
    lng: 80.1943,
    image: "/images/cards/tamilnadu/mahabalipuram/five-rathas.jpg",
    categories: ["UNESCO"],
    description: "Monolithic rock-cut temple structures in Mahabalipuram, showcasing early Dravidian architectural experimentation.",
    featured: false,
    recommendedTheme: "light"   // Open-air monoliths under full sun — stone detail clarity peaks in light mode
  },
  {
    id: 10,
    slug: "hill-lock-monuments-mahabalipuram",
    name: "Hill-lock Monuments",
    city: "Mahabalipuram",
    state: "Tamil Nadu",
    lat: 12.6273,
    lng: 80.1922,
    image: "/images/cards/tamilnadu/mahabalipuram/hill-lock-monuments.jpg",
    categories: ["UNESCO", "Art & Culture"],
    description: "UNESCO-recognized hill-side heritage monuments in Mahabalipuram that reflect Pallava-era artistry and stone carving traditions.",
    featured: false,
    recommendedTheme: "light"   // Hillside open-air carvings with natural greenery — bright natural light is ideal
  },
  {
    id: 11,
    slug: "brihadeeswara-temple-thanjavur",
    name: "Brihadeeswara Temple",
    city: "Thanjavur",
    state: "Tamil Nadu",
    lat: 10.7828,
    lng: 79.1319,
    image: "/images/cards/tamilnadu/thanjavur/brihadeeswara-temple-thanjavur.jpg",
    categories: ["UNESCO", "Temples"],
    description: "The Great Living Chola Temple at Thanjavur, renowned for its towering vimana and exceptional Chola-period craftsmanship.",
    featured: true,
    languages: ["EN"],
    tourConfig: { tid: "thanjavur", engine: "pano2vr", xmlVersion: "20260908", soundVersion: "20260908" },
    recommendedTheme: "dark",   // Towering granite vimana in dramatic evening illumination — luxury dark mode
    capabilities: {
      tour360: true,
      vrHeadset: true,
      multiLanguage: false,
      vr180: false,
      aiGuide: false,
      digitalTwin: false,
      spatialVR: false
    },
    gallery: [
      "/images/gallery/tamilnadu/thanjavur/thanjavur-gallery-1.jpg",
      "/images/gallery/tamilnadu/thanjavur/thanjavur-gallery-2.jpg",
      "/images/gallery/tamilnadu/thanjavur/thanjavur-gallery-3.jpg",
      "/images/gallery/tamilnadu/thanjavur/thanjavur-gallery-4.jpg"
    ]
  },
  {
    id: 12,
    slug: "airavatesvara-temple-darasuram",
    name: "Airavatesvara Temple",
    city: "Darasuram",
    state: "Tamil Nadu",
    lat: 10.9455,
    lng: 79.3566,
    image: "/images/cards/tamilnadu/darasuram/airavatesvara-temple-darasuram.jpg",
    categories: ["UNESCO", "Temples"],
    description: "A UNESCO-listed Chola temple in Darasuram known for exquisite stone carvings and detailed sculptural storytelling.",
    featured: false,
    recommendedTheme: "light"   // Intricate stone carvings demand maximum detail visibility — light mode excels
  },
  {
    id: 13,
    slug: "brihadeeswara-temple-gangaikonda-cholapuram",
    name: "Brihadeeswara Temple",
    city: "Gangaikonda Cholapuram",
    state: "Tamil Nadu",
    lat: 11.2105,
    lng: 79.4515,
    image: "/images/cards/tamilnadu/gangaikondacholapuram/brihadeeswara-gangaikonda-cholapuram.jpg",
    categories: ["UNESCO", "Temples"],
    description: "A monumental Chola temple at Gangaikonda Cholapuram, part of the Great Living Chola Temples UNESCO heritage group.",
    featured: false,
    recommendedTheme: "light"   // Grand open-air Chola architecture — sunlit monumental forms suit light mode
  },
  {
    id: 14,
    slug: "jantar-mantar-jaipur",
    name: "Jantar Mantar",
    city: "Jaipur",
    state: "Rajasthan",
    lat: 26.9248,
    lng: 75.8246,
    image: "/images/cards/rajasthan/jaipur/jantar-mantar-jaipur.jpg",
    categories: ["UNESCO", "Art & Culture"],
    description: "An 18th-century astronomical observatory in Jaipur and UNESCO site featuring massive masonry instruments.",
    featured: true,
    recommendedTheme: "light"   // White/cream geometric instruments in open sun — high-contrast forms need light mode
  },
  {
    id: 15,
    slug: "nataraja-temple-chidambaram",
    name: "Nataraja Temple",
    city: "Chidambaram",
    state: "Tamil Nadu",
    lat: 11.3994,
    lng: 79.6932,
    image: "/images/cards/tamilnadu/chidambaram/nataraja-temple-chidambaram.jpg",
    categories: ["Temples", "Art & Culture"],
    description: "A major Shaivite temple in Chidambaram, revered for the cosmic dance form of Lord Nataraja and rich ritual heritage.",
    featured: false,
    recommendedTheme: "dark"    // Sacred interior with golden Nataraja — warm accents glow against dark backgrounds
  }
];

// ─── Category Definitions ──────────────────────────────────────────────────
const CATEGORIES = [
  { name: "UNESCO", icon: "unesco" },
  { name: "Temples", icon: "temple" },
  { name: "Forts & Palaces", icon: "fort-palace" },
  { name: "Art & Culture", icon: "arts-culture" }
];

// ─── Hero Slides ────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: "/images/hero/tamilnadu/thanjavur/thanjavur-hero.jpg",
    title: "Brihadeeswara Temple, Thanjavur",
    subtitle: "The towering 66-metre granite marvel of Raja Raja Chola I"
  },
  {
    image: "/images/hero/tamilnadu/madurai/madurai-meenakshi.jpg",
    title: "Meenakshi Amman Temple, Madurai",
    subtitle: "A jewel of Dravidian architecture"
  },
  {
    image: "/images/hero/tamilnadu/darasuram/unesco-darasuram.jpg",
    title: "Airavatesvara Temple, Darasuram",
    subtitle: "UNESCO Great Living Chola Temples"
  },
  {
    image: "/images/hero/tamilnadu/gangaikondacholapuram/unesco-gangaikondacholapuram-1.jpg",
    title: "Gangaikonda Cholapuram",
    subtitle: "The grand capital of the Cholas"
  },
  {
    image: "/images/hero/tamilnadu/mamallapuram/unesco-mamallapuram-1.jpg",
    title: "Group of Monuments at Mahabalipuram",
    subtitle: "Pallava dynasty's architectural marvels"
  }
];

// ─── SVG Icons for Categories (inline) ──────────────────────────────────────
// Detailed line-art illustrations — each icon depicts a recognizable Indian landmark/scene
function getCategoryIcon(iconKey) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const suffix = theme === 'dark' ? '-night' : '';
  return `/images/icons/${iconKey}${suffix}.png`;
}
