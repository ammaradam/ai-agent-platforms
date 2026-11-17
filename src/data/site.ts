// Site-wide settings for growth features.

// Buttondown username for the newsletter form (https://buttondown.com/<username>).
export const BUTTONDOWN_USERNAME = 'ammaradam';

// Post pinned at the top of the home page. Pick the one that best shows how you think,
// or the one that is reading best in Vercel Analytics right now.
export const PINNED_POST = 'what-to-trace-for-agents';

/** Add UTM tags to a URL so Vercel Analytics can tell where a visit came from. */
export function withUtm(url: string, source: string, medium = 'social', campaign = 'share') {
  const u = new URL(url);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', campaign);
  return u.href;
}
