#!/usr/bin/env node
// Print a UTM-tagged link to a post, ready to paste into LinkedIn, Reddit, a newsletter, etc.
//   node scripts/utm.mjs <post-slug> [source=linkedin] [medium=social] [campaign=<post-slug>]
//   node scripts/utm.mjs testing-agents-in-manglish reddit community
// Then filter by utm_source / utm_campaign in Vercel Analytics.
const [slug, source = 'linkedin', medium = 'social', campaign = slug] = process.argv.slice(2);
if (!slug) { console.error('Usage: node scripts/utm.mjs <post-slug> [source] [medium] [campaign]'); process.exit(1); }
const u = new URL(slug === '/' ? '/' : `/posts/${slug}`, 'https://www.ammaradam.dev');
Object.entries({ utm_source: source, utm_medium: medium, utm_campaign: campaign }).forEach(([k, v]) => u.searchParams.set(k, v));
console.log(u.href);
