# 🏛️ Heritage & Culture of India — 3D Map & 360° Virtual Tours

[![License: ISC](https://img.shields.io/badge/License-ISC-gold.svg)](https://opensource.org/licenses/ISC)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![WebXR](https://img.shields.io/badge/WebXR-360°%20VR-blueviolet.svg)](https://immersiveweb.dev/)
[![UNESCO](https://img.shields.io/badge/UNESCO-World%20Heritage-0077b6.svg)](https://whc.unesco.org/)

An immersive digital heritage archive and interactive **360° Virtual Reality platform** documenting India's most celebrated sacred temples, royal forts, rock-cut monuments, and UNESCO World Heritage sites. 

Experience living architecture and millennia of sculpture in high-definition panoramic tours directly in modern desktop and mobile browsers.

---

## 🌟 Key Features

- **🌐 100vh Cinematic Visual Hero**:
  - Ken Burns slow-zoom animated slider showcasing iconic Indian landmarks.
  - Minimalistic, distraction-free landing section with real-time statistics counters.
  - Scroll-reveal sticky navigation bar that stays hidden on arrival and slides down on scrolling.

- **🔄 Seamless 360° Panoramic Virtual Tours**:
  - High-resolution KRPano viewer integration with full spherical panoramas.
  - Edge-to-edge fullscreen viewport with zero border artifacts.
  - Interactive multi-scene navigation, hot-spots, and spatial orientation controls.
  - VR headset-ready and mobile touch-compatible (gyroscope & touch pan).

- **🏛️ Curated Heritage Destinations**:
  - Dedicated cards for **15 iconic Indian monuments** across **4 cultural categories** and **8 states**.
  - Verified, high-resolution authentic local photography for every monument card.
  - Dynamic filtering by **UNESCO**, **Temples**, **Forts & Palaces**, and **Art & Culture**.
  - Real-time search by monument name, city, or state.

- **🌓 Dynamic Day & Night Mode**:
  - Glassmorphic UI design system with curated dark and light mode themes.
  - High-contrast typography using Google Fonts and custom HSL color tokens.
  - Seamless theme toggling with smooth transitions and persistent state.

- **⚡ Local Multi-Threaded Proxy Server (`server.py` & `server.js`)**:
  - Python multi-threaded proxy server with automatic CloudFront cookie forwarding and SSL handshake management.
  - Handles `/api/tour-access` token authorization and assets proxying for secure KRPano panoramic tiles.
  - Alternative Node.js runtime script available via `server.js`.

---

## 📍 Featured Destinations

| Monument | Location | State | Category |
| :--- | :--- | :--- | :--- |
| **Amber Fort** | Jaipur | Rajasthan | Forts & Palaces, UNESCO |
| **Meenakshi Amman Temple** | Madurai | Tamil Nadu | Temples, Art & Culture |
| **Vijaya Vitthala Temple** | Hampi | Karnataka | UNESCO, Temples |
| **Mysore Palace** | Mysore | Karnataka | Forts & Palaces |
| **Thirumalai Nayakkar Mahal** | Madurai | Tamil Nadu | Forts & Palaces, Art & Culture |
| **Ajanta Caves** | Aurangabad | Maharashtra | UNESCO, Art & Culture |
| **Ellora Caves & Kailasa Temple** | Aurangabad | Maharashtra | UNESCO, Temples |
| **Shore Temple** | Mahabalipuram | Tamil Nadu | UNESCO, Temples |
| **Five Rathas (Pancha Rathas)** | Mahabalipuram | Tamil Nadu | UNESCO, Temples |
| **Hill Lock Monuments** | Mahabalipuram | Tamil Nadu | UNESCO, Art & Culture |
| **Brihadeeswara Temple** | Thanjavur | Tamil Nadu | UNESCO, Temples |
| **Airavatesvara Temple** | Darasuram | Tamil Nadu | UNESCO, Temples |
| **Brihadeeswara Temple** | Gangaikonda Cholapuram | Tamil Nadu | UNESCO, Temples |
| **Jantar Mantar** | Jaipur | Rajasthan | UNESCO |
| **Nataraja Temple** | Chidambaram | Tamil Nadu | Temples, Art & Culture |

---

## 🛠️ Technology Stack

- **Frontend**:
  - Semantic HTML5 & Modern Vanilla JavaScript (ES6+ modular components).
  - Custom Vanilla CSS3 Design System (Glassmorphism, CSS Variables, Flexbox/Grid, Animations).
  - Font pairings: Playfair Display / Outfit / Inter typography.
- **VR Engine**:
  - KRPano 360° Panoviewer with custom XML skin scripts and high-DPI tile streaming.
- **Backend & Proxy**:
  - **Python 3**: `ThreadingHTTPServer` with custom request handlers in `server.py`.
  - **Node.js**: Alternative HTTP reverse proxy with cookie retention in `server.js`.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+** (recommended) or **Node.js 16+**
- A modern web browser (Chrome, Edge, Firefox, Safari, or WebXR-enabled headset)

### 1. Clone the Repository

```bash
git clone https://github.com/vasanth-1208/Hertiage_and_culture_3d_Map.git
cd Hertiage_and_culture_3d_Map
```

### 2. Run the Local Server

#### Option A: Using Python (Recommended)
```bash
python server.py
```

#### Option B: Using Node.js
```bash
npm start
```

### 3. Open in Browser

Navigate to:
```
http://localhost:8000/
```

- Explore the **100vh Cinematic Hero** and scroll down to reveal the interactive destinations.
- Filter destinations using the category pills (`All`, `UNESCO`, `Temples`, `Forts & Palaces`, `Art & Culture`).
- Click on **"Explore Destination"** to launch the full 360° immersive tour!

---

## 📁 Project Structure

```text
├── css/
│   └── styles.css                  # Core design system, glassmorphism & responsive layout
├── images/
│   ├── cards/                      # Verified high-res photos for all 15 monuments
│   │   ├── karnataka/              # Hampi, Mysore Palace
│   │   ├── maharashtra/            # Ajanta & Ellora Caves
│   │   ├── rajasthan/              # Amber Fort, Jantar Mantar
│   │   └── tamilnadu/              # Madurai, Mahabalipuram, Thanjavur, Darasuram
│   └── icons/                      # Theme and navigation icons
├── js/
│   ├── data.js                     # Centralized destination metadata, categories & states
│   ├── destinations.js             # Filter bar logic, search handler & cards renderer
│   ├── destination.js              # Virtual tour viewer wrapper & back navigation
│   ├── home.js                     # Ken Burns background visual slider logic
│   └── main.js                     # Theme switcher, scroll listeners & footer renderer
├── virtual-tour/                   # Destination landing and panoramic tour pages
│   ├── amber-fort-jaipur/
│   ├── meenakshi-amman-temple-madurai/
│   ├── vijaya-vitthala-temple-hampi/
│   └── ... (all 15 destination tour portals)
├── index.html                      # Main home page with full-screen hero & cards
├── virtual-tourism.html            # Category destination catalog page
├── destination.html                # Single destination template
├── server.py                       # Multi-threaded Python server & CloudFront auth proxy
├── server.js                       # Node.js server fallback
├── package.json                    # Project configuration and run scripts
└── README.md                       # Project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a Pull Request to help expand India's digital heritage archive.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewDestination`)
3. Commit your Changes (`git commit -m 'Add new heritage destination'`)
4. Push to the Branch (`git push origin feature/NewDestination`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [ISC License](package.json).

---

<div align="center">
  <sub>Preserving India's Cultural Legacy through Immersive Technology 🇮🇳</sub>
</div>
