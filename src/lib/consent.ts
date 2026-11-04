/** IAB TCF purposes: 1 store/access information on the device, 7 measure advertising performance */
const PURPOSES = [1, 7];

type TCData = {
  eventStatus?: string;
  gdprApplies?: boolean;
  purpose?: { consents?: Record<string, boolean> };
};

/**
 * Runs `fn` once, after the consent choice: straight away on a site without
 * CMP or outside the GDPR, when a stored choice loads (`tcloaded`) or when the
 * visitor answers the banner (`useractioncomplete`). `null` without CMP data.
 */
export const afterChoice = (fn: (data: TCData | null) => void) => {
  const tcfapi = window.__tcfapi;
  if (typeof tcfapi !== 'function') {
    fn(null);
    return;
  }
  let done = false;
  tcfapi('addEventListener', 2, (data: TCData | null, success: boolean) => {
    if (done || !success || !data) return;
    if (
      data.gdprApplies !== false &&
      data.eventStatus !== 'tcloaded' &&
      data.eventStatus !== 'useractioncomplete'
    )
      return;
    done = true;
    fn(data);
  });
};

/**
 * Runs `fn` once the visitor has consented to the TCF purposes (any TCF v2
 * CMP: InMobi, Didomi, Google…), or straight away on a site without CMP or
 * outside the GDPR. Waits for the choice when the banner is still open; never
 * runs on a refusal.
 */
export const withConsent = (fn: () => void, purposes = PURPOSES) =>
  afterChoice((data) => {
    if (!data || data.gdprApplies === false) fn();
    else if (purposes.every((p) => data.purpose?.consents?.[p])) fn();
  });

/**
 * Runs `fn` once the consent layer is up (its banner shown, or a stored choice
 * loaded): a TCF v2 CMP whose stub (`__tcfapi`) is in app.html, or Google's
 * CMP (AdSense « Privacy & messaging », served by adsbygoogle.js), so the tags
 * run after it rather than delaying its banner, the LCP of a first visit on a
 * slow connection. Straight away on a site without either, after `fallbackMs`
 * when the CMP never answers.
 */
export const whenCmpReady = (fn: () => void, fallbackMs = 5000) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  const listen = (): void => {
    if (done) return;
    // Google's CMP: its __tcfapi once loaded
    if (typeof window.__tcfapi !== 'function') {
      setTimeout(listen, 50);
      return;
    }
    window.__tcfapi('addEventListener', 2, (data: TCData | null, success: boolean) => {
      if (!success || !data) return;
      if (
        data.gdprApplies === false ||
        data.eventStatus === 'cmpuishown' ||
        data.eventStatus === 'tcloaded' ||
        data.eventStatus === 'useractioncomplete'
      )
        run();
      // a listener added once the banner is up gets no `cmpuishown`: the ping tells
      else
        window.__tcfapi('ping', 2, (ping: { displayStatus?: string } | null) => {
          if (ping?.displayStatus === 'visible') run();
        });
    });
  };
  if (typeof window.__tcfapi === 'function') listen();
  else if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    const fc = (window.googlefc = window.googlefc || {});
    fc.callbackQueue = fc.callbackQueue || [];
    // a visitor it asks nothing: its consent data straight away
    fc.callbackQueue.push({ CONSENT_DATA_READY: run });
    listen();
  } else {
    run();
    return;
  }
  setTimeout(run, fallbackMs);
};
