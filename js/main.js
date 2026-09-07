// ─── Virtual Tourism – Shared Logic ────────────────────────────────────────

window.VT_FEATURES = {
  showLogin: false,
  showBooking: false,
  ...(window.VT_FEATURES || {})
};

// ─── Theme: apply saved preference BEFORE paint (avoids flash) ────────────
(function() {
  function getTheme() {
    const saved = localStorage.getItem('vt-theme');
    if (saved) return saved;

    // Auto-toggle based on time: 6 AM (6:00) to 6 PM (18:00) is Day mode
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    return isDayTime ? 'light' : 'dark';
  }

  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initRevealAnimations();
});

// ─── Navbar ────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  // Some pages (e.g., full-map view) don't render the shared navbar.
  if (!navbar) return;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Close on link click (mobile)
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      });
    });
  }
}

// ─── Day / Night Theme Toggle ─────────────────────────────────────────────
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('vt-theme', next);
    updateLogos(next);
    
    // Trigger map update if on map page
    if (typeof window.updateMapStyle === 'function') {
      window.updateMapStyle();
    }
    if (typeof window.updateContactMapStyle === 'function') {
      window.updateContactMapStyle();
    }
    if (typeof window.updateHomeIcons === 'function') {
      window.updateHomeIcons();
    }
    if (typeof window.updateHeroMapStyle === 'function') {
      window.updateHeroMapStyle();
    }
  });
}

function updateLogos(theme) {
  // Logo images removed per user request
}

// ─── Reveal on Scroll ──────────────────────────────────────────────────────
function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ─── Render navbar HTML (navbar removed per user request) ──────────────────
function renderNavbar(activePage) {
  // Top nav bar showing home, contact, destinations removed
  return '';
}

// ─── Render footer HTML (shared across pages) ──────────────────────────────
function getCategoryIcon(iconKey) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const suffix = theme === 'dark' ? '-night' : '';
  return `/images/icons/${iconKey}${suffix}.png`;
}
// ─── Footer Social Handles ─────────────────────────────────────────────────
// Replace empty strings with full URLs to your verified accounts when ready.
// Empty string ⇒ link is omitted from rendered footer (safer than pointing to platform homepage).
const VT_SOCIAL = {
  instagram: '', // e.g. 'https://www.instagram.com/virtualtourism.in/'
  twitter:   '', // e.g. 'https://x.com/virtualtourism_in'
  youtube:   '', // e.g. 'https://www.youtube.com/@virtualtourism'
  linkedin:  ''  // e.g. 'https://www.linkedin.com/company/virtual-tourism-india/'
};

function renderFooter() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const logoSrc = currentTheme === 'dark' ? '/images/logo-night-h.png' : '/images/logo-day-h.png';

  // Only render a social link if the URL is actually configured.
  const socialLink = (url, label) => url
    ? `<li><a href="${url}" target="_blank" rel="noopener noreferrer me">${label}</a></li>`
    : '';
  const socialIcon = (url, label, svg) => url
    ? `<a href="${url}" target="_blank" rel="noopener noreferrer me" aria-label="${label}">${svg}</a>`
    : '';

  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="/index.html" class="footer-brand-link">
            <span style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 600; color: var(--color-primary);">Heritage &amp; Culture</span>
          </a>
          <p class="footer-desc">A curated digital atlas of heritage, temple, and cultural destinations across India. See More. Know More. Go Further.</p>
        </div>
        <div>
          <h4 class="footer-heading">Explore</h4>
          <ul class="footer-links">
            <li><a href="/virtual-temple-tours.html">Temple Destinations</a></li>
            <li><a href="/unesco-virtual-tours.html">UNESCO Heritage</a></li>
            <li><a href="/famous-monuments-virtual-tours.html">Famous Monuments</a></li>
            <li><a href="/index.html">All Destinations</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-heading">Company</h4>
          <ul class="footer-links">
            <li><a href="/about.html">About Us</a></li>
            <li><a href="/contact.html">Contact</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/terms.html">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-heading">Connect</h4>
          <ul class="footer-links footer-social-connect">
            <li>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
                </svg>
                <span>YouTube</span>
              </a>
            </li>
            <li>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4L10.5 12.5L4 20H6L11.5 14L16 20H20L13 11L19 4H17L12 9.5L8 4H4Z"/>
                </svg>
                <span>Twitter / X</span>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" class="footer-social-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span>LinkedIn</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© 2026 <a href="/index.html">Heritage &amp; Culture of India</a>. All rights reserved.</p>
        <div class="footer-socials">
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="18" cy="6" r="1" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
              <rect x="2" y="4" width="20" height="16" rx="4"/>
              <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
              <path d="M4 4L10.5 12.5L4 20H6L11.5 14L16 20H20L13 11L19 4H17L12 9.5L8 4H4Z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>`;
}

