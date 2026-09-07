// ─── Virtual Tourism – Destinations Page Logic ────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    injectDestinationsSchema();
    renderFilterBar();
    renderAllDestinations();
    initSearch();
    applyURLFilter();
    initHeroMap();
    initFilterScroll();
});

let activeFilter = 'All';
let heroMap = null;
let markersLayer = null;
let heroTileLayer = null;

function injectDestinationsSchema() {
    if (!Array.isArray(DESTINATIONS) || DESTINATIONS.length === 0) return;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Heritage & Cultural Destinations',
        url: '/',
        description: 'Browse iconic heritage destinations across India.',
        hasPart: DESTINATIONS.map((dest, index) => {
            const slug = dest.slug || `${dest.name}-${dest.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return {
                '@type': 'ListItem',
                position: index + 1,
                url: `/virtual-tour/${slug}`,
                item: {
                    '@type': 'TouristAttraction',
                    name: dest.name,
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: dest.city,
                        addressRegion: dest.state,
                        addressCountry: 'IN'
                    }
                }
            };
        })
    };

    const node = document.getElementById('destinationsSchema');
    if (node) {
        node.textContent = JSON.stringify(schema);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════════════════════
function renderFilterBar() {
    const bar = document.getElementById('filterBar');
    if (!bar || !CATEGORIES) return;

    bar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => setFilter('All'));
    bar.appendChild(allBtn);

    const validCategories = CATEGORIES.filter(cat =>
        DESTINATIONS.some(d => Array.isArray(d.categories) && d.categories.includes(cat.name))
    );

    validCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat.name;
        btn.addEventListener('click', () => setFilter(cat.name));
        bar.appendChild(btn);
    });
}

function setFilter(category) {
    activeFilter = category;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === category);
    });

    renderAllDestinations();
    updateMapMarkers();
}

// ═══════════════════════════════════════════════════════════════════════════
// DESTINATION GRID
// ═══════════════════════════════════════════════════════════════════════════
function renderAllDestinations() {
    const grid = document.getElementById('allDestGrid');
    if (!grid || !DESTINATIONS) return;

    const filtered = getFilteredDestinations();

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">No destinations found. Try a different category or search term.</div>';
    } else {
        grid.innerHTML = filtered.map(d => renderDestinationCard(d)).join('');
    }

    // Re-init reveal for dynamically added cards
    setTimeout(() => initRevealAnimations(), 50);
}

function getFilteredDestinations() {
    const searchVal = document.getElementById('destSearch')?.value.toLowerCase() || '';

    return DESTINATIONS.filter(d => {
        const matchCategory = activeFilter === 'All' || d.categories.includes(activeFilter);
        const matchSearch = !searchVal ||
            d.name.toLowerCase().includes(searchVal) ||
            d.city.toLowerCase().includes(searchVal) ||
            d.state.toLowerCase().includes(searchVal);
        return matchCategory && matchSearch;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════
function initSearch() {
    const input = document.getElementById('destSearch');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            renderAllDestinations();
            updateMapMarkers();
        }, 250);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// URL FILTER (from category cards on home page)
// ═══════════════════════════════════════════════════════════════════════════
function applyURLFilter() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const search = params.get('search');
    const path = window.location.pathname.toLowerCase();

    // pSEO Auto-Detection based on filename
    let autoCat = null;
    if (path.includes('virtual-temple-tours')) autoCat = 'Temples';
    else if (path.includes('unesco-virtual-tours')) autoCat = 'UNESCO';
    else if (path.includes('famous-monuments-virtual-tours')) autoCat = 'Forts & Palaces';

    const isValidCategory = (cat && (cat === 'All' || CATEGORIES.some(c => c.name === cat))) || autoCat;
    if (isValidCategory) {
        setFilter(cat || autoCat);
    }

    if (search) {
        const input = document.getElementById('destSearch');
        if (input) {
            input.value = search.trim();
            renderAllDestinations();
            updateMapMarkers();
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO MAP (Leaflet)
// ═══════════════════════════════════════════════════════════════════════════
function initHeroMap() {
    const mapEl = document.getElementById('heroMap');
    if (!mapEl || typeof L === 'undefined') return;

    heroMap = L.map('heroMap', {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
    });

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const tileUrl = theme === 'dark' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    heroTileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(heroMap);

    heroMap.zoomControl.setPosition('topright');

    markersLayer = L.layerGroup().addTo(heroMap);

    updateMapMarkers();

    setTimeout(() => heroMap.invalidateSize(), 300);

    // Global function to update map style when theme changes
    window.updateHeroMapStyle = function() {
        if (!heroMap || !heroTileLayer) return;
        
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTileUrl = theme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        
        heroTileLayer.setUrl(newTileUrl);
        updateMapMarkers();
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// GOLD MARKER ICON
// ═══════════════════════════════════════════════════════════════════════════
function createGoldIcon() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const color = theme === 'dark' ? '#c5a45c' : '#9e3b3b';
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="16" r="7" fill="#0F1115" stroke="${color}" stroke-width="1.5"/>
            <circle cx="16" cy="16" r="3" fill="${color}"/>
        </svg>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42]
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE MAP MARKERS
// ═══════════════════════════════════════════════════════════════════════════
function updateMapMarkers() {
    if (!heroMap || !markersLayer) return;

    markersLayer.clearLayers();

    const filtered = getFilteredDestinations();
    const goldIcon = createGoldIcon();

    filtered.forEach(dest => {
        if (!dest.lat || !dest.lng) return;

        const marker = L.marker([dest.lat, dest.lng], { icon: goldIcon });
        const primaryCategory = dest.categories[0] || '';
        const slug = dest.slug || `${dest.name}-${dest.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        marker.bindPopup(`
            <div class="map-popup-card">
                <img class="map-popup-image" src="${dest.image}" alt="${dest.name}" loading="lazy"/>
                <div class="map-popup-body">
                    <div class="map-popup-category">${primaryCategory}</div>
                    <div class="map-popup-name">${dest.name}</div>
                    <div class="map-popup-location">${dest.city}, ${dest.state}</div>
                    <a href="/virtual-tour/${slug}" class="map-popup-btn">
                        Explore
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>
                    </a>
                </div>
            </div>
        `, { maxWidth: 260, closeButton: true });

        markersLayer.addLayer(marker);
    });

    if (filtered.length > 0) {
        const coords = filtered
            .filter(d => d.lat && d.lng)
            .map(d => [d.lat, d.lng]);
        if (coords.length > 0) {
            heroMap.fitBounds(coords, { padding: [60, 60], maxZoom: 8 });
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER SCROLL
// ═══════════════════════════════════════════════════════════════════════════
function initFilterScroll() {
    const track = document.getElementById('filterBar');
    const prevBtn = document.getElementById('filterPrev');
    const nextBtn = document.getElementById('filterNext');
    if (!track || !prevBtn || !nextBtn) return;

    const scrollAmount = 300;

    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    const checkScroll = () => {
        const canScrollLeft = track.scrollLeft > 10;
        const canScrollRight = track.scrollLeft < (track.scrollWidth - track.clientWidth - 10);
        
        prevBtn.style.opacity = canScrollLeft ? '1' : '0';
        prevBtn.style.visibility = canScrollLeft ? 'visible' : 'hidden';
        
        nextBtn.style.opacity = canScrollRight ? '1' : '0';
        nextBtn.style.visibility = canScrollRight ? 'visible' : 'hidden';
    };

    track.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    // Initial check after content is rendered
    setTimeout(checkScroll, 1000);
}
