export const THEMES = {
  'ai-platform-engineering': { name: 'AI platform engineering', color: '--t-platform', blurb: "Shared platforms for teams building with models: what to standardise, what to expose, and how to tell if it's working." },
  'identity-security': { name: 'Identity and security', color: '--t-sec', blurb: 'Who is calling, what they may do, and where that decision should be made.' },
  observability: { name: 'Observability', color: '--t-obs', blurb: 'The evidence a team needs to locate a failure without filing a ticket.' },
  'developer-experience': { name: 'Developer experience', color: '--t-dx', blurb: 'How hard it is for another team to get from zero to a safe production workload.' },
  'ai-agents': { name: 'AI agents', color: '--t-agents', blurb: 'Running agents in production: tools, delegation and the boundaries around them.' },
  reliability: { name: 'Reliability', color: '--t-rel', blurb: 'Timeouts, retries and partial failures, and how to make them safe.' },
} as const;

export type ThemeKey = keyof typeof THEMES;
export const themeColor = (k: ThemeKey) => `hsl(var(${THEMES[k].color}))`;
