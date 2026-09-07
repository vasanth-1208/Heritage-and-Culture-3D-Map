// ─── Virtual Tourism — Destination Page Controller ────────────────────────────
// Architecture: DIRECT-EMBED (no iframe, single auth, parallel loading)
//
// Flow:
//   1. Resolve slug from URL → render static content immediately
//   2. PARALLEL: POST /api/tour-access  +  loadScript(tour.js)  +  loadScript(vt-player.js)
//   3. Auth resolves first (scripts overlap) → 50 ms cookie flush
//   4. VTPlayer.bindAudio(cfg) → arms audio/VR exports on window
//   5. embedpano() → tour.xml → tiles   (single auth, no iframe, no postMessage)
//   6. Controls call window.vtKrpano directly
// ─────────────────────────────────────────────────────────────────────────────

(function () {

  // ── State ─────────────────────────────────────────────────────────────────
  var _currentLang = 'EN';
  var _isMuted     = false;

  // ── Script loader ──────────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ── Identifier resolution ──────────────────────────────────────────────────
  function getIdentifier() {
    var params   = new URLSearchParams(window.location.search);
    var id       = params.get('id');
    if (id) return { type: 'id', value: id };

    var slugQuery = params.get('slug');
    if (slugQuery) return { type: 'slug', value: slugQuery };

    var pathParts = window.location.pathname.split('/').filter(Boolean);
    var lastPart  = pathParts.pop() || '';
    var slug      = lastPart.replace(/\.html$/i, '');

    // Guard: if we're on a bare /destination URL with no slug
    if (slug === 'destination') return null;

    return { type: 'slug', value: slug };
  }

  function getDestinationData(ident) {
    if (!ident) return null;
    var base;
    if (ident.type === 'id') {
      base = DESTINATIONS.find(function (d) { return d.id == ident.value; });
    } else {
      base = DESTINATIONS.find(function (d) { return d.slug === ident.value; });
    }
    if (!base) return null;
    // Merge enriched content (seoContent, faq, travel, video) from dest-content.js if available
    var extra = (typeof DEST_CONTENT !== 'undefined' && DEST_CONTENT[base.slug]) || {};
    return Object.assign({}, base, extra);
  }

  // ── Main init ─────────────────────────────────────────────────────────────
  async function init() {
    var ident = getIdentifier();
    var dest  = getDestinationData(ident);
    if (!dest) { showError('Destination not found. Please return to the map and try again.'); return; }

    // Phase 1: Static rendering — immediate, no network dependency
    try {
      renderPageContent(dest);
      initGallery(dest);
      renderVideoSection(dest);
      renderTravelSection(dest);
    } catch (e) { console.error('[destination.js] Static render failed:', e); }

    // Coming soon — skip tour init entirely
    if (dest.comingSoon || !dest.tourConfig) {
      var loadingEl = document.getElementById('tourLoading');
      if (loadingEl) loadingEl.style.display = 'none';
      var tourViewer = document.getElementById('tourViewer');
      if (tourViewer) {
        var cs = document.createElement('div');
        cs.className = 'viewer-coming-soon';
        cs.innerHTML = '<div class="viewer-cs-inner">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="64" height="64"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
          '<h2>Virtual Tour Coming Soon</h2>' +
          '<p>We are capturing an immersive 360° experience of <strong>' + dest.name + '</strong>.<br>Check back soon!</p>' +
          '<span class="viewer-cs-badge">In Production</span></div>';
        tourViewer.appendChild(cs);
      }
      return;
    }

    var cfg = dest.tourConfig; // { tid, xmlVersion, soundVersion }
    setupControls(dest);
    
    var xrContainer = document.getElementById('xrLaunchContainer');
    // XR container visibility is managed by checkXrCapability later.

    // Phase 2: PARALLEL — auth + vt-player.js fire simultaneously.
    //   vt-player.js is in the unprotected frontend bucket — no cookies needed.
    //   tour.js is in the GATED VR-assets bucket (/tours/*) — MUST wait for auth cookies.
    var authPromise    = fetch('/api/tour-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: dest.slug }),
      credentials: 'include'
    });
    var playerJsPromise = loadScript('/js/vt-player.js?v=20260508');

    // Auth must complete before loading tour.js (CloudFront cookies gate /tours/*)
    try {
      var authResp = await authPromise;
      if (!authResp.ok) {
        var errData = await authResp.json().catch(function () { return {}; });
        throw new Error(errData.message || 'Tour access denied');
      }
    } catch (e) {
      console.error('[destination.js] Auth failed:', e);
      showError(e.message || 'Failed to authenticate tour access.');
      return;
    }

    // Phase 3: Minimal cookie flush — let browser persist Set-Cookie before CDN requests
    await new Promise(function (r) { setTimeout(r, 50); });

    // Now load tour.js — cookies are set, CloudFront will allow /destinations/* requests
    // tour.js path: /destinations/{tid}/tour.js (contains destination-specific decryption keys)
    var tourJsUrl = '/tours/' + dest.slug + '/tour.js?v=' + cfg.xmlVersion;
    try {
      await Promise.all([
        loadScript(tourJsUrl),
        playerJsPromise  // vt-player.js (likely already done)
      ]);
    } catch (e) {
      console.error('[destination.js] Script load failed:', e);
      showError('Failed to load tour engine. Please refresh.');
      return;
    }

    // Phase 4: Arm audio/VR system (sets _cfg so vtPlaySceneVoice uses correct lang/version)
    if (window.VTPlayer && typeof window.VTPlayer.bindAudio === 'function') {
      window.VTPlayer.bindAudio({
        slug:           dest.slug,
        validLanguages: dest.languages || ['EN'],
        xmlVersion:     cfg.xmlVersion,
        soundVersion:   cfg.soundVersion
      });
    }

    // Phase 5: Direct embedpano — single render context, no iframe overhead
    var xmlUrl = '/tours/' + dest.slug + '/tour.xml?v=' + cfg.xmlVersion;
    try {
      embedpano({
        target:              'pano',
        xml:                 xmlUrl,
        basepath:            '/tours/' + dest.slug + '/',
        html5:               'only',
        passQueryParameters: 'startscene,startlookat',
        cors:                'use-credentials',
        consolelog:          false,
        onready: function (krpanoApi) {
          // ── Inject sequential voice_id if scenes have none (e.g. Ajanta) ──
          // Ajanta was published without voice_id attrs on scenes, but audio
          // files are numbered 1…N matching XML scene order. Detect and inject.
          try {
            var sceneCount = parseInt(krpanoApi.get('scene.count'), 10) || 0;
            if (sceneCount > 0) {
              var firstId = (krpanoApi.get('scene[0].voice_id') || '').toString().trim();
              if (!firstId) {
                for (var i = 0; i < sceneCount; i++) {
                  krpanoApi.set('scene[' + i + '].voice_id', String(i + 1));
                }
                console.log('[destination.js] Injected voice_id 1-' + sceneCount + ' into scenes.');
              }
            }
          } catch (e) { console.warn('[destination.js] voice_id inject:', e); }

          // Wire VR callbacks and state watcher
          if (window.VTPlayer && typeof window.VTPlayer.onKrpanoReady === 'function') {
            window.VTPlayer.onKrpanoReady(krpanoApi);
          }
          // Remove intro splash card blocker and logos
          try {
            krpanoApi.call("removelayer(skin_intro_blocker); removelayer(logo);");
            krpanoApi.set("layer[skin_intro_blocker].visible", false);
            krpanoApi.set("layer[skin_intro_blocker].enabled", false);
            krpanoApi.set("layer[logo].visible", false);
            krpanoApi.set("layer[logo].enabled", false);
            krpanoApi.set("layer[skin_thumbs_container].visible", true);
          } catch (e) {}

          // Apply pending language / mute
          try { krpanoApi.call("set_tour_language('" + _currentLang + "');"); } catch (e) {}
          try { krpanoApi.call('set_tour_mute(' + (_isMuted ? 'true' : 'false') + ');'); } catch (e) {}
          // Show viewer + controls
          var loadingEl = document.getElementById('tourLoading');
          if (loadingEl) loadingEl.style.display = 'none';
          var overlay = document.getElementById('tourOverlay');
          if (overlay) overlay.style.display = 'flex';
          console.log('[destination.js] KRPano ready — direct embed, no iframe.');
          
          checkXrCapability();
        }
      });
    } catch (e) {
      showError('Failed to start virtual tour.');
      return;
    }

    // 15 s safety fallback (e.g. KRPano loads but onready delayed)
    setTimeout(function () {
      var loadingEl = document.getElementById('tourLoading');
      if (loadingEl && loadingEl.style.display !== 'none') {
        console.warn('[destination.js] embedpano timeout — force-showing viewer.');
        loadingEl.style.display = 'none';
        var overlay = document.getElementById('tourOverlay');
        if (overlay) overlay.style.display = 'flex';
      }
    }, 15000);
  }

  // ── Static content rendering ───────────────────────────────────────────────
  function renderPageContent(dest) {
    // Title & meta
    document.title = dest.name + ' – Heritage & Culture';
    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = dest.name + ' — Heritage & Culture';
    var metaDesc = document.getElementById('metaDesc');
    if (metaDesc) metaDesc.setAttribute('content', 'Explore ' + dest.name + ' in ' + dest.city + '. ' + dest.description);

    // Breadcrumb
    var breadcrumb = document.getElementById('destBreadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML =
        '<a href="/">Home</a>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M9 18l6-6-6-6"/></svg>' +
        '<a href="/virtual-tourism.html">Destinations</a>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M9 18l6-6-6-6"/></svg>' +
        '<span>' + dest.name + '</span>';
    }

    // Floating Back button over the tour viewer
    var tourViewer = document.getElementById('tourViewer');
    if (tourViewer && !tourViewer.querySelector('.tour-back-btn')) {
      var backBtn = document.createElement('a');
      backBtn.href = '/';
      backBtn.className = 'tour-back-btn';
      backBtn.title = 'Back to All Destinations';
      backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>All Destinations</span>';
      tourViewer.appendChild(backBtn);
    }

    // Hero info
    var destTitle = document.getElementById('destTitle');
    if (destTitle) destTitle.textContent = dest.name;

    var destLocation = document.getElementById('destLocation');
    var tagsContainer = document.getElementById('destTags');
    if (destLocation) {
        destLocation.innerHTML = dest.city + ', ' + dest.state;
        
        var badgesHtml = '';
        if (typeof renderExperienceBadges === 'function' && dest.capabilities) {
            badgesHtml = renderExperienceBadges(dest.capabilities);
        }
        
        if (badgesHtml && tagsContainer) {
            var existingBadges = document.getElementById('destBadgesContainer');
            if (existingBadges) existingBadges.remove();
            
            var badgesDiv = document.createElement('div');
            badgesDiv.id = 'destBadgesContainer';
            badgesDiv.className = 'dest-badges-detail-row';
            badgesDiv.innerHTML = badgesHtml;
            tagsContainer.parentNode.insertBefore(badgesDiv, tagsContainer.nextSibling);
        }
    }

    var tagsContainer = document.getElementById('destTags');
    if (tagsContainer) {
      tagsContainer.innerHTML = dest.categories.map(function (c) {
        return '<span class="tag">' + c + '</span>';
      }).join('');
    }

    // Welcome blurb + SEO Content
    var body = document.getElementById('destContentBody');
    if (body) {
      var html = '';

      // ── Welcome / intro blurb (above seoContent, destination-specific) ──────
      if (dest.welcomeBlurb) {
        var blurbParts = dest.welcomeBlurb.split(/\n\n+/).filter(Boolean);
        var blurbTitle = blurbParts[0] || '';
        var blurbBody  = blurbParts.slice(1).map(function(p) {
          return '<p class="dest-welcome-text">' + p.trim() + '</p>';
        }).join('');
        html +=
          '<div class="dest-welcome-blurb">' +
            '<h2 class="dest-welcome-heading">' + blurbTitle + '</h2>' +
            blurbBody +
          '</div>';
      }

      // ── Main editorial / seoContent ──────────────────────────────────────────
      if (dest.seoContent) {
        var paras = dest.seoContent.split(/\n\n+/).filter(Boolean);
        html +=
          '<div class="dest-content-section">' +
            '<h2 class="dest-content-heading">Experience ' + dest.name + ' in 360\u00b0</h2>' +
            paras.map(function(p){ 
              var pt = p.trim();
              if (pt.startsWith('<h') || pt.startsWith('<div') || pt.startsWith('<ul') || pt.startsWith('<ol') || pt.startsWith('<li')) return pt;
              return '<p class="dest-content-text">' + pt + '</p>'; 
            }).join('') +
          '</div>';
      } else {
        html +=
          '<div class="dest-content-section">' +
            '<h2 class="dest-content-heading">Experience ' + dest.name + ' in 360\u00b0</h2>' +
            '<p class="dest-content-text">' + dest.description + '</p>' +
          '</div>';
      }

      body.innerHTML = html;
    }


    // FAQ — use dest.faq array if available
    var faqList = document.getElementById('destFaqList');
    if (faqList) {
      if (dest.faq && dest.faq.length) {
        faqList.innerHTML = dest.faq.map(function(item, i) {
          return '<div class="faq-item' + (i === 0 ? ' active' : '') + '">' +
            '<div class="faq-question"><span>' + item.q + '</span>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 9l6 6 6-6"/></svg>' +
            '</div>' +
            '<div class="faq-answer"><p>' + item.a + '</p></div>' +
          '</div>';
        }).join('');
        // Accordion toggle
        faqList.querySelectorAll('.faq-question').forEach(function(q) {
          q.addEventListener('click', function() {
            var item = q.parentElement;
            var wasActive = item.classList.contains('active');
            faqList.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('active'); });
            if (!wasActive) item.classList.add('active');
          });
        });
      } else {
        faqList.innerHTML =
          '<div class="faq-item active">' +
            '<div class="faq-question"><span>About ' + dest.name + '</span></div>' +
            '<div class="faq-answer"><p>' + dest.description + '</p></div>' +
          '</div>';
      }
    }

    renderNearby(dest);
  }

  // ── Video Section ────────────────────────────────────────────────────────────
  function renderVideoSection(dest) {
    var wrapper = document.getElementById('destVideoWrapper');
    if (!wrapper) return;
    if (dest.video) {
      wrapper.innerHTML =
        '<div class="dest-video-frame-wrap">' +
          '<iframe src="' + dest.video + '" title="' + dest.name + ' Video Tour"' +
          ' frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
          ' allowfullscreen loading="lazy"></iframe>' +
        '</div>';
    } else {
      wrapper.innerHTML =
        '<div class="dest-video-coming-soon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>' +
          '</svg>' +
          '<h3>Video Tour Coming Soon</h3>' +
          '<p>We are producing a cinematic video tour of ' + dest.name + '. Check back soon.</p>' +
        '</div>';
    }
  }

  // ── Travel Section ───────────────────────────────────────────────────────────
  function renderTravelSection(dest) {
    var container = document.getElementById('travelContent');
    if (!container) return;
    var t = dest.travel;
    if (!t) {
      container.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;">Travel information coming soon.</p>';
      return;
    }

    // Gold line-art SVG icons — matching the category icon style
    var ICONS = {
      calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="7" y1="14" x2="9" y2="14"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="7" y1="18" x2="9" y2="18"/></svg>',
      airplane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
      train:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="3"/><path d="M8 17l-2 4M16 17l2 4M8 21h8"/><line x1="4" y1="10" x2="20" y2="10"/><circle cx="8.5" cy="13.5" r="1"/><circle cx="15.5" cy="13.5" r="1"/></svg>',
      ticket:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a2 2 0 010 4v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 010-4V9z"/><line x1="9" y1="7" x2="9" y2="17" stroke-dasharray="2 2"/><line x1="15" y1="10" x2="18" y2="10"/><line x1="15" y1="13" x2="17" y2="13"/></svg>',
      clock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/><line x1="12" y1="3" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="21"/><line x1="3" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="21" y2="12"/></svg>'
    };

    var cards = '';
    if (t.bestTime)        cards += travelCard(ICONS.calendar, 'Best Time to Visit', t.bestTime);
    if (t.nearestAirport)  cards += travelCard(ICONS.airplane,  'Nearest Airport',    t.nearestAirport);
    if (t.nearestRailway)  cards += travelCard(ICONS.train,     'Nearest Railway',    t.nearestRailway);
    if (t.entryFee)        cards += travelCard(ICONS.ticket,    'Entry Fee',          t.entryFee);
    if (t.timings)         cards += travelCard(ICONS.clock,     'Timings',            t.timings);

    var tipsHtml = '';
    if (t.tips && t.tips.length) {
      tipsHtml = '<div class="dest-travel-tips">' +
        '<h3 class="dest-travel-tips-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display:inline-block;vertical-align:middle;margin-right:8px;margin-bottom:3px;color:var(--color-primary)"><path d="M9 21h6"/><path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6-.5.3-.7.8-.7 1.3V17H9v-.7c0-.5-.2-1-.7-1.3A7 7 0 0112 2z"/><line x1="9" y1="17" x2="9" y2="19"/><line x1="15" y1="17" x2="15" y2="19"/></svg>Visitor Tips</h3>' +
        '<ul class="dest-travel-tips-list">' +
        t.tips.map(function(tip){ return '<li>' + tip + '</li>'; }).join('') +
        '</ul></div>';
    }
    container.innerHTML = '<div class="dest-travel-cards">' + cards + '</div>' + tipsHtml;
  }

  function travelCard(icon, label, value) {
    return '<div class="dest-travel-card">' +
      '<div class="dest-travel-card-icon">' + icon + '</div>' +
      '<div class="dest-travel-card-body">' +
        '<div class="dest-travel-card-label">' + label + '</div>' +
        '<div class="dest-travel-card-value">' + value + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderNearby(currentDest) {
    var grid = document.getElementById('nearbyGrid');
    if (!grid) return;
    var nearby = DESTINATIONS
      .filter(function (d) { return d.id !== currentDest.id; })
      .slice(0, 3);
    grid.innerHTML = nearby.map(function (d) { return renderDestinationCard(d); }).join('');
  }

  function initGallery(dest) {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;

    if (!dest.gallery || dest.gallery.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-text-secondary);">Images coming soon.</p>';
      return;
    }

    grid.innerHTML = dest.gallery.map(function (img, i) {
      var altText = (dest.imageAlts && dest.imageAlts[i]) ? dest.imageAlts[i] : (dest.name + ' Gallery ' + (i + 1));
      return '<div class="dest-gallery-item reveal" data-index="' + i + '">' +
               '<img src="' + img + '" alt="' + altText + '" loading="lazy">' +
             '</div>';
    }).join('');

    // Gallery items are injected AFTER initRevealAnimations() runs, so the
    // IntersectionObserver never picked them up. Force-reveal them immediately.
    grid.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('revealed');
    });

    var items = grid.querySelectorAll('.dest-gallery-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var index = parseInt(item.getAttribute('data-index'));
        openLightbox(dest.gallery, dest.name, index);
      });
    });
  }

  function openLightbox(images, destName, startIndex) {
    var lb       = document.getElementById('lightbox');
    var lbImg    = document.getElementById('lightboxImg');
    var lbClose  = document.getElementById('lightboxClose');
    var lbPrev   = document.getElementById('lightboxPrev');
    var lbNext   = document.getElementById('lightboxNext');
    var lbCaption = document.getElementById('lightboxCaption');
    if (!lb || !lbImg) return;

    var current = startIndex;

    function showImage(index) {
      current = (index + images.length) % images.length;
      lbImg.src = images[current];
      if (lbCaption) lbCaption.textContent = destName + ' — ' + (current + 1) + ' / ' + images.length;
    }

    showImage(current);
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');

    lbClose.onclick = function () {
      lb.classList.remove('active');
      lb.setAttribute('aria-hidden', 'true');
    };

    if (lbPrev) lbPrev.onclick = function () { showImage(current - 1); };
    if (lbNext) lbNext.onclick = function () { showImage(current + 1); };

    // Keyboard navigation
    lb._keyHandler = function (e) {
      if (e.key === 'ArrowLeft')  showImage(current - 1);
      if (e.key === 'ArrowRight') showImage(current + 1);
      if (e.key === 'Escape') { lb.classList.remove('active'); lb.setAttribute('aria-hidden', 'true'); }
    };
    document.addEventListener('keydown', lb._keyHandler);
    lbClose.onclick = function () {
      lb.classList.remove('active');
      lb.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', lb._keyHandler);
    };
  }

  // ── Controls (direct KRPano API — no postMessage) ─────────────────────────
  function setupControls(dest) {
    var validLangs = (dest.languages && dest.languages.length) ? dest.languages : ['EN'];
    var otherLangs = validLangs.filter(function (l) { return l !== 'EN'; });
    var langOptions = document.getElementById('tourLangOptions');
    var langRow     = document.getElementById('tourLangRow');

    if (langOptions) {
      if (otherLangs.length === 0) {
        if (langRow) langRow.style.display = 'none';
        var divider = langRow && langRow.nextElementSibling;
        if (divider && divider.classList.contains('tour-pill-divider')) divider.style.display = 'none';
      } else {
        langOptions.innerHTML = otherLangs.map(function (l) {
          return '<button class="tour-lang-opt" data-lang="' + l + '">' + l + '</button>';
        }).join('');
        langOptions.querySelectorAll('.tour-lang-opt').forEach(function (btn) {
          btn.addEventListener('click', function (e) { e.stopPropagation(); setLanguage(btn.getAttribute('data-lang')); });
        });
        var langCurrentBtn = document.getElementById('tourLangCurrent');
        if (langCurrentBtn) {
          langCurrentBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (_currentLang !== 'EN') { setLanguage('EN'); } else { langRow.classList.toggle('open'); }
          });
        }
        document.addEventListener('click', function (e) {
          if (langRow && !langRow.contains(e.target)) langRow.classList.remove('open');
        });
      }
    }

    // Mute — direct KRPano call
    var muteBtn = document.getElementById('tourMuteBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        _isMuted = !_isMuted;
        updateMuteUI(_isMuted);
        var api = window.vtKrpano;
        if (api && typeof api.call === 'function') {
          try { api.call('set_tour_mute(' + (_isMuted ? 'true' : 'false') + ');'); } catch (e) {}
        }
        if (_isMuted && window.vtStopSceneVoice)   window.vtStopSceneVoice();
        if (!_isMuted && window.vtResumeSceneVoice) window.vtResumeSceneVoice();
        // Unlock audio on first gesture
        if (window.vtPendingAudioPlay && window.vtNarrationAudio) {
          try { window.vtNarrationAudio.play(); } catch (e) {}
        }
      });
    }

    // VR — direct KRPano call
    var vrBtn = document.getElementById('tourVrBtn');
    if (vrBtn) {
      vrBtn.addEventListener('click', function () {
        var api = window.vtKrpano;
        if (api && typeof api.call === 'function') {
          try { api.call('if(plugin[webvr], webvr.enterVR(););'); } catch (e) {}
        }
        var viewer = document.getElementById('tourViewer');
        if (viewer && viewer.requestFullscreen) viewer.requestFullscreen();
      });
    }

    // Fullscreen
    var fsBtn = document.getElementById('tourFsBtn');
    if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', function () {
      var fsEnter = document.getElementById('tourFsEnter');
      var fsExit  = document.getElementById('tourFsExit');
      if (document.fullscreenElement) {
        if (fsEnter) fsEnter.style.display = 'none';
        if (fsExit)  fsExit.style.display  = 'block';
      } else {
        if (fsEnter) fsEnter.style.display = 'block';
        if (fsExit)  fsExit.style.display  = 'none';
      }
    });

    // Share
    var shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        if (navigator.share) { navigator.share({ title: document.title, url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
      });
    }

    // Unlock audio on any user gesture
    ['pointerdown', 'touchend', 'click'].forEach(function (evt) {
      document.addEventListener(evt, function () {
        if (window.vtPendingAudioPlay && window.vtNarrationAudio) {
          try { window.vtNarrationAudio.play(); } catch (e) {}
        }
      }, { passive: true });
    });
  }

  function setLanguage(lang) {
    _currentLang = lang;
    var btn = document.getElementById('tourLangCurrent');
    if (btn) btn.textContent = lang;
    var row = document.getElementById('tourLangRow');
    if (row) row.classList.remove('open');
    // Direct KRPano call — no postMessage needed
    var api = window.vtKrpano;
    if (api && typeof api.call === 'function') {
      try { api.call("set_tour_language('" + lang + "');"); } catch (e) {}
    }
    // Re-trigger narration for the new language
    if (window.vtPlaySceneVoiceFromKrpano) {
      try { window.vtPlaySceneVoiceFromKrpano(); } catch (e) {}
    }
  }

  function updateMuteUI(isMuted) {
    var btn     = document.getElementById('tourMuteBtn');
    if (!btn) return;
    var iconOn  = btn.querySelector('.icon-on');
    var iconOff = btn.querySelector('.icon-off');
    if (isMuted) {
      if (iconOn)  iconOn.style.display  = 'none';
      if (iconOff) iconOff.style.display = 'block';
      btn.classList.remove('active');
    } else {
      if (iconOn)  iconOn.style.display  = 'block';
      if (iconOff) iconOff.style.display = 'none';
      btn.classList.add('active');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      var viewer = document.getElementById('tourViewer');
      if (viewer && viewer.requestFullscreen) viewer.requestFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  function showError(msg) {
    var loadingEl = document.getElementById('tourLoading');
    var errorEl   = document.getElementById('tourError');
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'flex';
      var p = errorEl.querySelector('p');
      if (p) p.textContent = msg;
    }
  }

  function checkXrCapability() {
    var xrContainer = document.getElementById('xrLaunchContainer');
    if (!xrContainer) return;

    // Read intent, store locally, and remove to prevent persistence
    var xrIntent = sessionStorage.getItem('vt_xr_intent') === 'true';
    if (sessionStorage.getItem('vt_xr_intent')) {
      sessionStorage.removeItem('vt_xr_intent');
    }

    // Hide container by default if no intent
    if (!xrIntent) {
      xrContainer.style.display = 'none';
      return;
    }

    var api = window.vtKrpano;
    var krpanoReady = api && typeof api.call === 'function' && typeof api.get === 'function' && api.get('plugin[webvr]');

    if (navigator.xr && navigator.xr.isSessionSupported && krpanoReady) {
      navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
        setupXrButton(supported, xrContainer);
      }).catch(function() {
        setupXrButton(false, xrContainer);
      });
    } else {
      setupXrButton(false, xrContainer);
    }
  }

  function setupXrButton(isSupported, xrContainer) {
    var btn = document.getElementById('btnLaunchXR');
    var txt = document.getElementById('xrBtnText');
    var fallbackMsg = document.getElementById('xrFallbackMsg');
    if (!btn || !txt) return;
    
    // Clear previous event listeners by cloning
    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    btn = newBtn;
    txt = btn.querySelector('.xr-text');
    btn.disabled = false;

    if (isSupported) {
      // Show container since they had intent and are supported
      xrContainer.style.display = 'flex';
      txt.textContent = 'ENTER XR EXPERIENCE';
      if (fallbackMsg) {
        fallbackMsg.style.display = 'none';
        fallbackMsg.style.color = '';
        fallbackMsg.textContent = "Immersive XR isn't supported on this device or browser. You can continue exploring this destination in 360°.";
      }
      btn.addEventListener('click', function() {
        var api = window.vtKrpano;
        if (api && typeof api.call === 'function') {
          try { 
            api.call('if(plugin[webvr], webvr.enterVR(););'); 
          } catch (e) {
            console.error('[destination.js] XR Launch Error:', e);
            if (fallbackMsg) {
              fallbackMsg.style.display = 'block';
              fallbackMsg.style.color = '#ff6b6b';
              fallbackMsg.textContent = 'Unable to start immersive XR. Please try again or continue in 360°.';
            }
          }
        }
      });
    } else {
      btn.style.display = 'none';
      if (fallbackMsg) {
        fallbackMsg.style.display = 'block';
        fallbackMsg.innerHTML = '<strong>XR NOT AVAILABLE</strong><br>Immersive XR isn\'t supported on this device or browser. You can continue exploring this destination in 360°.';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);

}());
