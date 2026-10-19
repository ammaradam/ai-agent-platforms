import { minutesOf, type Post } from './posts';
import type { ThemeKey } from '@/data/themes';

/** Where a note sits on an agent request's path, left to right. */
export const LANES = [
  { key: 'developer', name: 'Developer' },
  { key: 'platform', name: 'Platform' },
  { key: 'identity', name: 'Identity' },
  { key: 'tool', name: 'Tool call' },
  { key: 'observability', name: 'Observability' },
] as const;
export type LaneKey = (typeof LANES)[number]['key'];

// A note without a `lane` in its frontmatter falls into the lane of its first topic.
const FROM_THEME: Record<ThemeKey, LaneKey> = {
  'developer-experience': 'developer',
  'ai-platform-engineering': 'platform',
  'identity-security': 'identity',
  'ai-agents': 'tool',
  reliability: 'tool',
  observability: 'observability',
};

export type GraphNode = { id: string; title: string; label: string; insight: string; theme: ThemeKey; lane: LaneKey; x: number; y: number; big: boolean };
export type GraphEdge = { a: string; b: string; mutual: boolean };

/** Layout constants, in SVG units. */
export const MAP = { laneGap: 200, left: 100, top: 96, rowGap: 78, width: 1000 };

/**
 * Notes as a graph: one node per note, placed in its lane and stacked by date (oldest at the top),
 * and one edge per pair of notes that list each other in `related`. Worked out at build time,
 * so everyone sees the same map.
 */
export function noteGraph(posts: Post[]) {
  const byLane = new Map<LaneKey, Post[]>(LANES.map(l => [l.key, []]));
  for (const p of posts) byLane.get(p.data.lane ?? FROM_THEME[p.data.themes[0]])!.push(p);

  // Order each lane so linked notes sit at similar heights (a few barycentre passes), which keeps
  // lines short and crossings few. Start from date order so ties stay stable.
  const links = new Map<string, Set<string>>(posts.map(p => [p.id, new Set<string>()]));
  for (const p of posts) for (const r of p.data.related ?? []) if (links.has(r) && r !== p.id) { links.get(p.id)!.add(r); links.get(r)!.add(p.id); }
  for (const l of LANES) byLane.get(l.key)!.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const row = new Map<string, number>();
  const index = () => LANES.forEach(l => byLane.get(l.key)!.forEach((p, j) => row.set(p.id, j)));
  index();
  for (let pass = 0; pass < 6; pass++) {
    for (const l of LANES) {
      const list = byLane.get(l.key)!;
      const score = (p: Post) => { const n = [...links.get(p.id)!]; return n.length ? n.reduce((s, id) => s + row.get(id)!, 0) / n.length : row.get(p.id)!; };
      const s = new Map(list.map(p => [p.id, score(p)]));
      list.sort((a, b) => s.get(a.id)! - s.get(b.id)! || row.get(a.id)! - row.get(b.id)!);
    }
    index();
  }

  const nodes: GraphNode[] = [];
  LANES.forEach((l, i) => {
    byLane.get(l.key)!
      .forEach((p, j) => nodes.push({
        id: p.id, title: p.data.title, label: p.data.short ?? p.data.title, insight: p.data.insight,
        theme: p.data.themes[0], lane: l.key,
        x: MAP.left + i * MAP.laneGap, y: MAP.top + j * MAP.rowGap,
        big: minutesOf(p) >= 5,
      }));
  });

  const ids = new Set(nodes.map(n => n.id));
  const seen = new Map<string, GraphEdge>();
  for (const p of posts) for (const r of p.data.related ?? []) {
    if (!ids.has(r) || r === p.id) continue;
    const key = [p.id, r].sort().join('|');
    const e = seen.get(key);
    if (e) e.mutual = e.mutual || e.a !== p.id;
    else seen.set(key, { a: p.id, b: r, mutual: false });
  }
  const edges = [...seen.values()];
  const rows = Math.max(...LANES.map(l => byLane.get(l.key)!.length), 1);
  return { nodes, edges, height: MAP.top + (rows - 1) * MAP.rowGap + 60 };
}

/** A curved path between two nodes: arcs left within a lane, bows upward across lanes. */
export function edgePath(a: GraphNode, b: GraphNode) {
  if (a.x === b.x) return `M${a.x} ${a.y} Q${a.x - 44} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
  const lift = Math.min(46, Math.abs(b.x - a.x) / 6);
  return `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - lift} ${b.x} ${b.y}`;
}
