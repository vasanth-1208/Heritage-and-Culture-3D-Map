// ─── Virtual Tourism – Home Page Logic ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    renderCategories();
    renderFeaturedDestinations();
    initCategoryScroll();
});

// ═══════════════════════════════════════════════════════════════════════════
// HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════
function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('heroDots');
    const slideInfo = document.getElementById('heroSlideInfo');
    if (!slider || !HERO_SLIDES) return;

    let currentSlide = 0;
    let interval;
    const INTERVAL_MS = 6000;

    // Build slides
    HERO_SLIDES.forEach((slide, i) => {
        const el = document.createElement('div');
        el.className = `hero-slide ${i === 0 ? 'active' : ''}`;
        el.innerHTML = `<div class="hero-slide-image" style="background-image:url('${slide.image}')"></div>`;
        slider.appendChild(el);
    });

    // Build dots
    HERO_SLIDES.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `hero-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        if (dotsContainer) {
            dotsContainer.appendChild(dot);
        }
    });

    // Update slide info
    function updateSlideInfo() {
        if (slideInfo) {
            slideInfo.innerHTML = `<span class="hero-slide-title">${HERO_SLIDES[currentSlide].title}</span>`;
        }
    }
    updateSlideInfo();

    function goToSlide(index) {
        const slides = slider.querySelectorAll('.hero-slide');
        
        slides[currentSlide].classList.remove('active');
        
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.hero-dot');
            dots[currentSlide].classList.remove('active');
            dots[index].classList.add('active');
        }

        currentSlide = index;

        slides[currentSlide].classList.add('active');

        // Reset Ken Burns animation
        const img = slides[currentSlide].querySelector('.hero-slide-image');
        img.style.animation = 'none';
        img.offsetHeight; // trigger reflow
        img.style.animation = '';

        updateSlideInfo();
        resetInterval();
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % HERO_SLIDES.length);
    }

    function resetInterval() {
        clearInterval(interval);
        interval = setInterval(nextSlide, INTERVAL_MS);
    }

    resetInterval();
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES – Horizontal Scroll
// ═══════════════════════════════════════════════════════════════════════════
function renderCategories() {
    const track = document.getElementById('categoriesTrack');
    if (!track || !CATEGORIES) return;

    CATEGORIES.forEach(cat => {
        const card = document.createElement('a');
        let href = `/virtual-tourism.html?category=${encodeURIComponent(cat.name)}`;
        
        // pSEO Overrides
        if (cat.name === 'Temples') href = '/virtual-temple-tours.html';
        else if (cat.name === 'UNESCO') href = '/unesco-virtual-tours.html';
        else if (cat.name === 'Forts & Palaces') href = '/famous-monuments-virtual-tours.html';

        card.href = href;
        card.className = 'category-card';
        card.innerHTML = `
      <div class="category-card-icon"><img src="${getCategoryIcon(cat.icon)}" alt="${cat.name}" class="category-icon-img"></div>
      <div class="category-card-name">${cat.name}</div>
    `;
        track.appendChild(card);
    });
}

function initCategoryScroll() {
    const track = document.getElementById('categoriesTrack');
    const prevBtn = document.getElementById('catPrev');
    const nextBtn = document.getElementById('catNext');
    if (!track) return;

    const scrollAmount = 200;

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    // Drag scroll
    let isDragging = false;
    let startX, scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mouseleave', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURED DESTINATIONS
// ═══════════════════════════════════════════════════════════════════════════
function renderFeaturedDestinations() {
    const grid = document.getElementById('featuredGrid');
    if (!grid || !DESTINATIONS) return;

    const featured = DESTINATIONS.filter(d => d.featured);
    grid.innerHTML = featured.map(d => renderDestinationCard(d)).join('');

    // Re-init reveal for dynamically added cards
    setTimeout(() => initRevealAnimations(), 50);
}

// Global function to update icons when theme changes
window.updateHomeIcons = function() {
    const track = document.getElementById('categoriesTrack');
    if (track) {
        track.innerHTML = '';
        renderCategories();
    }
};
