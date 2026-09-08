// ─── Virtual Tourism – Enriched Destination Content ─────────────────────────
// Keyed by slug. Merged into each destination record at runtime by destination.js.
// Add dest.video = 'https://www.youtube.com/embed/VIDEO_ID' when videos are ready.
// Set comingSoon: false (or remove it) when a real KRpano tour is deployed for that slug.
const DEST_CONTENT = {

  // ── Destinations WITH real virtual tours (comingSoon NOT set) ─────────────

  // ── Destinations WITHOUT real tours yet (comingSoon: true) ─────────────────
  'amber-fort-jaipur': {
    comingSoon: true,
    seoContent: "Amber Fort (Amer Fort) is a UNESCO World Heritage hilltop citadel 11 km north of Jaipur, built by Raja Man Singh I in 1592 CE. Its red sandstone ramparts, Sheesh Mahal (Palace of Mirrors), and ornate Ganesh Pol gateway blend Rajput and Mughal artistry at its finest. Our 360° virtual tour lets you roam every sun-drenched courtyard and royal chamber — narrated in English and Hindi with immersive audio commentary.",
    faq: [
      { q: "What are Amber Fort timings and entry fee?", a: "Open 8:00 AM – 5:30 PM daily. Entry: ₹100 (Indians), ₹500 (Foreigners). Audio guide ₹150 extra. Light & Sound Show: 7:30 PM (Hindi) & 8:30 PM (English)." },
      { q: "How do I reach Amber Fort from Jaipur?", a: "11 km from central Jaipur — take a cab, auto-rickshaw or bus No. 5 from MI Road (~30 minutes). Elephant rides available seasonally from Jaleb Chowk at the base." },
      { q: "What is the best time to visit?", a: "October to March for cool weather (15–25°C). Arrive by 8:30 AM for golden morning light and thin crowds." }
    ],
    travel: {
      bestTime: "October – March",
      nearestAirport: "Jaipur International (JAI), 25 km",
      nearestRailway: "Jaipur Junction, 14 km",
      entryFee: "₹100 (Indians) | ₹500 (Foreigners)",
      timings: "8:00 AM – 5:30 PM daily",
      tips: ["Arrive early to avoid tour groups", "Wear flat shoes — cobblestone ramps can be slippery", "Hire a licensed guide at the gate (₹200–300)", "Combine with nearby Jaigarh Fort via the hilltop path"]
    }
  },

  // ── Destinations WITH real virtual tours (comingSoon NOT set) ─────────────
  'meenakshi-amman-temple-madurai': {
    // ── Hero copy ────────────────────────────────────────────────────────────
    heroHeadline:    "The Temple That Outlived Empires",
    heroSubHeadline: "A 360° walk through Meenakshi Amman, Madurai — eight centuries of Pandyan memory, Nayak ambition, and a goddess with fish-shaped eyes who still rules a living city.",
    eyebrow:         "Madurai, Tamil Nadu · Pandyan origins, Nayak rebuilding (16th–17th c.) · 14 gopurams · ~14-acre complex · Active worship · UNESCO World Heritage tentative list",

    // ── Welcome / intro blurb (rendered above the fold, before seoContent) ──
    welcomeBlurb: "Welcome to the 360° Virtual Tour of the Meenakshi-Sundareswarar Temple\n\nYou are stepping into a 360° virtual tour of the Meenakshi Amman Temple, Madurai — corridors, the Thousand-Pillar Hall, the Golden Lotus Tank, and more — captured as an immersive VR walkthrough you can take from any browser on desktop/mobile, cardboard device or a VR headset. A virtual tour is not a substitute for the temple. It is its doorway. Step in — the light here is always good.",

    // ── Main SEO / editorial content ────────────────────────────────────────
    seoContent: "To approach Meenakshi Amman is to walk into a city that has been calling itself ancient for as long as it has had a name. Tamil Sangam poems from the early centuries of the Common Era already speak of Madurai as a capital of the Pandyans, fragrant with jasmine, loud with chariot trade, and presided over by a temple to the goddess.\n\nWhat stands now is largely a 16th- and 17th-century Nayak rebuilding, raised after the catastrophic raid of Malik Kafur in 1310 CE. It is to the Nayak rulers — and above all to Tirumalai Nayak (r. 1623–1659) — that the temple owes its present scale: its great enclosing walls, the major gopurams, the granite ceremonial halls, the painted ceilings, and the breadth of the courtyards that an unhurried visitor still measures in minutes.\n\nOf the fourteen towers, the southern Rajagopuram rises to roughly 52 metres and is encrusted with several thousand stucco figures — gods, demons, dynasties, dancers, the entire moral universe rendered in colour. What looks like exuberance is in fact a strict iconographic grammar: each tier is a horizontal narrative band, painted and repainted on a cycle the temple has maintained for centuries.\n\nThe Aayiram Kaal Mandapam (Thousand-Pillar Hall, built 1569) is in truth a hall of 985 pillars carved as deities, yali, gymnasts, musicians, and donor figures — a small group of which produce musical notes when struck. At the temple's centre, the Pottramarai Kulam (Golden Lotus Tank) is ringed by a cloistered colonnade; in Tamil literary tradition this is the pool where the Sangam poets submitted their verses for divine judgement.\n\nThe temple's mythology is set down in the Tiruvilaiyadal Puranam. From the flames of a royal fire sacrifice steps a three-year-old girl named Tatatakai — the world will come to call her Meenakshi, 'fish-eyed', for her long elegant eyes. Raised as her father's heir, she learns statecraft and the arts of war. She conquers the four directions and climbs Mount Kailasa itself, where she meets Shiva. The third breast falls away — the warrior queen recognises her consort. They descend to Madurai for the Tirukalyanam, celebrated each April–May as the Chithirai Festival — one of the largest sacred performances in Asia, drawing more than a million pilgrims.\n\nA virtual tour is not a substitute for the smell of camphor and jasmine, for the cool of granite under bare feet, for the murmur of aarti at first light. What it can do is give you the geography in your bones before you arrive — so that when you do, you walk in not as a tourist, but as someone returning to a place they already half-know.",

    // ── KRpano scene narrations (index matches scene order in tour.xml) ──────
    scenes: [
      {
        id:    "southern-gopuram",
        title: "Southern Gopuram, Outer View",
        narration: "You are looking at the Rajagopuram, the southern tower, the tallest of the temple's fourteen gateways. Roughly 170 feet of brick and stucco, recoloured by the temple's own craftsmen on a cycle that goes back centuries. Every figure you can pick out — the dancers, the gods, the yali at the corners — sits in a horizontal band that you are meant to read like a manuscript: bottom upward, dharma to liberation."
      },
      {
        id:    "entrance-mandapam",
        title: "Entrance Mandapam",
        narration: "The threshold itself is a study in scale: granite columns rise to a coffered ceiling painted in mineral pigment. The figures carved into the pillars are not decoration; they are the temple's roll call of donors, guardians, and the divine attendants who, in the South Indian theology of place, animate the building."
      },
      {
        id:    "pottramarai-kulam",
        title: "Pottramarai Kulam — Golden Lotus Tank",
        narration: "The water tank at the temple's centre. Look at the colonnade around the pool: this is the literal location where, by Tamil tradition, the Sangam poets submitted their verses to be judged by the gods. The pool faces south; in the early morning, the eastern light cuts across the water and lifts the painted ceiling of the surrounding cloister."
      },
      {
        id:    "thousand-pillar-hall",
        title: "Aayiram Kaal Mandapam — Thousand-Pillar Hall",
        narration: "You are standing inside the hall built in 1569 by the Nayak general Ariyanatha Mudaliar. Each pillar is its own sculpture: a goddess, a king, a horseman, a musician. A small group of pillars on the eastern aisle produce distinct musical notes when struck. The hall now also houses the temple's museum."
      },
      {
        id:    "meenakshi-sannidhi",
        title: "Meenakshi Sannidhi — Inner Sanctum, Goddess",
        narration: "The southern sanctum, the heart of the temple. The deity here is Meenakshi in her standing form, carved in green stone, draped each morning in fresh silks. The lamps that you see are not ceremonial — they are working lamps, lit before dawn for the first ritual of the day and tended in unbroken rotation."
      },
      {
        id:    "sundareswarar-sannidhi",
        title: "Sundareswarar Sannidhi — Inner Sanctum, Shiva",
        narration: "The northern sanctum, dedicated to Sundareswarar, 'the beautiful lord' — a form of Shiva who, in Madurai's theology, exists for the sake of his bride. The arrangement is unusual: in most South Indian temples the god is the principal deity. Here the order is reversed, and it is the husband who is named in second place."
      },
      {
        id:    "painted-ceiling",
        title: "Painted Ceiling — Kalyana Mandapam",
        narration: "The ceiling above you carries vegetable-pigment painting from the Nayak period, restored in patches but largely original. The work belongs to the same school as the Vijayanagara wall paintings at Lepakshi and Hampi, and it is one of the few interiors in India where you can still see this idiom in situ."
      }
    ],

    // ── Closing editorial copy ───────────────────────────────────────────────
    closingCopy: "A virtual tour is not a substitute for the smell of camphor and jasmine, for the cool of granite under bare feet, for the murmur of aarti at first light. What it can do is give you the geography in your bones before you arrive — so that when you do, you walk in not as a tourist, but as someone returning to a place they already half-know. That, in the older South Indian sense, is what pilgrimage was meant to be.",

    // ── Related tours (slug rail) ────────────────────────────────────────────
    relatedTours: [
      "thirumalai-nayakkar-mahal-madurai",
      "brihadeeswara-temple-thanjavur",
      "airavatesvara-temple-darasuram",
      "nataraja-temple-chidambaram",
      "vijaya-vitthala-temple-hampi"
    ],

    // ── FAQ (8 questions) ────────────────────────────────────────────────────
    faq: [
      {
        q: "How old is the Meenakshi Amman Temple?",
        a: "The site has been a place of worship since at least the early centuries of the Common Era, on the testimony of Tamil Sangam literature. The temple's present architecture is largely a 16th- and 17th-century Nayak rebuilding, raised after the destruction of Madurai by Malik Kafur in 1310 CE. An ancient address, a comparatively modern building."
      },
      {
        q: "Why is the goddess called Meenakshi?",
        a: "Meen is 'fish' in Tamil; akshi is 'eye' in Sanskrit. 'Meenakshi' — 'the fish-eyed one' — refers to the long, elegant eyes by which she is iconographically recognised. She is a form of the goddess Parvati in her independent, sovereign aspect."
      },
      {
        q: "Why is the goddess named first and not the god?",
        a: "Madurai's theological tradition treats Meenakshi as the principal deity in her own right — a queen who rules before she marries. Her consort Sundareswarar exists in the temple, in the local theology, for her sake. Inscriptions, ritual order and pilgrim traffic all confirm this priority."
      },
      {
        q: "Is the temple a UNESCO World Heritage Site?",
        a: "Not yet. It is on the UNESCO World Heritage tentative list of India. Its sister Pandyan-Chola monuments — the Brihadeeswara temples of Thanjavur, Gangaikonda Cholapuram, and the Airavatesvara temple at Darasuram — already form the 'Great Living Chola Temples' inscription."
      },
      {
        q: "What is the Chithirai Festival?",
        a: "The annual twelve-day celebration of the divine wedding of Meenakshi and Sundareswarar, staged in April–May. The goddess is carried in procession through Madurai. It is among the largest sacred performances in Asia and consistently draws more than a million pilgrims."
      },
      {
        q: "How long does a thorough visit take?",
        a: "An unhurried first visit, including the Thousand-Pillar Hall museum and a circuit of the four outer gopurams, takes between two and three hours. Pilgrims who include the full darshan sequence and the Pottramarai Kulam plan for half a day."
      },
      {
        q: "Can I take photographs inside?",
        a: "Outdoor photography of the gopurams is permitted. Mobile phones, cameras and recording devices are not permitted inside the inner sanctums, and the policy is enforced at the entry checkpoints."
      },
      {
        q: "Why see it virtually before visiting?",
        a: "Because the temple is dense, busy and easy to miss. A virtual walk before the trip lets you identify the gates you want to enter from, the corners that take light at the hour you intend to visit, and the architectural sequences you would otherwise pass without seeing."
      }
    ],

    // ── Travel card ─────────────────────────────────────────────────────────
    travel: {
      bestTime:        "November – March (Chithirai Festival in April–May is unmissable)",
      nearestAirport:  "Madurai International Airport (IXM), 12 km",
      nearestRailway:  "Madurai Junction, 1 km",
      entryFee:        "Free darshan · Museum (Thousand-Pillar Hall) ticketed · Special darshan queues ₹50–100",
      timings:         "05:00 – 12:30 | 16:00 – 22:00 daily (pooja times vary)",
      tips: [
        "Visit at dawn for morning rituals — abhishekam starts before 6 AM",
        "The evening deepa aradhanai (8–9 PM) is deeply moving",
        "Men: dhoti or trousers + shirt. Women: saree or salwar-kameez. Shorts not permitted in inner enclosures",
        "Leave footwear at the cloakroom at each cardinal gate",
        "Hire a licensed temple guide for full iconographic narration",
        "Combine with Thirumalai Nayakkar Mahal (1.5 km) and Gandhi Memorial Museum (3 km)"
      ]
    }
  },

  'vijaya-vitthala-temple-hampi': {
    comingSoon: true,
    seoContent: "The Vijaya Vitthala Temple at Hampi is a UNESCO masterpiece of 15th-century Vijayanagara architecture, famed for its stone chariot with rotating granite wheels and 56 musical pillars that produce distinct notes when tapped. Our virtual tour explores the grand Kalyana Mandapam and exquisitely carved pavilions of this awe-inspiring ancient site.",
    faq: [
      { q: "What are the timings and entry fee?", a: "8:30 AM – 5:30 PM daily. Entry: ₹30 (Indians), ₹500 (Foreigners). Electric carts run from Hampi Bazaar to the temple (₹30 return)." },
      { q: "When is the best time to visit Hampi?", a: "November to February for pleasant weather. Hampi Utsav festival (November) adds cultural performances amid the ruins." }
    ],
    travel: {
      bestTime: "November – February",
      nearestAirport: "Hubli Airport (HBX), 143 km",
      nearestRailway: "Hospet Junction, 13 km",
      entryFee: "₹30 (Indians) | ₹500 (Foreigners)",
      timings: "8:30 AM – 5:30 PM daily",
      tips: ["Rent a bicycle to explore the 40 sq km site at your own pace", "Visit Matanga Hill at sunrise for panoramic views", "Do not strike the musical pillars hard — they are protected", "Allow a full day for Hampi"]
    }
  },

  'mysore-palace-mysore': {
    seoContent: "Welcome to the virtual reality tour of Mysore Palace, a digital odyssey into the heart of Karnataka’s royal heritage. As the gates of the Amba Vilas Palace swing open in this immersive 360° experience, you are transported to a world where opulence meets history. Known as the \"City of Palaces,\" Mysuru finds its crowning jewel here—a structure so magnificent it is said to be the second most visited landmark in India after the Taj Mahal.\n\nThis is not merely a virtual tour; it is a cinematic passage through time. Whether you are a global traveler planning your next tours & travel adventure or a history enthusiast seeking a virtual reality escape, this experience brings the vibrant colors, shimmering gold, and architectural genius of the Wodeyar dynasty directly to your screen. Prepare to witness a living monument that bridges the gap between ancient royal legacy and modern VR360 technology.\n\n<h2 class=\"dest-content-heading\">A Legacy of the Wodeyars: Chronicles of the Palace</h2>\n\nThe story of Mysore Palace is a narrative of resilience. While the site has been home to a royal residence since the 14th century, the palace you see today in our virtual tour was born from the ashes of a tragic fire in 1897. During the wedding of Princess Jayalakshmmanni, the original wooden palace was consumed by flames.\n\nMaharani Kempananjammanni Devi and her son, Maharaja Krishnaraja Wodeyar IV, commissioned British architect Henry Irwin to rebuild the dream. Completed in 1912, this new edifice became the official seat of the Kingdom of Mysore. As you navigate the VR360 scenes, you are walking through a structure that cost over 41 lakh rupees at the time—a staggering investment that successfully preserved the dignity and artistic soul of the Wodeyar lineage for generations to come.\n\n<h2 class=\"dest-content-heading\">The Masterpiece of Indo-Saracenic Architecture</h2>\n\nMysore Palace is the ultimate masterpiece of Indo-Saracenic architecture. Through our virtual reality lens, you can observe a harmonious blend of Hindu, Mughal, Rajput, and Gothic styles.\n\nThe exterior, built from fine grey granite with deep pink marble domes, features towering arches and bay windows that define royal luxury. Look upward in the vr360 viewer to see the five-storied tower capped with a gilded dome, standing 145 feet tall. Inside, the craftsmanship reaches a fever pitch: the Kalyana Mantapa (Marriage Pavilion) boasts a peacock-themed stained glass ceiling from Glasgow, while the Ambavilasa (Private Durbar Hall) glitters with silver-inlaid rosewood doors and ornate chandeliers.\n\n<h2 class=\"dest-content-heading\">Step Inside: The VR360 Immersion Experience</h2>\n\nOur virtualtourism.in platform leverages cutting-edge VR technology to provide a perspective usually reserved for royalty.\n\n<strong>The Golden Howdah:</strong> Get an intimate look at the 80kg golden elephant seat, a masterpiece of craftsmanship.\n\n<strong>Doll’s Pavilion (Gombe Thotti):</strong> Explore a curated collection of traditional Indian dolls and European sculpture.\n\n<strong>The Royal Throne:</strong> Virtually stand before the 200kg Jewel-Encrusted Golden Throne, displayed only during festivals. Using vr360 navigation, you can toggle between the sun-drenched courtyards of the day and the legendary illumination of the night, where nearly 100,000 bulbs transform the palace into a constellation of gold.\n\n<h2 class=\"dest-content-heading\">The Golden Glow: Mysore Dasara and Living Traditions</h2>\n\nNo vr tour of Mysore is complete without the spirit of Dasara. For ten days, the palace becomes the epicenter of a state festival that celebrates the victory of Goddess Chamundeshwari over the demon Mahishasura. Our virtual reality platform captures the essence of the Jumboo Savari—the grand procession where an elephant carries the idol of the goddess through the streets. This is virtual reality travel at its best, allowing you to experience the \"Nadahabba\" (state festival) regardless of the calendar.",
    faq: [
      { q: "What is a Mysore Palace virtual tour?", a: "A virtual tour is an online experience using vr360 photography that allows you to navigate the rooms, halls, and grounds of Mysore Palace from your phone or VR headset." },
      { q: "Who built the current Mysore Palace?", a: "The current palace was designed by British architect Henry Irwin and commissioned by the Wodeyar dynasty after the old wooden palace burned down in 1897." },
      { q: "Why is Mysore Palace famous for virtual reality?", a: "Due to its intricate ceilings and sprawling halls, it is a perfect subject for vr tours & travel, as virtual reality allows you to see details (like the stained glass ceilings) that are hard to appreciate from the ground." },
      { q: "Can I see the palace lights in the virtual tour?", a: "Yes, our virtualtourism platform offers toggles to view the palace in its iconic illuminated state, featuring nearly 100,000 electric bulbs." },
      { q: "Is Mysore Palace open every day?", a: "Yes, the physical palace is open daily, but our virtualtour is available 24/7 for global exploration." }
    ],
    travel: {
      bestTime: "October – February (Dasara in October is unmissable)",
      nearestAirport: "Mysore Airport (MYQ), 10 km | Bengaluru (BLR), 145 km",
      nearestRailway: "Mysore Junction, 1.5 km",
      entryFee: "₹70 (Adults) | ₹30 (Children)",
      timings: "10:00 AM – 5:30 PM daily",
      tips: [
        "Location: Located in the heart of Mysore city, Karnataka.",
        "Illumination: The palace is typically lit on Sundays and public holidays from 7:00 PM to 8:00 PM.",
        "Pro Tip: Use our virtualtour to scout the best angles for photography before you arrive for a physical visit.",
        "Note that while the exterior is a photographer's dream, photography is restricted in certain inner museum galleries."
      ]
    },
    imageAlts: [
      "Exterior view of Mysore Palace illuminated at night for virtual tour.",
      "Intricate stained glass ceiling of the Kalyana Mantapa in 360 degrees.",
      "Golden Howdah elephant seat inside Mysore Palace museum."
    ]
  },

  'thirumalai-nayakkar-mahal-madurai': {
    comingSoon: true,
    seoContent: "Built in 1636 by King Thirumalai Nayak, this grand Indo-Saracenic palace in Madurai features soaring 20-metre stucco columns, sweeping horseshoe arches, and an octagonal domed Swargavilasa pavilion. Though only a quarter of the original survives, what remains is one of Tamil Nadu's most impressive royal monuments, brought to life each evening by a dramatic Light & Sound Show.",
    faq: [
      { q: "What are the timings and entry fee?", a: "9:00 AM – 1:00 PM and 2:00 PM – 5:00 PM. Light & Sound Show: 6:45 PM (Tamil) and 8:00 PM (English). Entry: ₹50 adults." },
      { q: "How far is it from Meenakshi Amman Temple?", a: "Just 1.5 km south — a 10-minute walk or 5-minute auto-rickshaw ride. Combine both in a single half-day itinerary." }
    ],
    travel: {
      bestTime: "October – March",
      nearestAirport: "Madurai Airport (IXM), 14 km",
      nearestRailway: "Madurai Junction, 2 km",
      entryFee: "₹50 (Adults) | Light & Sound Show: ₹25–50",
      timings: "9:00 AM – 5:00 PM daily",
      tips: ["Combine with Meenakshi Amman Temple on the same day", "The evening Light & Sound Show is highly recommended", "Arrive early for the best photography light"]
    }
  },

  'ajanta-caves-aurangabad': {
    seoContent: "Welcome to the virtual reality tour of Ajanta Caves, a profound digital pilgrimage into one of the world’s most significant repositories of Buddhist art. Nestled within a remote, horseshoe-shaped gorge in the Sahyadri hills, these 30 rock-cut monuments lay hidden under a dense shroud of jungle for over a millennium until their accidental rediscovery in 1819.\n\nThrough our virtualtour technology, you are no longer a spectator; you are an explorer. As the light from your screen mimics the soft torches of ancient monks, you will witness the zenith of Indian craftsmanship. This vr360 experience brings you face-to-face with frescoes that have defined Asian art for centuries, offering a level of intimacy and detail that transcends traditional tours & travel. Step inside the silence of these ancient halls and let the walls tell you the story of the Buddha.\n\n<h2 class=\"dest-content-heading\">CHRONICLES OF THE CLIFF: A History Carved in Basalt</h2>\n\nThe story of Ajanta begins in the 2nd century BCE, carved directly into the basaltic rock by generations of Buddhist monks who sought a monsoon retreat. These caves were developed in two distinct phases: the early Hinayana period and the later, more ornate Mahayana phase under the patronage of the Vakataka dynasty.\n\nFor centuries, these caves were vibrant centers of learning, prayer, and artistic expression. However, as the focus of the region shifted, the monasteries were abandoned, and the jungle reclaimed the site. It wasn't until a British officer on a tiger-hunting expedition spotted a carved entrance through the foliage that Ajanta was returned to the world. Our virtualtourism platform preserves this sense of \"discovery,\" allowing you to navigate the same paths that lay untouched for 1,500 years.\n\n<h2 class=\"dest-content-heading\">THE ART OF THE SACRED: Murals and Meaning</h2>\n\nAjanta is globally renowned for its paintings—masterpieces that represent the peak of ancient human creativity. Using a virtual reality headset or your browser, you can zoom into the famous Padmapani and Vajrapani Bodhisattvas in Cave 1.\n\nThe artists used a \"fresco-secco\" technique, applying natural pigments to a dry lime plaster. These murals do not just depict religious icons; they illustrate the Jataka Tales—stories of the Buddha’s previous lives—rendered with such emotional depth that they feel startlingly modern. In our vr360 view, you can appreciate the graceful poses, the subtle play of shadows on the faces, and the intricate jewelry that offers a window into the royal fashion of the Gupta and Vakataka eras.\n\n<h2 class=\"dest-content-heading\">ARCHITECTURAL WONDERS: Viharas and Chaityas</h2>\n\nThe architecture of Ajanta is a miracle of engineering. Without the use of scaffolding, ancient architects carved from the top down, creating two types of structures that you can explore in this virtualtour:\n\n<strong>Viharas (Monasteries):</strong> Square halls lined with small cells where monks lived and meditated. Cave 1 and 16 are magnificent examples, featuring massive carved pillars and central shrines.\n\n<strong>Chaityas (Prayer Halls):</strong> Vaulted, cathedral-like spaces designed for congregational worship. Cave 19 and 26 are highlights of our vr experience, featuring majestic stupas and ribbed ceilings that mimic wooden architecture.\n\n<h2 class=\"dest-content-heading\">WHY AJANTA MATTERS: A Global Legacy</h2>\n\nAjanta is not just an Indian treasure; it is a UNESCO World Heritage site that influenced art across the Silk Road, from Afghanistan to China and Japan. It represents a rare moment in history where art and spirituality reached a perfect, harmonious equilibrium. By utilizing virtual reality travel, we ensure that this fragile heritage is accessible to everyone, protecting the physical murals from excessive human contact while sharing their beauty with the world.",
    faq: [
      { q: "Is there an Ajanta Caves virtualtour available?", a: "Yes. Our virtualtourism.in platform provides a high-definition vr360 tour that allows you to explore the interiors of the most famous caves, including Caves 1, 2, 19, and 26." },
      { q: "What is the best way to experience Ajanta Caves in VR?", a: "For the most immersive experience, use a virtual reality headset like Meta Quest. However, our tours are fully optimized for desktop and mobile browsers, allowing for smooth 360° navigation." },
      { q: "Are the paintings at Ajanta Caves original?", a: "Yes, the murals you see in the vr tour are the original paintings dating back to the 2nd century BCE and 5th century CE. They are among the oldest and best-preserved examples of ancient Indian painting." },
      { q: "How many caves are there in Ajanta?", a: "There are 30 rock-cut caves in total, including both monasteries (Viharas) and worship halls (Chaityas)." },
      { q: "Why is Ajanta Caves a UNESCO World Heritage site?", a: "It was inscribed by UNESCO in 1983 for its unique artistic influence and its role as a masterpiece of Buddhist religious art and architecture." }
    ],
    travel: {
      bestTime: "October – March (Winter) | June – September (Monsoon for lush landscapes)",
      nearestAirport: "Aurangabad Airport (IXU), 107 km",
      nearestRailway: "Jalgaon Junction, 59 km (closer than Aurangabad)",
      entryFee: "₹40 (Indians) | ₹600 (Foreigners)",
      timings: "Tuesday – Sunday: 9:00 AM – 5:30 PM (Closed Mondays)",
      tips: [
        "Cultural Etiquette: Ajanta is a sacred site. Please maintain silence.",
        "Flash photography is strictly prohibited inside the caves to prevent the fading of the ancient murals.",
        "Pro Tip: Wear comfortable walking shoes; the climb up the horseshoe gorge can be steep."
      ]
    },
    imageAlts: [
      "Panoramic view of the horseshoe-shaped Ajanta Caves cliff.",
      "Detailed 360 view of the Padmapani Bodhisattva mural in Cave 1.",
      "Interior of the rock-cut Chaitya hall at Ajanta Caves in VR."
    ]
  },

  'ellora-caves-aurangabad': {
    // ── Hero copy ─────────────────────────────────────────────────────────────
    heroHeadline:    "Carved from a Single Mountain",
    heroSubHeadline: "A 360° walk through Ellora — 34 UNESCO rock-cut monuments, three faiths in dialogue, and the Kailasa Temple: the world's largest monolithic structure, cut top-down from living basalt.",
    eyebrow:         "Chhatrapati Sambhajinagar, Maharashtra · c. 600–1000 CE · 34 caves · Buddhist, Hindu & Jain · UNESCO World Heritage Site",

    // ── Welcome / intro blurb ─────────────────────────────────────────────────
    welcomeBlurb: "Welcome to the 360° Virtual Tour of Ellora Caves\n\nYou are stepping into an immersive virtual tour of one of the world's most extraordinary archaeological sites — 34 rock-cut monuments carved into a basalt escarpment over four centuries, bringing Buddhist, Hindu and Jain traditions together in a single, two-kilometre ridge. The centrepiece is the Kailasa Temple (Cave 16): the world's largest monolithic rock-cut structure, hewn top-down from a single basalt outcrop by Rashtrakuta artisans in the 8th century. This virtual tour is your guide before you go — or your window if you can't.",

    // ── Must-See Caves highlights list ───────────────────────────────────────
    highlights: [
      { cave: "Cave 16 – Kailasa Temple",    desc: "The world's largest monolithic rock-cut temple, dedicated to Shiva — the unmissable centrepiece of Ellora." },
      { cave: "Cave 10 – Vishvakarma",        desc: "Ellora's only chaitya (prayer hall), with a ribbed \"carpenter's\" ceiling and stupa, carved in the Buddhist tradition." },
      { cave: "Cave 5 – Maharwada",           desc: "The largest Buddhist vihara at Ellora, with a unique long assembly hall and rows of monks' cells." },
      { cave: "Cave 15 – Dashavatara",        desc: "A two-storey Hindu cave richly carved with Vishnu's ten avatars and their cosmic narratives." },
      { cave: "Cave 21 – Rameshwar",          desc: "Celebrated for its river-goddess sculptures and ornate pillars — among the finest carving at Ellora." },
      { cave: "Cave 29 – Dhumar Lena",        desc: "A vast cruciform Shiva cave set above a ravine, comparable in scale and drama to Elephanta Island." },
      { cave: "Cave 32 – Indra Sabha",        desc: "The finest Jain cave, richly carved over two storeys, with detailed panels of Jain tirthankaras and celestial figures." }
    ],

    // ── Main SEO / editorial content ─────────────────────────────────────────
    seoContent: "Ellora is one of the world's largest rock-cut cave complexes and a UNESCO World Heritage Site near Chhatrapati Sambhajinagar (formerly Aurangabad), Maharashtra. Carved into a basalt escarpment over four centuries (c. 600–1000 CE), its 34 monasteries and temples bring three faiths together side by side — Buddhist, Hindu and Jain — a rare monument to India's religious harmony. This 360° virtual tour lets you explore every cave in immersive, life-like detail before you travel.\n\n<h2 class=\"dest-content-heading\">Kailasa Temple (Cave 16) — the Monolithic Marvel</h2>\n\nThe centrepiece is the Kailasa Temple (Cave 16) — the world's largest monolithic rock-cut structure. Carved top-down from a single basalt outcrop by Rashtrakuta artisans in the 8th century, it covers roughly twice the footprint of the Parthenon and rises around 30 metres, sculpted with elephants, river goddesses and scenes from the Ramayana and Mahabharata. Our walkthrough guides you from the gateway and Nandi pavilion to the towering vimana, the relief galleries, and the dramatic clifftop views above the monument.\n\n<h2 class=\"dest-content-heading\">A Monument to Three Faiths</h2>\n\nUnlike any other heritage site in the world, Ellora places Buddhist monasteries, Hindu temples and Jain shrines along a single two-kilometre basalt ridge — carved without conflict, each tradition borrowing freely from the next in ornament and form. Beyond Kailasa, the Buddhist caves (1–12) include the great Vishvakarma chaitya prayer hall; the Hindu caves (13–29) feature the Dashavatara and the cruciform Dhumar Lena; and the Jain caves (30–34) culminate in the exquisitely carved Indra Sabha.\n\nThe site is a living argument for India's ancient plurality: Rashtrakuta kings who were Hindu by faith patronised both the Kailasa Temple and the Buddhist Vishvakarma cave in the same generation. Walking Ellora — virtually or in person — is to walk through 400 years of that argument, sculpted in stone.\n\n<h2 class=\"dest-content-heading\">Plan Your Visit: Timings, Tickets & How to Reach</h2>\n\nEllora lies about 30 km from Chhatrapati Sambhajinagar (Aurangabad), an easy drive from the city's hotels and well connected by road. The city's airport and railway station make it a convenient base for a combined Ajanta–Ellora heritage trip. Allow a half-day for Ellora, starting early to beat the heat and the crowds — and use this virtual tour to map your route in advance.",

    // ── FAQ (8 questions — verbatim from SEO package, verified June 2026) ─────
    faq: [
      {
        q: "What is the Ellora Caves virtual tour?",
        a: "The Ellora Caves virtual tour is an immersive 360° experience that lets you explore all 34 UNESCO-listed rock-cut monuments online — including the Kailasa Temple — from any device, with no special equipment needed."
      },
      {
        q: "What are Ellora Caves timings and entry fees?",
        a: "Ellora is open every day except Tuesday, from around 6:00 AM to 6:00 PM (last entry about 5:00 PM). Entry costs ₹40 for Indian and SAARC visitors and ₹600 for foreign nationals; children under 15 enter free. A small extra fee applies for video cameras."
      },
      {
        q: "How is Ellora different from Ajanta?",
        a: "Ajanta is exclusively Buddhist and famous for its ancient paintings. Ellora has Buddhist, Hindu and Jain rock-cut sculptures (and no paintings). Ellora is open on Mondays — when Ajanta is closed — and is itself closed on Tuesdays, so the two pair perfectly on a combined trip."
      },
      {
        q: "What is the Kailasa Temple at Ellora?",
        a: "Kailasa (Cave 16) is the world's largest monolithic rock-cut structure, carved top-down from a single basalt rock in the 8th century under the Rashtrakuta dynasty. Dedicated to Lord Shiva, it is the celebrated centrepiece of Ellora."
      },
      {
        q: "How many caves are there at Ellora?",
        a: "There are 34 caves — 12 Buddhist (Caves 1–12), 17 Hindu (Caves 13–29) and 5 Jain (Caves 30–34) — carved between roughly 600 and 1000 CE along a single basalt ridge."
      },
      {
        q: "How do I reach Ellora Caves?",
        a: "Ellora is about 30 km from Chhatrapati Sambhajinagar (Aurangabad). Take a taxi or MSRTC bus from the city; the nearest airport and railway station are in Aurangabad. Combined Ajanta–Ellora day tours are popular."
      },
      {
        q: "How long does it take to see Ellora?",
        a: "Allow at least 3–4 hours to cover the highlights, or a full day to explore in depth. This virtual tour lets you preview the layout and prioritise caves before you go."
      },
      {
        q: "Is photography allowed at Ellora Caves?",
        a: "Yes — still photography is allowed and free. A small fee applies for video cameras, and tripods or drones need prior permission. There are no flash restrictions of the kind Ajanta has for its paintings."
      }
    ],

    // ── Travel card ───────────────────────────────────────────────────────────
    travel: {
      bestTime:       "November – March (cool and dry; ideal for walking the open-air Kailasa complex)",
      nearestAirport: "Chhatrapati Sambhajinagar Airport (IXU), ~29 km",
      nearestRailway: "Aurangabad Railway Station, ~30 km",
      entryFee:       "₹40 (Indians / SAARC) | ₹600 (Foreign nationals) | Children under 15 free",
      timings:        "Open daily except Tuesday · 6:00 AM – 6:00 PM (last entry ~5:00 PM)",
      tips: [
        "Start at Kailasa Temple (Cave 16) — visit at opening time for dramatic morning light and fewer crowds",
        "Walk north through Buddhist caves (1–12), then south through Jain caves (30–34) after Kailasa",
        "Pair with Ajanta Caves on a two-day circuit (Ellora on Monday, Ajanta on any day except Monday)",
        "Wear comfortable flat shoes — surfaces range from smooth basalt to uneven stone steps",
        "Carry water and sun protection; the Kailasa courtyard is fully open to the sky",
        "Grishneshwar Jyotirlinga temple is 1 km from the Ellora entrance — worth combining"
      ]
    },

    // ── Related tours rail ────────────────────────────────────────────────────
    relatedTours: [
      "ajanta-caves-aurangabad",
      "amber-fort-jaipur",
      "vijaya-vitthala-temple-hampi",
      "brihadeeswara-temple-thanjavur",
      "meenakshi-amman-temple-madurai"
    ],

    // ── Image alt-text (matches SEO package §4) ───────────────────────────────
    imageAlts: [
      "Kailasa Temple Cave 16 monolithic rock-cut structure at Ellora Caves",
      "360 panoramic view of Ellora Kailasa Temple courtyard and vimana tower",
      "Vishvakarma chaitya prayer hall stupa, Cave 10, Ellora Caves Aurangabad",
      "Indra Sabha Jain cave carved pillars, Cave 32, Ellora UNESCO site"
    ]
  },

  'shore-temple-mahabalipuram': {
    comingSoon: true,
    seoContent: "The 8th-century Pallava Shore Temple rises directly from the Bay of Bengal at Mahabalipuram, its slender granite spires reflected in the sea. Part of a UNESCO World Heritage site, this ancient coastal temple influenced Dravidian architecture across Southeast Asia. Our virtual tour captures the golden sunrise views and intricately carved compound at their most dramatic.",
    faq: [
      { q: "When is the best time to visit?", a: "October to March. Sunrise visits are most rewarding — the temple glows golden against the sea. Avoid monsoon months for rough seas and limited access." },
      { q: "How do I reach Mahabalipuram from Chennai?", a: "60 km south on ECR. TNSTC buses from Chennai Mofussil Bus Terminus take 1.5–2 hours. By road via ECR: ~1 hour." }
    ],
    travel: {
      bestTime: "October – March",
      nearestAirport: "Chennai International (MAA), 60 km",
      nearestRailway: "Chengalpattu Junction, 29 km",
      entryFee: "₹40 (Indians) | ₹600 (Foreigners)",
      timings: "6:00 AM – 6:00 PM daily",
      tips: ["Arrive at sunrise for the most dramatic light", "Combine with Five Rathas and Arjuna's Penance on the same day", "Swimming near the temple is dangerous due to strong currents"]
    }
  },

  'five-rathas-mahabalipuram': {
    comingSoon: true,
    seoContent: "The Five Rathas (Pancha Rathas) are five monolithic 7th-century granite temple chariots at Mahabalipuram, each carved from a single boulder without mortar. They display five distinct early Dravidian architectural styles side by side — a complete architectural textbook in stone. Our virtual tour circles each monolith to reveal guardian figures, lion bases, and exquisite decorative panels.",
    faq: [
      { q: "Are the Five Rathas on the same ticket as Shore Temple?", a: "A combined ticket covers all Mahabalipuram ASI monuments: ₹40 (Indians) / ₹600 (Foreigners)." },
      { q: "How much time do I need here?", a: "1–1.5 hours. The site is compact. Sunrise and late afternoon bring out the best textures in the granite." }
    ],
    travel: {
      bestTime: "October – March",
      nearestAirport: "Chennai International (MAA), 60 km",
      nearestRailway: "Chengalpattu Junction, 29 km",
      entryFee: "₹40 (Indians) | ₹600 (Foreigners)",
      timings: "6:00 AM – 6:00 PM daily",
      tips: ["Visit in early morning for beautiful low-angle light", "The carved elephant and Nandi bull are excellent photo subjects", "Combine all Mahabalipuram UNESCO monuments in a single day"]
    }
  },

  'hill-lock-monuments-mahabalipuram': {
    comingSoon: true,
    seoContent: "The Hill Lock Monuments at Mahabalipuram include Arjuna's Penance — the world's largest open-air bas-relief at 27 metres wide — plus the Varaha Cave Temple, Mahishasuramardini Cave, and the old lighthouse. These 7th-century Pallava masterworks carved into granite hillocks form part of the UNESCO World Heritage Group. Our virtual tour navigates the hillside carvings with guided annotations.",
    faq: [
      { q: "What is Arjuna's Penance?", a: "The world's largest open-air bas-relief (27m × 9m), carved 1,300 years ago, depicting the descent of the Ganga or Arjuna's penance — scholars still debate the exact scene." },
      { q: "Is there a separate entry fee?", a: "A combined ticket (₹40 Indians / ₹600 Foreigners) covers all ASI monuments at Mahabalipuram including hill monuments, Five Rathas, and Shore Temple." }
    ],
    travel: {
      bestTime: "October – March",
      nearestAirport: "Chennai International (MAA), 60 km",
      nearestRailway: "Chengalpattu Junction, 29 km",
      entryFee: "₹40 (Indians) | ₹600 (Foreigners)",
      timings: "6:00 AM – 6:00 PM daily",
      tips: ["The Lighthouse Hill gives a panoramic view of the entire coastal complex", "Visit Arjuna's Penance in morning light for best shadow detail on the carvings", "Mahishasuramardini Cave has superb warrior-goddess reliefs"]
    }
  },

  'brihadeeswara-temple-thanjavur': {
    comingSoon: true,
    seoContent: "The Brihadeeswara Temple at Thanjavur, built by Chola emperor Raja Raja I (1003–1010 CE), features a 66-metre vimana built entirely from granite without mortar — the tallest structure in India at the time. This UNESCO Great Living Chola Temple holds a Shivalingam over 8 metres tall and exceptional Chola-era frescoes. Our virtual tour explores the grand Nandi mandapam and richly carved inner walls with expert narration.",
    faq: [
      { q: "What are the timings and entry fee?", a: "6:00 AM – 12:30 PM and 4:00 PM – 8:30 PM daily. Entry free. Camera fee ₹50. Ask ASI office about access to the inner Chola frescoes." },
      { q: "How do I reach Thanjavur?", a: "Trains from Chennai (6 hrs), Trichy (1 hr), Madurai (2.5 hrs). Nearest airport: Tiruchirappalli International (TRZ), 56 km." }
    ],
    travel: {
      bestTime: "November – February",
      nearestAirport: "Tiruchirappalli International (TRZ), 56 km",
      nearestRailway: "Thanjavur Junction, 2 km",
      entryFee: "Free | Camera ₹50",
      timings: "6:00 AM – 12:30 PM | 4:00 PM – 8:30 PM",
      tips: ["Arrive at sunrise — the vimana shadow alignment is an ancient astronomical feat", "Ask the ASI office for access to the rarely-seen inner Chola frescoes", "Combine with Gangaikonda Cholapuram (90 km) for the full Chola temples circuit"]
    }
  },

  'airavatesvara-temple-darasuram': {
    comingSoon: true,
    seoContent: "The 12th-century Airavatesvara Temple at Darasuram is the most intimately scaled of the three Great Living Chola Temples — and arguably the most refined in sculptural detail. Its mandapam is uniquely shaped like a stone chariot, predating the Konark Sun Temple by two centuries. Our virtual tour documents this UNESCO site in detail rarely seen during standard visits.",
    faq: [
      { q: "Where is Darasuram and how do I reach it?", a: "4 km from Kumbakonam — take a local bus or auto-rickshaw from Kumbakonam Station. From Thanjavur it is 40 km." },
      { q: "What are the timings?", a: "6:00 AM – 12:00 PM and 4:00 PM – 8:00 PM daily. Free entry. It is a living temple with regular puja rituals." }
    ],
    travel: {
      bestTime: "November – February",
      nearestAirport: "Tiruchirappalli International (TRZ), 84 km",
      nearestRailway: "Kumbakonam Station, 4 km",
      entryFee: "Free",
      timings: "6:00 AM – 12:00 PM | 4:00 PM – 8:00 PM",
      tips: ["Visit alongside Brihadeeswara and Gangaikonda Cholapuram on a Chola circuit day", "The stone chariot wheels on the mandapam are a signature photo opportunity", "Less crowded than Thanjavur — a more peaceful, unhurried experience"]
    }
  },

  'brihadeeswara-temple-gangaikonda-cholapuram': {
    comingSoon: true,
    seoContent: "Built by Rajendra Chola I in 1025 CE to celebrate his Ganges campaign victory, Gangaikonda Cholapuram's Brihadeeswara Temple rivals Thanjavur in grandeur while standing in magnificent isolation. Its 55-metre vimana and superbly carved exterior panels are a UNESCO World Heritage highlight. Our virtual tour explores this often-overlooked Chola masterpiece in depth.",
    faq: [
      { q: "How do I reach Gangaikonda Cholapuram?", a: "70 km from Trichy, 90 km from Thanjavur. Best reached by private car or taxi — public transport is limited. Allow a half day from Thanjavur." },
      { q: "What are the timings?", a: "6:00 AM – 12:30 PM and 4:00 PM – 8:30 PM daily. Free entry." }
    ],
    travel: {
      bestTime: "November – February",
      nearestAirport: "Tiruchirappalli International (TRZ), 70 km",
      nearestRailway: "Trichy Junction, 70 km",
      entryFee: "Free",
      timings: "6:00 AM – 12:30 PM | 4:00 PM – 8:30 PM",
      tips: ["Combine with Thanjavur and Darasuram in a Chola temples day-trip", "The site is rarely crowded — excellent for unhurried photography", "The lioness sculptures at the base of the vimana are finely carved"]
    }
  },

  'jantar-mantar-jaipur': {
    comingSoon: true,
    seoContent: "Built by Maharaja Sawai Jai Singh II (1724–1735), Jaipur's Jantar Mantar is a UNESCO World Heritage collection of 19 monumental masonry astronomical instruments. Its Samrat Yantra — the world's largest stone sundial — is accurate to 2 seconds. Our virtual tour explores each instrument with explanations of how they charted the skies 300 years ago.",
    faq: [
      { q: "What are Jantar Mantar timings and entry fee?", a: "9:00 AM – 4:30 PM daily. Entry: ₹50 (Indians), ₹200 (Foreigners). Audio guide available at the entrance." },
      { q: "How far is it from Amber Fort?", a: "About 14 km — a 30-minute drive. Both can be visited in the same day along with the adjacent City Palace." }
    ],
    travel: {
      bestTime: "October – March",
      nearestAirport: "Jaipur International (JAI), 13 km",
      nearestRailway: "Jaipur Junction, 5 km",
      entryFee: "₹50 (Indians) | ₹200 (Foreigners)",
      timings: "9:00 AM – 4:30 PM daily",
      tips: ["Visit midday to see the Samrat Yantra sundial in operation", "Hire an on-site guide to understand how each instrument works", "The adjacent City Palace makes a natural combined visit", "Best photography light is in the morning"]
    }
  },

  'nataraja-temple-chidambaram': {
    comingSoon: true,
    seoContent: "The Nataraja Temple at Chidambaram is one of the most sacred Shaivite shrines in India, centred on Lord Nataraja — Shiva as the cosmic Lord of Dance. The Chidambaram Rahasyam (sacred secret) — a curtain of golden vilva leaves — conceals the formless aspect of the divine within. Our virtual tour explores the grand gopurams and atmospheric inner sanctum corridors of this living temple.",
    faq: [
      { q: "What are the Nataraja Temple timings?", a: "5:00 AM – 12:00 PM and 4:30 PM – 10:00 PM daily. Six abishekam rituals are performed daily. Free entry; donations welcomed." },
      { q: "How do I reach Chidambaram?", a: "Chidambaram is on the Chennai–Trichy rail line. Nearest major airports: Chennai (235 km) or Trichy (160 km). TNSTC buses connect from major Tamil Nadu cities." }
    ],
    travel: {
      bestTime: "November – February (Arudra Darshana in December is spectacular)",
      nearestAirport: "Tiruchirappalli International (TRZ), 160 km",
      nearestRailway: "Chidambaram Station, 1 km",
      entryFee: "Free | Donations welcomed",
      timings: "5:00 AM – 12:00 PM | 4:30 PM – 10:00 PM",
      tips: ["Arudra Darshana (December full moon) is the most important festival — plan months ahead", "Attend an early morning or evening ritual for an immersive experience", "Ask the priests for the timing of the Chidambaram Rahasyam ceremony"]
    }
  },

  'brihadeeswara-temple-thanjavur': {
    seoContent: "Welcome to the 360° virtual reality tour of Brihadeeswara Temple (Peruvudaiyar Kovil), Thanjavur — the crown jewel of the Great Living Chola Temples and a designated UNESCO World Heritage Site. Consecrated in 1010 CE by Emperor Raja Raja Chola I to commemorate his vast naval and military conquests, this architectural triumph represents the pinnacle of Dravidian engineering, stone craft, and sacred geometry.\n\nRising to a staggering 66 metres (216 feet), the granite vimana was the tallest structure in India at the time of its completion, engineered entirely using interlocking dry-stone masonry without a single grain of mortar. Perched at its peak sits the monolithic Kumbam (capstone) carved from a single 80-tonne block of granite, hauled up an inclined ramp stretching over 6 kilometres. As you explore this digital heritage archive in immersive 360°, you will navigate sacred gopurams, ancient fresco corridors, and colossal sculptures that have inspired pilgrims, architects, and travelers for over a millennium.\n\n<h2 class=\"dest-content-heading\">Architectural Wonders of the Chola Dynasty</h2>\n\nThe architectural prowess of Brihadeeswara Temple defies conventional ancient construction. Over 130,000 tonnes of hard granite were transported to a river delta region devoid of stone quarries. The temple complex is aligned with exquisite astronomical accuracy, and its towering pyramidal tower features symmetrical tiers crowned by octagonal cupolas.\n\nIn the front courtyard, within an ornate Nayak-period pavilion, rests the legendary Monolithic Nandi — one of the largest sacred bull sculptures in India, carved from a single monolithic granite boulder measuring 6 metres in length, 3.7 metres in height, and weighing over 20 tonnes. The inner pradakshina (ambulatory passage) holds rare Chola-era wall paintings and 108 stone karanas depicting classical Bharatanatyam dance postures commissioned by the emperor himself.\n\n<h2 class=\"dest-content-heading\">Interactive 360° Virtual Pilgrimage</h2>\n\nOur WebXR-enabled 3D virtual tour allows you to walk through the entire temple sanctuary from any vantage point:\n\n<strong>Rajarajan Gopuram &amp; Outer Ramparts:</strong> Stand before the grand 30-metre entrance gateway flanked by colossal dwarapalakas (guardian deities).\n\n<strong>The Central Sanctum (Garbhagriha):</strong> Gaze upon the immense monolithic Shivalingam standing over 8.7 metres tall, surrounded by resonant chanting.\n\n<strong>Nandi Mandapam:</strong> Walk around the monolithic bull facing the main sanctum, admired for its polished stone finish and intricate decorative bells.\n\n<strong>Sub-Shrines &amp; Cloistered Corridors:</strong> Explore the ornate Murugan Temple added during the Nayak era, the Chandikesvara shrine, and the perimeter pillared cloisters containing 108 Shivalingams and ancient Tamil inscriptions recording temple endowments, dancers, musicians, and goldsmiths.",
    faq: [
      { q: "What are the timings and entry fee for Brihadeeswara Temple?", a: "The temple is open daily from 6:00 AM to 12:30 PM and 4:00 PM to 8:30 PM. Entry is completely free. Special darshan tickets and camera permits may carry nominal fees." },
      { q: "What is special about the vimana and its shadow?", a: "The 66-metre vimana was built without mortar using interlocking granite blocks. The design is engineered so that during the equinoxes, the shadow of the vimana falls cleanly within its own base without spilling onto the ground at noon." },
      { q: "How was the 80-tonne granite capstone placed on top?", a: "Chola engineers constructed a gentle 6-kilometre inclined ramp made of earth and timber leading from the village of Sarapallam to the summit of the tower, rolling the single-block granite Kumbam into place using elephants and rollers." },
      { q: "Is there a dress code for visiting Brihadeeswara Temple?", a: "Yes, traditional modest clothing is required: dhotis, pyjamas, or trousers with shirts for men; sarees, salwar kameez, or modest dresses for women. Footwear must be deposited outside the temple entrance." },
      { q: "Can I explore this tour in VR headset?", a: "Yes, click the VR button on the top-right toolbar to enter WebXR stereoscopic virtual reality mode on Meta Quest, Apple Vision Pro, or mobile VR headsets." }
    ],
    travel: {
      bestTime: "November – February (Cool pleasant winter weather; Shivaratri in Feb/March is celebrated with grand cultural dance festivals)",
      nearestAirport: "Tiruchirappalli International Airport (TRZ), 56 km (approx. 1 hour drive)",
      nearestRailway: "Thanjavur Junction (TJ), 1.8 km (connected by express trains to Chennai, Madurai, Trichy, and Bangalore)",
      entryFee: "Free Entry | Camera fee ₹50 | Video camera ₹100",
      timings: "6:00 AM – 12:30 PM | 4:00 PM – 8:30 PM daily",
      tips: [
        "Visit during early morning (6:30–8:30 AM) or sunset (5:00–7:00 PM) when the golden sunlight turns the granite vimana into a warm amber glow.",
        "Combine your visit with the Thanjavur Royal Palace, Saraswathi Mahal Library, and Bronze Gallery just 2 km away.",
        "Hire an authorized ASI guide at the main gate to decipher the ancient Tamil inscriptions etched into the temple plinths.",
        "The stone floor warms up under the afternoon sun — socks are recommended when walking along the outdoor courtyard."
      ]
    },
    imageAlts: [
      "Front view of Rajarajan Gopuram entrance at Brihadeeswara Temple in 360 degrees.",
      "The massive monolithic Nandi bull facing the towering vimana at Thanjavur.",
      "Grand 66-metre granite vimana of Brihadeeswara Temple illuminated under clear sky.",
      "Courtyard colonnade and sanctum perimeter of the Great Living Chola Temple."
    ]
  }

}; // end DEST_CONTENT