// ─── Experience Badges Component ───────────────────────────────────────────
function renderExperienceBadges(capabilities) {
    if (!capabilities) return '';

    const badgeMap = [
        { key: 'tour360', label: '360°', icon: '360-degree.png', alt: 'Interactive 360° virtual tour' },
        { key: 'vrHeadset', label: 'VR HEADSET', icon: 'vr-headset.png', alt: 'Compatible with VR headsets' },
        { key: 'multiLanguage', label: 'Multi-language', icon: 'multi-language.png', alt: 'Available in multiple languages' },
        { key: 'vr180', label: 'VR180', icon: 'vr-180.png', alt: 'Stereoscopic VR180 video' },
        { key: 'aiGuide', label: 'AI Guide', icon: 'ai-guide.png', alt: 'AI-powered virtual guide' },
        { key: 'digitalTwin', label: 'Digital Twin', icon: 'digital-twin.png', alt: 'Digital twin experience' },
        { key: 'spatialVR', label: 'Spatial VR', icon: 'spatial-vr.png', alt: 'Spatial VR experience' }
    ];

    const activeBadges = badgeMap.filter(b => capabilities[b.key]);
    if (activeBadges.length === 0) return '';

    const badgesHtml = activeBadges.map(b => `
        <span class="xr-badge" title="${b.alt}" aria-label="${b.alt}">
            <img src="/images/icons/badges/${b.icon}" alt="" aria-hidden="true" class="xr-badge-icon">
            <span class="xr-badge-label">${b.label}</span>
        </span>
    `).join('');

    return `<span class="xr-badges-container">${badgesHtml}</span>`;
}

// ─── Render destination card HTML ──────────────────────────────────────────
function renderDestinationCard(dest) {
  const tags = dest.categories.map(c => `<span class="tag">${c}</span>`).join('');
  const slug = dest.slug ||
    `${dest.name}-${dest.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const isVrSupported = dest.capabilities && dest.capabilities.vrHeadset === true;
  
  return `
  <article class="destination-card reveal" onclick="window.location.href='/virtual-tour/${slug}'" style="cursor: pointer;" title="Open ${dest.name}">
    <div class="destination-card-image">
      ${renderExperienceBadges(dest.capabilities)}
      <img src="${dest.image}" alt="${dest.name} in ${dest.city}, ${dest.state}" loading="lazy">
    </div>
    <div class="destination-card-body">
      <div class="destination-card-location">${dest.city}, ${dest.state}</div>
      <h3 class="destination-card-name">${dest.name}</h3>
      <p class="destination-card-desc">${dest.description}</p>
      <div class="destination-card-tags">${tags}</div>
      <a href="/virtual-tour/${slug}" class="destination-card-cta" ${isVrSupported ? 'data-xr-supported="true"' : ''} onclick="event.stopPropagation();">
        Explore Destination
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M5 12H19M19 12L13 6M19 12L13 18"/>
        </svg>
      </a>
    </div>
  </article>`;
}

// ─── Phase 2: XR-Aware Destination Launcher ─────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  if (navigator.xr && navigator.xr.isSessionSupported) {
    navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
      if (supported) {
        var xrBtns = document.querySelectorAll('.destination-card-cta[data-xr-supported="true"]');
        for (var i = 0; i < xrBtns.length; i++) {
          var btn = xrBtns[i];
          var svg = btn.querySelector('svg');
          btn.innerHTML = 'LAUNCH EXPERIENCE\n        ';
          if (svg) btn.appendChild(svg);
          
          btn.addEventListener('click', function(e) {
            sessionStorage.setItem('vt_xr_intent', 'true');
          });
        }
      }
    }).catch(function(e) {
      console.warn('[main.js] WebXR capability check failed:', e);
    });
  }
});
