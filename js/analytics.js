// ─── Virtual Tourism – GA4 Analytics ──────────────────────────────────────

(function initVirtualTourismAnalytics() {
  const MEASUREMENT_ID = 'G-R366EFN3TQ';

  if (!MEASUREMENT_ID || window.__VT_ANALYTICS_INITIALIZED__) return;
  window.__VT_ANALYTICS_INITIALIZED__ = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(gaScript);

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true
  });

  function sanitizeEventParams(params) {
    const cleaned = {};
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        cleaned[key] = value.join('|');
        return;
      }
      cleaned[key] = value;
    });
    return cleaned;
  }

  window.vtTrackEvent = function vtTrackEvent(eventName, eventParams) {
    if (!eventName || typeof window.gtag !== 'function') return;
    var params = sanitizeEventParams(eventParams);
    window.gtag('event', eventName, params);
  };

  function setupScrollDepthTracking() {
    let sent = false;

    const onScroll = () => {
      if (sent) return;

      const doc = document.documentElement;
      const totalHeight = Math.max(doc.scrollHeight, doc.offsetHeight, 1);
      const viewedHeight = window.scrollY + window.innerHeight;

      if (viewedHeight / totalHeight >= 0.9) {
        sent = true;
        window.vtTrackEvent('scroll_90', {
          page_path: window.location.pathname,
          page_title: document.title
        });
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
  }

  function setupClickTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch (e) {
        return;
      }

      const linkText = (link.textContent || '').trim().slice(0, 100);
      const isDestinationClick = /\/virtual-tour\/([^/?#]+)/i.test(url.pathname);

      if (isDestinationClick) {
        const slugMatch = url.pathname.match(/\/virtual-tour\/([^/?#]+)/i);
        const destinationSlug = slugMatch ? slugMatch[1] : undefined;
        
        window.vtTrackEvent('tour_click', {
          destination_slug: destinationSlug,
          link_text: linkText,
          source_path: window.location.pathname
        });
      }

      const isExternal = url.origin !== window.location.origin;
      if (!isExternal) return;

      const outboundParams = {
        outbound_domain: url.hostname,
        outbound_url: url.href,
        link_text: linkText
      };

      window.vtTrackEvent('outbound_click', outboundParams);

      const rel = (link.getAttribute('rel') || '').toLowerCase();
      const isAffiliate = link.dataset.affiliate === 'true' ||
        rel.includes('sponsored') ||
        /([?&](aff|affiliate|ref|partner)=)/i.test(url.search);

      if (isAffiliate) {
        window.vtTrackEvent('affiliate_click', outboundParams);
      }
    }, true);
  }

  setupScrollDepthTracking();
  setupClickTracking();
})();
