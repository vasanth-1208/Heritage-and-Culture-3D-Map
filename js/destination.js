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
    if (cfg && cfg.engine === 'pano2vr') {
      return initPano2VRTour(dest, cfg);
    }
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

  // ── Pano2VR Engine Tour Initializer & Bottom Bar ────────────────────────────
  var THANJAVUR_NODES = [
    { id: "node1",  title: "01. Brihadeeswara Temple", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node1.jpg" },
    { id: "node3",  title: "02. Front of Rajarajan Gopuram", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node3.jpg" },
    { id: "node4",  title: "03. Inside Rajarajan Gopuram", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node4.jpg" },
    { id: "node5",  title: "04. Big Temple", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node5.jpg" },
    { id: "node6",  title: "05. Brihadisvara Temple", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node6.jpg" },
    { id: "node7",  title: "06. Nandi Mandapam", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node7.jpg" },
    { id: "node8",  title: "07. Front of Monolithic Nandi", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node8.jpg" },
    { id: "node9",  title: "08. Front view of Brihadisvara Temple", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node9.jpg" },
    { id: "node10", title: "09. A view from south-side", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node10.jpg" },
    { id: "node11", title: "10. South-side Entrance", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node11.jpg" },
    { id: "node12", title: "11. Back side of the Gopuram", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node12.jpg" },
    { id: "node13", title: "12. Murugan Temple", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node13.jpg" },
    { id: "node14", title: "13. North-side Entrance", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node14.jpg" },
    { id: "node2",  title: "14. Perspective View", thumb: "/tours/brihadeeswara-temple-thanjavur/images/ht_preview_nodeimage_node2.jpg" }
  ];

  function setupPano2VRBottomBar(dest, pano, skin) {
    var viewer = document.getElementById('tourViewer');
    if (!viewer) return;

    // Check if bottom bar and restore button already exist
    var existingBar = document.getElementById('vtBottomBar');
    if (existingBar) existingBar.remove();

    var existingRestoreBtn = document.getElementById('vtBtnRestoreBar');
    if (existingRestoreBtn) existingRestoreBtn.remove();

    var wrap = document.createElement('div');
    wrap.id = 'vtBottomBar';
    wrap.className = 'vt-bottom-bar-wrap';

    wrap.innerHTML = `
      <!-- Thumbnail Drawer ("Next We Move") -->
      <div id="vtThumbsTray" class="vt-thumbs-tray">
        <div class="vt-thumbs-header">
          <span class="vt-thumbs-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Explore Scenes &bull; Next We Move
          </span>
          <button id="vtCloseThumbsBtn" class="vt-thumbs-close" title="Close Tray">&times;</button>
        </div>
        <div class="vt-thumbs-container">
          <button id="vtScrollLeftBtn" class="vt-scroll-btn" aria-label="Scroll left">&#8249;</button>
          <div id="vtThumbsScroll" class="vt-thumbs-scroll"></div>
          <button id="vtScrollRightBtn" class="vt-scroll-btn" aria-label="Scroll right">&#8250;</button>
        </div>
      </div>

      <!-- Red Scene Title Strip -->
      <div id="vtTitleStrip" class="vt-title-strip" title="Click to view all scenes">
        <span id="vtCurrentSceneTitle">01. Brihadeeswara Temple</span>
      </div>

      <!-- Main Bottom Control Bar -->
      <div id="vtControlBar" class="vt-control-bar">
        <!-- Left: Prev Scene + Grid -->
        <div class="vt-ctrl-group">
          <button id="vtBtnPrev" class="vt-ctrl-btn" title="Previous Scene" aria-label="Previous Scene">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          </button>
          <button id="vtBtnGrid" class="vt-ctrl-btn" title="View All Scenes" aria-label="View All Scenes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
        </div>

        <!-- Center: Navigation Arrows & Zoom -->
        <div class="vt-ctrl-group">
          <button id="vtBtnPanLeft" class="vt-ctrl-btn" title="Pan Left" aria-label="Pan Left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button id="vtBtnPanRight" class="vt-ctrl-btn" title="Pan Right" aria-label="Pan Right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button id="vtBtnPanUp" class="vt-ctrl-btn" title="Tilt Up" aria-label="Tilt Up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button id="vtBtnPanDown" class="vt-ctrl-btn" title="Tilt Down" aria-label="Tilt Down">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button id="vtBtnZoomIn" class="vt-ctrl-btn" title="Zoom In" aria-label="Zoom In">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button id="vtBtnZoomOut" class="vt-ctrl-btn" title="Zoom Out" aria-label="Zoom Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button id="vtBtnVR" class="vt-ctrl-btn" title="VR Mode" aria-label="VR Mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4l3 3h4l3-3h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><circle cx="7.5" cy="12" r="1.5"/><circle cx="16.5" cy="12" r="1.5"/></svg>
          </button>
        </div>

        <!-- Right: Fullscreen + Collapse + Next Scene -->
        <div class="vt-ctrl-group">
          <button id="vtBtnFullscreen" class="vt-ctrl-btn" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
          <button id="vtBtnToggleBar" class="vt-ctrl-btn vt-btn-collapse" title="Hide Controls" aria-label="Hide Controls">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button id="vtBtnNext" class="vt-ctrl-btn" title="Next Scene" aria-label="Next Scene">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          </button>
        </div>
      </div>
    `;

    viewer.appendChild(wrap);

    // Floating restore button to open bottom bar after closing
    var restoreBtn = document.createElement('button');
    restoreBtn.id = 'vtBtnRestoreBar';
    restoreBtn.className = 'vt-btn-restore';
    restoreBtn.title = 'Show Controls';
    restoreBtn.setAttribute('aria-label', 'Show Controls');
    restoreBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
      <span>Show Controls</span>
    `;
    viewer.appendChild(restoreBtn);

    // Populate thumbnail cards
    var scrollContainer = document.getElementById('vtThumbsScroll');
    THANJAVUR_NODES.forEach(function(node, index) {
      var card = document.createElement('div');
      card.className = 'vt-thumb-card' + (index === 0 ? ' active' : '');
      card.dataset.nodeId = node.id;
      card.innerHTML = `
        <div class="vt-thumb-img-wrap">
          <img src="${node.thumb}" alt="${node.title}" loading="lazy" />
          <span class="vt-thumb-badge">${String(index + 1).padStart(2, '0')}</span>
        </div>
        <span class="vt-thumb-title" title="${node.title}">${node.title}</span>
      `;
      card.addEventListener('click', function() {
        openScene(node.id);
      });
      scrollContainer.appendChild(card);
    });

    var thumbsTray = document.getElementById('vtThumbsTray');
    var btnGrid = document.getElementById('vtBtnGrid');
    var titleStrip = document.getElementById('vtTitleStrip');
    var titleEl = document.getElementById('vtCurrentSceneTitle');

    function toggleThumbs() {
      var isActive = thumbsTray.classList.toggle('active');
      if (btnGrid) btnGrid.classList.toggle('active', isActive);
      if (isActive) {
        var activeCard = scrollContainer.querySelector('.vt-thumb-card.active');
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }

    if (btnGrid) btnGrid.addEventListener('click', toggleThumbs);
    if (titleStrip) {
      titleStrip.addEventListener('click', function() {
        if (wrap.classList.contains('collapsed')) {
          setBarCollapsed(false);
        } else {
          toggleThumbs();
        }
      });
    }

    var closeBtn = document.getElementById('vtCloseThumbsBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        thumbsTray.classList.remove('active');
        if (btnGrid) btnGrid.classList.remove('active');
      });
    }

    var scrollLeftBtn = document.getElementById('vtScrollLeftBtn');
    var scrollRightBtn = document.getElementById('vtScrollRightBtn');
    if (scrollLeftBtn) {
      scrollLeftBtn.addEventListener('click', function() {
        scrollContainer.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }
    if (scrollRightBtn) {
      scrollRightBtn.addEventListener('click', function() {
        scrollContainer.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }

    function setBarCollapsed(collapsed) {
      if (collapsed) {
        wrap.classList.add('collapsed');
        restoreBtn.classList.add('visible');
        if (thumbsTray) thumbsTray.classList.remove('active');
        if (btnGrid) btnGrid.classList.remove('active');
      } else {
        wrap.classList.remove('collapsed');
        restoreBtn.classList.remove('visible');
      }
    }

    var toggleBarBtn = document.getElementById('vtBtnToggleBar');
    if (toggleBarBtn) {
      toggleBarBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        setBarCollapsed(true);
      });
    }

    restoreBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      setBarCollapsed(false);
    });

    // Fullscreen
    var fsBtn = document.getElementById('vtBtnFullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
          viewer.requestFullscreen().catch(function() {
            document.documentElement.requestFullscreen();
          });
        } else {
          document.exitFullscreen();
        }
      });
    }

    // VR
    var vrBtn = document.getElementById('vtBtnVR');
    if (vrBtn) {
      vrBtn.addEventListener('click', function() {
        toggleVRMode();
      });
    }

    // Continuous motion helper for smooth pan/tilt/zoom
    function bindContinuousAction(btnId, actionFn) {
      var btn = document.getElementById(btnId);
      if (!btn) return;

      var animId = null;
      function loop() {
        actionFn();
        animId = requestAnimationFrame(loop);
      }
      btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        actionFn();
        animId = requestAnimationFrame(loop);
      });
      btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        actionFn();
        animId = requestAnimationFrame(loop);
      }, { passive: false });

      function stop() {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        if (pano) {
          try {
            if (pano.fov) pano.fov.d = 0;
            if (pano.pan) pano.pan.d = 0;
            if (pano.v)   pano.v.d = 0;
          } catch (err) {}
        }
      }
      window.addEventListener('mouseup', stop);
      window.addEventListener('touchend', stop);
      btn.addEventListener('mouseleave', stop);
    }

    bindContinuousAction('vtBtnPanLeft', function() { pano.changePanLog(1.4, true); });
    bindContinuousAction('vtBtnPanRight', function() { pano.changePanLog(-1.4, true); });
    bindContinuousAction('vtBtnPanUp', function() { pano.changeTiltLog(1.2, true); });
    bindContinuousAction('vtBtnPanDown', function() { pano.changeTiltLog(-1.2, true); });
    // Invert zoom direction so Zoom In zooms in (closer view) and Zoom Out zooms out
    bindContinuousAction('vtBtnZoomIn', function() { pano.changeFovLog(1.2, true); });
    bindContinuousAction('vtBtnZoomOut', function() { pano.changeFovLog(-1.2, true); });

    function openScene(nodeId) {
      if (!pano) return;
      try {
        pano.openNext('{' + nodeId + '}');
      } catch (e) {
        try { pano.openNext(nodeId); } catch (e2) {}
      }
      updateActiveScene(nodeId);
    }

    function updateActiveScene(nodeId) {
      if (!nodeId) nodeId = pano.getCurrentNode() || 'node1';
      nodeId = nodeId.replace(/[{}]/g, '');

      var nodeInfo = THANJAVUR_NODES.find(function(n) { return n.id === nodeId; });
      if (nodeInfo && titleEl) {
        titleEl.textContent = nodeInfo.title;
      }

      var cards = scrollContainer.querySelectorAll('.vt-thumb-card');
      cards.forEach(function(c) {
        if (c.dataset.nodeId === nodeId) {
          c.classList.add('active');
          c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
          c.classList.remove('active');
        }
      });
    }

    // Prev / Next Scene buttons
    var btnPrev = document.getElementById('vtBtnPrev');
    var btnNext = document.getElementById('vtBtnNext');
    if (btnPrev) {
      btnPrev.addEventListener('click', function() {
        var curId = (pano.getCurrentNode() || 'node1').replace(/[{}]/g, '');
        var idx = THANJAVUR_NODES.findIndex(function(n) { return n.id === curId; });
        var prevIdx = (idx <= 0) ? THANJAVUR_NODES.length - 1 : idx - 1;
        openScene(THANJAVUR_NODES[prevIdx].id);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', function() {
        var curId = (pano.getCurrentNode() || 'node1').replace(/[{}]/g, '');
        var idx = THANJAVUR_NODES.findIndex(function(n) { return n.id === curId; });
        var nextIdx = (idx + 1) % THANJAVUR_NODES.length;
        openScene(THANJAVUR_NODES[nextIdx].id);
      });
    }

    // Node change listener on pano
    pano.addListener('changenode', function() {
      var curNode = pano.getCurrentNode();
      updateActiveScene(curNode);
    });

    // Initial sync
    setTimeout(function() {
      updateActiveScene(pano.getCurrentNode() || 'node1');
    }, 500);
  }

  async function initPano2VRTour(dest, cfg) {
    setupControls(dest);

    var basePath = '/tours/' + dest.slug + '/';
    try {
      await Promise.all([
        loadScript(basePath + 'webxr/three.min.js'),
        loadScript(basePath + 'webxr/webxr-polyfill.min.js')
      ]);
      await loadScript(basePath + 'pano2vr_player.js');
      await loadScript(basePath + 'skin.js');
    } catch (e) {
      console.error('[destination.js] Failed to load Pano2VR scripts:', e);
      showError('Failed to load virtual tour engine. Please refresh.');
      return;
    }

    try {
      var panoDiv = document.getElementById('pano');
      if (!panoDiv) {
        showError('Tour viewer container not found.');
        return;
      }
      panoDiv.style.width = '100%';
      panoDiv.style.height = '100%';
      panoDiv.style.overflow = 'hidden';

      var pano = new pano2vrPlayer('pano');
      window.vtPano2vr = pano;
      window.vtKrpano = null;

      var skin = new pano2vrSkin(pano, basePath);
      window.vtSkin = skin;

      // Function to suppress any default controller or buttons from skin to keep our clean luxury pill
      function suppressSkinElements() {
        try {
          if (skin._controller) {
            skin._controller.style.display = 'none';
            skin._controller.style.visibility = 'hidden';
            skin._controller.style.pointerEvents = 'none';
          }
          if (skin._controller_bg) skin._controller_bg.style.display = 'none';
          if (skin._fullscreen) skin._fullscreen.style.display = 'none';
          if (skin._enter_vr) skin._enter_vr.style.display = 'none';
          if (skin._autorotate_buttons) skin._autorotate_buttons.style.display = 'none';
          if (skin._projection_buttons) skin._projection_buttons.style.display = 'none';
          var controls = document.querySelectorAll('.ggskin[id*="controller"], .ggskin_container[id="controller"], .ggskin[id*="fullscreen"]');
          controls.forEach(function (c) {
            c.style.display = 'none';
            c.style.pointerEvents = 'none';
          });
        } catch (e) {}
      }
      suppressSkinElements();
      setInterval(suppressSkinElements, 400);

      var revealed = false;
      function onTourLoaded() {
        if (revealed) return;
        revealed = true;
        var loadingEl = document.getElementById('tourLoading');
        if (loadingEl) loadingEl.style.display = 'none';
        var overlay = document.getElementById('tourOverlay');
        if (overlay) overlay.style.display = 'flex';
        suppressSkinElements();
        setupPano2VRBottomBar(dest, pano, skin);
        console.log('[destination.js] Pano2VR tour ready — direct embed, no iframe.');
        checkXrCapability();
      }

      pano.addListener('changenode', function () {
        onTourLoaded();
        suppressSkinElements();
      });
      pano.addListener('imagesloaded', function () {
        onTourLoaded();
        suppressSkinElements();
      });

      // Load config XML
      pano.readConfigUrlAsync(basePath + 'pano.xml');

      // Safety timeout: reveal overlay after 3 seconds
      setTimeout(onTourLoaded, 3000);

    } catch (err) {
      console.error('[destination.js] Pano2VR player error:', err);
      showError('Unable to start 360° tour.');
    }
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
    // Prioritize destinations in the same state (e.g. Tamil Nadu heritage sites)
    var sameState = DESTINATIONS.filter(function (d) {
      return d.id !== currentDest.id && d.state === currentDest.state;
    });
    var others = DESTINATIONS.filter(function (d) {
      return d.id !== currentDest.id && d.state !== currentDest.state;
    });
    var nearby = sameState.concat(others).slice(0, 3);

    grid.innerHTML = nearby.map(function (d) { return renderDestinationCard(d); }).join('');

    // Force-reveal all dynamically injected destination cards immediately
    grid.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('revealed');
    });
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

    // Mute — Pano2VR and KRPano unified call
    var muteBtn = document.getElementById('tourMuteBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        _isMuted = !_isMuted;
        updateMuteUI(_isMuted);

        // 1. Pano2VR audio control
        if (window.vtPano2vr) {
          try {
            if (_isMuted) {
              if (typeof window.vtPano2vr.pauseSound === 'function') window.vtPano2vr.pauseSound('_background');
              if (typeof window.vtPano2vr.stopSound === 'function') window.vtPano2vr.stopSound('_background');
            } else {
              if (typeof window.vtPano2vr.activateSound === 'function') window.vtPano2vr.activateSound();
              if (typeof window.vtPano2vr.playSound === 'function') window.vtPano2vr.playSound('_background');
            }
          } catch (e) {}
          // Also mute/unmute any audio tag
          var audioEls = document.querySelectorAll('#tourViewer audio, #pano audio');
          audioEls.forEach(function (a) {
            a.muted = _isMuted;
            if (_isMuted) a.pause();
            else a.play().catch(function () {});
          });
        }

        // 2. KRPano audio control
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

    // VR — Unified Toggle (Enter / Exit)
    var vrBtn = document.getElementById('tourVrBtn');
    if (vrBtn) {
      vrBtn.addEventListener('click', function () {
        toggleVRMode();
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
        if (window.vtPano2vr && !_isMuted) {
          try {
            if (typeof window.vtPano2vr.activateSound === 'function') window.vtPano2vr.activateSound();
          } catch (e) {}
        }
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

  // ─── Unified VR Mode Controller ───────────────────────────────────────────
  window._isVrActive = false;

  function toggleVRMode() {
    var pano = window.vtPano2vr;
    var api = window.vtKrpano;
    var inVR = window._isVrActive;

    if (pano && typeof pano.isInVR === 'function') {
      try { inVR = inVR || pano.isInVR(); } catch (e) {}
    }
    if (api && typeof api.get === 'function') {
      try { inVR = inVR || Boolean(api.get('webvr.isinvr')); } catch (e) {}
    }

    if (inVR) {
      exitVRMode();
    } else {
      enterVRMode();
    }
  }

  function enterVRMode() {
    window._isVrActive = true;
    var topVrBtn = document.getElementById('tourVrBtn');
    if (topVrBtn) topVrBtn.classList.add('active');
    var btmVrBtn = document.getElementById('vtBtnVR');
    if (btmVrBtn) btmVrBtn.classList.add('active');

    // Create floating "Exit VR Mode" pill at top center
    var viewer = document.getElementById('tourViewer');
    if (viewer && !document.getElementById('vtExitVrFloatingBtn')) {
      var exitBtn = document.createElement('button');
      exitBtn.id = 'vtExitVrFloatingBtn';
      exitBtn.className = 'vt-exit-vr-btn';
      exitBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Exit VR Mode
      `;
      exitBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        exitVRMode();
      });
      viewer.appendChild(exitBtn);
    }

    // Pano2VR enter
    if (window.vtPano2vr && typeof window.vtPano2vr.enterVR === 'function') {
      try { window.vtPano2vr.enterVR(); } catch (e) {}
    }

    // KRPano enter
    var api = window.vtKrpano;
    if (api && typeof api.call === 'function') {
      try { api.call('if(plugin[webvr], webvr.enterVR(););'); } catch (e) {}
    }

    if (viewer && viewer.requestFullscreen && !document.fullscreenElement) {
      viewer.requestFullscreen().catch(function () {});
    }
  }

  function exitVRMode() {
    window._isVrActive = false;
    var topVrBtn = document.getElementById('tourVrBtn');
    if (topVrBtn) topVrBtn.classList.remove('active');
    var btmVrBtn = document.getElementById('vtBtnVR');
    if (btmVrBtn) btmVrBtn.classList.remove('active');

    var exitBtn = document.getElementById('vtExitVrFloatingBtn');
    if (exitBtn) exitBtn.remove();

    // Pano2VR exit
    if (window.vtPano2vr) {
      try {
        if (typeof window.vtPano2vr.exitVR === 'function') {
          window.vtPano2vr.exitVR();
        }
      } catch (e) {}

      // Direct fallback call to Gj if attached
      try {
        if (typeof window.vtPano2vr.Gj === 'function') {
          window.vtPano2vr.Gj();
        }
      } catch (e) {}

      // Ensure canvas visibility is 100% restored
      var canvases = document.querySelectorAll('#pano canvas');
      canvases.forEach(function (c) {
        if (c.style.display === 'none') c.style.display = 'inline';
      });
    }

    // KRPano exit
    var api = window.vtKrpano;
    if (api && typeof api.call === 'function') {
      try { api.call('webvr.exitVR();'); } catch (e) {}
    }
  }

  // Keyboard Escape key exits VR mode immediately
  window.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && window._isVrActive) {
      exitVRMode();
    }
  });

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
