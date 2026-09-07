// ─── Virtual Tourism — Shared KRPano Player Module ───────────────────────────
// Version: 20260508
//
// Two usage modes:
//
// MODE A — Direct-embed (new, preferred): destination.js loads this file and calls
//   VTPlayer.bindAudio({ tid, xmlVersion, soundVersion, validLanguages });
//   then calls embedpano() itself and passes the krpanoApi to:
//   VTPlayer.onKrpanoReady(krpanoApi);
//
// MODE B — Iframe (legacy, still supported): each tour's index.html calls
//   VTPlayer.init({ destination, validLanguages, xmlVersion, soundVersion });
//
// Window-global exports (called by KRPano XML actions):
//   vtPlaySceneVoice(voiceId, language, muted)
//   vtPlaySceneVoiceFromKrpano()
//   vtStopSceneVoice()
//   vtPauseSceneVoice()
//   vtResumeSceneVoice()
// ─────────────────────────────────────────────────────────────────────────────

(function (window, document) {

	// ── Language code → audio folder name ──────────────────────────────────────
	var LANG_FOLDERS = {
		EN: 'english',
		HI: 'hindi',
		TA: 'tamil',
		KN: 'kannada'
	};

	// ── TID (internal destination id) → SEO slug map ─────────────────────────
	// Mirrors SLUG_TO_TID in server.js. Update both when adding destinations.
	var TID_TO_SLUG = {
		'amber':                     'amber-fort-jaipur',
		'madurai':                   'meenakshi-amman-temple-madurai',
		'hampi':                     'vijaya-vitthala-temple-hampi',
		'mysore':                    'mysore-palace-mysore',
		'nayakkar':                  'thirumalai-nayakkar-mahal-madurai',
		'ajanta':                    'ajanta-caves-aurangabad',
		'ellora':                    'ellora-caves-aurangabad',
		'shore':                     'shore-temple-mahabalipuram',
		'rathas':                    'five-rathas-mahabalipuram',
		'hill-lock':                 'hill-lock-monuments-mahabalipuram',
		'brihadeeswara-thanjavur':   'brihadeeswara-temple-thanjavur',
		'airavatesvara':             'airavatesvara-temple-darasuram',
		'brihadeeswara-gangaikonda': 'brihadeeswara-temple-gangaikonda-cholapuram',
		'jantar':                    'jantar-mantar-jaipur',
		'nataraja':                  'nataraja-temple-chidambaram'
	};

	// ── Tour config — set by VTPlayer.init() ──────────────────────────────────
	var _cfg = null;

	// ══════════════════════════════════════════════════════════════════════════
	// GLOBAL STATE
	// (window-level so parent page postMessage and KRPano XML can reach them)
	// ══════════════════════════════════════════════════════════════════════════

	window.vtKrpano          = null;
	window.vtPendingEnterVr  = false;
	window.vtPendingExitVr   = false;
	window.vtPendingLanguage = 'EN';
	window.vtPendingMute     = false;
	window.vtWasInVr         = false;
	window.vtVrWatchInterval = null;

	window.vtNarrationAudio         = window.vtNarrationAudio || new Audio();
	window.vtNarrationAudio.preload = 'auto';
	window.vtNarrationToken         = 0;
	window.vtPendingAudioPlay       = false;

	// ══════════════════════════════════════════════════════════════════════════
	// KRPano API HELPERS
	// ══════════════════════════════════════════════════════════════════════════

	function getKrpanoApi() {
		return window.vtKrpano || window.krpano;
	}

	function tryEnterVrMode() {
		try {
			var api = getKrpanoApi();
			if (api && typeof api.call === 'function') {
				api.call('if(plugin[webvr], webvr.enterVR(););');
				return true;
			}
		} catch (e) { console.error('[vt-player] Unable to enter VR mode:', e); }
		return false;
	}

	function tryExitVrMode() {
		try {
			var api = getKrpanoApi();
			if (api && typeof api.call === 'function') {
				api.call('if(plugin[webvr], webvr.exitVR(););');
				if (window.parent) {
					window.parent.postMessage({ type: 'VT_REQUEST_EXIT_FULLSCREEN' }, window.location.origin);
				}
				return true;
			}
		} catch (e) { console.error('[vt-player] Unable to exit VR mode:', e); }
		return false;
	}

	function notifyParentExitFullscreen() {
		if (window.parent) {
			window.parent.postMessage({ type: 'VT_REQUEST_EXIT_FULLSCREEN' }, window.location.origin);
		}
	}

	function bindVrExitCallback(api) {
		try {
			if (api && typeof api.set === 'function') {
				api.set(
					'events.onexitvr',
					"js(window.parent && window.parent.postMessage({type:'VT_REQUEST_EXIT_FULLSCREEN'}, window.location.origin));"
				);
			}
		} catch (e) { console.error('[vt-player] Unable to bind onexitvr callback:', e); }
	}

	function startVrStateWatcher() {
		if (window.vtVrWatchInterval) clearInterval(window.vtVrWatchInterval);
		window.vtVrWatchInterval = setInterval(function () {
			try {
				var api = getKrpanoApi();
				if (!api || typeof api.get !== 'function') return;
				var inVr = !!api.get('webvr.isenabled');
				if (window.vtWasInVr && !inVr) notifyParentExitFullscreen();
				window.vtWasInVr = inVr;
			} catch (e) { /* ignore */ }
		}, 300);
	}

	// ══════════════════════════════════════════════════════════════════════════
	// LANGUAGE NORMALISATION
	// ══════════════════════════════════════════════════════════════════════════

	function normalizeLang(language) {
		var lang       = (language || 'EN').toString().toUpperCase();
		var validLangs = _cfg ? (_cfg.validLanguages || ['EN']) : ['EN'];
		if (validLangs.indexOf(lang) === -1) lang = 'EN';
		return lang;
	}

	// ══════════════════════════════════════════════════════════════════════════
	// AUDIO — PLAYBACK HELPERS
	// ══════════════════════════════════════════════════════════════════════════

	function vtAttemptAudioPlay() {
		try {
			var audio = window.vtNarrationAudio;
			if (!audio || !audio.src) return;
			var playPromise = audio.play();
			if (playPromise && typeof playPromise.then === 'function') {
				playPromise
					.then(function ()  { window.vtPendingAudioPlay = false; })
					.catch(function () { window.vtPendingAudioPlay = true;  });
			} else {
				window.vtPendingAudioPlay = false;
			}
		} catch (e) { window.vtPendingAudioPlay = true; }
	}

	function vtStopSceneVoice() {
		try {
			window.vtNarrationToken  += 1;
			window.vtPendingAudioPlay = false;
			var audio = window.vtNarrationAudio;
			audio.pause();
			audio.removeAttribute('src');
			audio.load();
		} catch (e) { /* ignore */ }
	}

	function vtPauseSceneVoice() {
		try {
			window.vtPendingAudioPlay = false;
			if (window.vtNarrationAudio) {
				window.vtNarrationAudio.pause();
			}
		} catch (e) { /* ignore */ }
	}

	// ══════════════════════════════════════════════════════════════════════════
	// AUDIO — VOICE CANDIDATE BUILDER
	//
	// Fallback chain (reproduced exactly from all 3 originals):
	//   1. Requested language folder (if not EN)
	//   2. Hindi folder — only when: requesting non-HI, non-EN AND HI is valid
	//   3. English — always
	//
	// Examples (matches originals byte-for-byte):
	//   Mysore, KN:   kannada → hindi → english   ✓
	//   Mysore, HI:   hindi → english              ✓
	//   Madurai, TA:  tamil → hindi → english      ✓
	//   Madurai, HI:  hindi → english              ✓
	//   Ajanta, HI:   hindi → english              ✓
	//   Any, EN:      english                      ✓
	// ══════════════════════════════════════════════════════════════════════════

	function vtPadVoiceId(voiceId) {
		var id = (voiceId || '').toString().trim();
		if (/^[0-9]$/.test(id)) return '0' + id;
		return id;
	}

	function vtBuildVoiceCandidates(voiceId, language) {
		var id         = (voiceId || '').toString().trim();
		var idPad      = vtPadVoiceId(id);
		var v          = _cfg && _cfg.soundVersion ? ('?v=' + _cfg.soundVersion) : '';
		var lang       = normalizeLang(language);
		var validLangs = _cfg ? (_cfg.validLanguages || ['EN']) : ['EN'];
		var candidates = [];

		// Build absolute base path so audio works from any page context.
		// Direct-embed: page is /virtual-tour/{slug} — relative 'sound/' breaks.
		// Absolute path: /tours/{slug}/sound/ — always correct.
		var tid = (_cfg && _cfg.tid) || '';
		if (!tid) {
			var slug = (_cfg && _cfg.slug) || '';
			if (!slug) {
				var m = window.location.pathname.match(/\/tours\/([^/]+)/);
				slug = m ? m[1] : '';
			}
			for (var key in TID_TO_SLUG) {
				if (TID_TO_SLUG[key] === slug) {
					tid = key; break;
				}
			}
		}
		var base = slug ? ('/tours/' + slug + '/sound') : 'sound';

		// 1. Requested language (if not English)
		if (lang !== 'EN' && LANG_FOLDERS[lang]) {
			var folder = LANG_FOLDERS[lang];
			candidates.push(base + '/' + folder + '/' + id    + '.mp3' + v);
			candidates.push(base + '/' + folder + '/' + idPad + '.mp3' + v);
		}

		// 2. Hindi as intermediate fallback
		if (lang !== 'HI' && lang !== 'EN' && validLangs.indexOf('HI') !== -1) {
			candidates.push(base + '/hindi/' + id    + '.mp3' + v);
			candidates.push(base + '/hindi/' + idPad + '.mp3' + v);
		}

		// 3. English always last
		candidates.push(base + '/english/' + id    + '.mp3' + v);
		candidates.push(base + '/english/' + idPad + '.mp3' + v);

		return candidates;
	}

	// ══════════════════════════════════════════════════════════════════════════
	// AUDIO — SCENE VOICE PLAYBACK
	// ══════════════════════════════════════════════════════════════════════════

	function vtPlaySceneVoice(voiceId, language, muted) {
		var id      = (voiceId || '').toString().trim();
		var isMuted = muted === true || muted === 'true' || muted === '1';
		if (!id || isMuted) { vtStopSceneVoice(); return; }

		var audio      = window.vtNarrationAudio;
		var token      = ++window.vtNarrationToken;
		var candidates = vtBuildVoiceCandidates(id, language);

		function tryCandidate(index) {
			if (token !== window.vtNarrationToken) return;
			if (index >= candidates.length) { vtStopSceneVoice(); return; }
			var url = candidates[index];

			function cleanup() {
				audio.removeEventListener('canplay', onCanPlay);
				audio.removeEventListener('error',   onError);
			}
			function onCanPlay() {
				cleanup();
				if (token !== window.vtNarrationToken) return;
				vtAttemptAudioPlay();
			}
			function onError() {
				cleanup();
				if (token !== window.vtNarrationToken) return;
				tryCandidate(index + 1);
			}

			audio.pause();
			audio.currentTime = 0;
			audio.addEventListener('canplay', onCanPlay);
			audio.addEventListener('error',   onError);
			audio.src = url;
			audio.load();
		}
		tryCandidate(0);
	}

	function vtPlaySceneVoiceFromKrpano() {
		try {
			var api = getKrpanoApi();
			if (!api || typeof api.get !== 'function') return;
			vtPlaySceneVoice(
				api.get('tour_voice_id'),
				api.get('tour_lang'),
				api.get('tour_muted')
			);
		} catch (e) { console.error('[vt-player] Unable to play scene voice from krpano state:', e); }
	}

	// Resume re-reads voice state from KRPano and restarts narration for the
	// current scene — correct behaviour for a scene-based panorama tour.
	function vtResumeSceneVoice() {
		vtPlaySceneVoiceFromKrpano();
	}

	// ── Audio unlock: retry pending play on first user gesture ────────────────
	function vtBindAudioUnlock() {
		function unlockAudio() {
			if (window.vtPendingAudioPlay) vtAttemptAudioPlay();
		}
		document.addEventListener('pointerdown', unlockAudio, { passive: true });
		document.addEventListener('touchend',    unlockAudio, { passive: true });
		document.addEventListener('click',       unlockAudio, { passive: true });
		document.addEventListener('keydown',     unlockAudio);
	}

	// ══════════════════════════════════════════════════════════════════════════
	// KRPano LANGUAGE / MUTE BRIDGE
	// ══════════════════════════════════════════════════════════════════════════

	function trySetLanguage(language) {
		try {
			var api = getKrpanoApi();
			if (api && typeof api.call === 'function') {
				api.call("set_tour_language('" + normalizeLang(language) + "');");
				return true;
			}
		} catch (e) { console.error('[vt-player] Unable to set tour language:', e); }
		return false;
	}

	function trySetMute(muted) {
		try {
			var api = getKrpanoApi();
			if (api && typeof api.call === 'function') {
				api.call('set_tour_mute(' + (muted ? 'true' : 'false') + ');');
				return true;
			}
		} catch (e) { console.error('[vt-player] Unable to set tour mute:', e); }
		return false;
	}

	// ══════════════════════════════════════════════════════════════════════════
	// UI HELPERS — loading overlay & error overlay
	// ══════════════════════════════════════════════════════════════════════════

	function showSecureError(title, message) {
		var loading = document.getElementById('vtSecureLoading');
		var overlay = document.getElementById('vtErrorOverlay');
		if (loading) loading.classList.add('hidden');
		if (overlay) {
			document.getElementById('vtErrorTitle').textContent = title   || 'Access Denied';
			document.getElementById('vtErrorMsg').textContent   = message || 'Unable to load this virtual tour.';
			overlay.classList.add('active');
		}
	}

	function updateSecureStatus(msg) {
		var el = document.getElementById('vtSecureStatus');
		if (el) el.textContent = msg;
	}

	// ══════════════════════════════════════════════════════════════════════════
	// SECURE TOUR INITIALISATION
	// ══════════════════════════════════════════════════════════════════════════

	async function initSecureTour() {
		var params      = new URLSearchParams(window.location.search);
		var destination = params.get('destination') || (_cfg && _cfg.destination) || 'unknown';

		// Slug resolution priority:
		// 1. Explicit slug in VTPlayer.init() config
		// 2. ?slug= URL query parameter
		// 3. Reverse lookup: TID (destination) → slug via TID_TO_SLUG map
		// 4. Fall back to destination value itself (for slugs passed as destination)
		var tid = (_cfg && _cfg.tid) || destination || '';
		var slug = (_cfg && _cfg.slug) || params.get('slug') || '';
		
		if (!tid && slug) {
			for (var key in TID_TO_SLUG) {
				if (TID_TO_SLUG[key] === slug) { tid = key; break; }
			}
		}

		var xmlPath = '/tours/' + slug + '/tour.xml';
		// Use a relative URL so the browser automatically sends CloudFront signed
		// cookies with the request. cdn.virtualtourism.in is not a separate domain.
		var xmlUrl = xmlPath + '?v=' + ((_cfg && _cfg.xmlVersion) || Date.now());

		try {
			updateSecureStatus('Authenticating access...');

			console.log('[vt-player] Step 1: Auth for slug=' + slug);
			var resp = await fetch('/api/tour-access', {
				method:      'POST',
				headers:     { 'Content-Type': 'application/json' },
				body:        JSON.stringify({ slug: slug }),
				credentials: 'include'
			});

			if (!resp.ok) {
				throw new Error('Auth failed (' + resp.status + ')');
			}

			console.log('[vt-player] Step 2: Cookie settle delay');
			// Cookies are set by the parent page before the iframe loads.
			// A short yield is enough for the cookie jar to flush before CDN requests.
			await new Promise(function(r) { setTimeout(r, 100); });

			console.log("Step 3: Load XML");

			embedpano({
				target:              'pano',
				xml:                 xmlUrl,
				html5:               'only',
				passQueryParameters: 'startscene,startlookat',
				cors:                'use-credentials',
				consolelog:          true,
				onready: function (krpanoApi) {
					window.vtKrpano = krpanoApi;
					bindVrExitCallback(krpanoApi);
					startVrStateWatcher();

					if (window.vtPendingExitVr)  { window.vtPendingExitVr  = false; tryExitVrMode();  }
					if (window.vtPendingEnterVr) { window.vtPendingEnterVr = false; tryEnterVrMode(); }
					trySetLanguage(window.vtPendingLanguage);
					trySetMute(window.vtPendingMute);

					var loadingEl = document.getElementById('vtSecureLoading');
					if (loadingEl) loadingEl.classList.add('hidden');

					console.log('[vt-player] KRpano viewer ready for ' + destination);

					if (window.parent) {
						window.parent.postMessage({ type: 'VT_TOUR_READY' }, window.location.origin);
					}
				}
			});

		} catch (error) {
			console.error('[vt-player] Initialization failed:', error);
			showSecureError('Tour Unavailable', error.message || 'Failed to load the virtual tour.');
		}
	}

	// ══════════════════════════════════════════════════════════════════════════
	// PARENT PAGE MESSAGE HANDLER
	// Handles commands sent from the parent page (destination.html) via postMessage
	// ══════════════════════════════════════════════════════════════════════════

	function setupMessageHandler() {
		window.addEventListener('message', function (event) {
			if (event.origin !== window.location.origin) return;
			var data = event && event.data ? event.data : null;
			if (!data || !data.type) return;

			if (data.type === 'VT_ENTER_VR') {
				if (!tryEnterVrMode()) { window.vtPendingEnterVr = true; window.vtPendingExitVr = false; }
				return;
			}
			if (data.type === 'VT_EXIT_VR') {
				if (!tryExitVrMode()) { window.vtPendingExitVr = true; window.vtPendingEnterVr = false; }
				return;
			}
			if (data.type === 'VT_SET_LANGUAGE') {
				window.vtPendingLanguage = normalizeLang(data.language);
				trySetLanguage(window.vtPendingLanguage);
				return;
			}
			if (data.type === 'VT_SET_MUTE') {
				window.vtPendingMute = !!data.muted;
				trySetMute(window.vtPendingMute);
				return;
			}
			if (data.type === 'VT_USER_GESTURE') {
				vtAttemptAudioPlay();
			}
		});
	}

	// ══════════════════════════════════════════════════════════════════════════
	// WINDOW-LEVEL EXPORTS
	// KRPano XML actions call these directly via js(...) — must be on window.
	// ══════════════════════════════════════════════════════════════════════════

	window.vtPlaySceneVoice         = vtPlaySceneVoice;
	window.vtPlaySceneVoiceFromKrpano = vtPlaySceneVoiceFromKrpano;
	window.vtStopSceneVoice         = vtStopSceneVoice;
	window.vtPauseSceneVoice        = vtPauseSceneVoice;
	window.vtResumeSceneVoice       = vtResumeSceneVoice;

	// ══════════════════════════════════════════════════════════════════════════
	// PUBLIC API
	// ══════════════════════════════════════════════════════════════════════════

	window.VTPlayer = {

		// ── MODE B (iframe/legacy): full auth + embedpano boot ────────────────
		init: function (config) {
			_cfg = config || {};
			window.vtPendingLanguage = normalizeLang(_cfg.defaultLanguage || 'EN');
			vtBindAudioUnlock();
			setupMessageHandler();
			initSecureTour();
		},

		// ── MODE A (direct-embed): set config + arm audio, no auth/embedpano ──
		//
		// Call this BEFORE embedpano(). It sets _cfg so vtPlaySceneVoice(),
		// normalizeLang() etc. use the correct validLanguages / soundVersion.
		//
		// @param {Object} config  — same shape as init() config
		bindAudio: function (config) {
			_cfg = config || {};
			window.vtPendingLanguage = normalizeLang(_cfg.defaultLanguage || 'EN');
			vtBindAudioUnlock();
			// No auth, no embedpano — destination.js owns those.
		},

		// ── Called by destination.js once KRPano onready fires ─────────────────
		//
		// Wires VR exit callbacks and starts the VR state watcher.
		// @param {Object} krpanoApi  — the KRPano API object from embedpano onready
		onKrpanoReady: function (krpanoApi) {
			window.vtKrpano = krpanoApi;
			bindVrExitCallback(krpanoApi);
			startVrStateWatcher();
			if (window.vtPendingExitVr)  { window.vtPendingExitVr  = false; tryExitVrMode();  }
			if (window.vtPendingEnterVr) { window.vtPendingEnterVr = false; tryEnterVrMode(); }
		}
	};

}(window, document));
