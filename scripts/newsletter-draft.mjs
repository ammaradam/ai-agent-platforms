#!/usr/bin/env node
// Create a Buttondown draft email for each new post. Uses the free Buttondown API, not the
// paid RSS-to-email feature. Drafts are never sent automatically: review and send them in Buttondown.
//   BUTTONDOWN_API_KEY=... node scripts/newsletter-draft.mjs src/content/posts/<slug>.md [...]
//   node scripts/newsletter-draft.mjs --dry-run src/content/posts/<slug>.md   (prints, sends nothing)
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const SITE = 'https://www.ammaradam.dev';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const files = args.filter(a => a !== '--dry-run');
const key = process.env.BUTTONDOWN_API_KEY;
if (!files.length) { console.log('No new posts.'); process.exit(0); }
if (!dryRun && !key) { console.error('BUTTONDOWN_API_KEY is not set.'); process.exit(1); }

// Read a top-level frontmatter field written as a single line: key: "value", key: 'value' or key: value
function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  if (!m) return undefined;
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

let failed = 0;
for (const file of files) {
  const slug = basename(file).replace(/\.md$/, '');
  const fm = (readFileSync(file, 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/) || [])[1];
  if (!fm) { console.error(`${slug}: no frontmatter, skipped`); continue; }
  if (field(fm, 'draft') === 'true') { console.log(`${slug}: marked draft, skipped`); continue; }
  const title = field(fm, 'title'), insight = field(fm, 'insight') ?? '';
  const url = `${SITE}/posts/${slug}`;
  const tagged = `${url}?utm_source=newsletter&utm_medium=email&utm_campaign=${slug}`;
  const image = `${SITE}/posts/${slug}.jpg`;
  const body = [
    `**AFTER THE DEMO** · Running AI in production`,
    '',
    `[![${title}](${image})](${tagged})`,
    '',
    insight,
    '',
    `**[Read the full note →](${tagged})**`,
    '',
    `Diagrams, sources and limitations are all in the note. Questions or pushback? Reply to this email.`,
    '',
    `Ammar`,
  ].join('\n');
  const email = { subject: title, body, status: 'draft', description: insight, canonical_url: url, image };

  if (dryRun) { console.log(JSON.stringify(email, null, 2)); continue; }
  const res = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });
  if (res.ok) console.log(`${slug}: draft created in Buttondown`);
  else { failed++; console.error(`${slug}: Buttondown returned ${res.status}: ${await res.text()}`); }
}
process.exit(failed ? 1 : 0);
