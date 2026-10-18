---
title: "What a shared platform should standardise"
date: 2026-10-01
themes: ["ai-platform-engineering", "developer-experience"]
insight: "Shared platforms tend to work best when they standardise the capabilities every team would otherwise rebuild, and leave use-case decisions to the teams."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7511334244959465472/"
caveats:
  - title: "The line moves over time."
    text: "Something that starts as a team choice can become a shared capability once several teams need it."
  - title: "Optional has a cost."
    text: "Every alternative path a platform allows is one more thing to secure and support."
  - title: "DORA's results are correlational."
    text: "They show associations with outcomes, not proof that one design causes them."
sources:
  - title: "CNCF Platforms White Paper"
    site: "tag-app-delivery.cncf.io"
    url: "https://tag-app-delivery.cncf.io/whitepapers/platforms/"
  - title: "2024 DORA Report"
    site: "dora.dev"
    url: "https://dora.dev/report/2024"
  - title: "2024 DORA Report infographic (PDF)"
    site: "dora.dev"
    url: "https://dora.dev/research/2024/2024-DORA-Report-Infographic.pdf"
related: ["first-users-shape-the-design", "time-to-first-production-call"]
---
<h3 id="idea">The idea in brief</h3>

<p>A platform that fixes every choice is easier to govern but can be harder to use. The question is which choices to make once, centrally, and which to leave with the teams building on it. The CNCF Platforms White Paper and DORA's 2024 research both offer a public starting point.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 268" role="img" aria-label="The platform standardises the shared layer; each team keeps the decisions closest to its use case."><defs><marker id="d5-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d5-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="16" y="14" width="428" height="106" rx="12" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="32" y="34" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="32" dy="0">Owned by each application team</tspan></text><rect x="32" y="50" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="95" y="63" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="95" dy="0">Agent framework</tspan></text><rect x="168" y="50" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="231" y="63" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="231" dy="0">Prompts, context</tspan></text><rect x="304" y="50" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="367" y="63" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="367" dy="0">Orchestration</tspan></text><rect x="32" y="84" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="95" y="97" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="95" dy="0">User experience</tspan></text><rect x="168" y="84" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="231" y="97" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="231" dy="0">Domain evals</tspan></text><line x1="16" y1="136" x2="444" y2="136" style="stroke:currentColor;stroke-opacity:.35;stroke-dasharray:5 5"/><text x="230" y="136" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="230" dy="0"> defaults stay optional </tspan></text><rect x="16" y="152" width="428" height="106" rx="12" style="fill:hsl(var(--brand) / .08);stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="32" y="172" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="32" dy="0">Standardised by the platform</tspan></text><rect x="32" y="188" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="95" y="201" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="95" dy="0">Identity and access</tspan></text><rect x="168" y="188" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="231" y="201" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="231" dy="0">Gateway access</tspan></text><rect x="304" y="188" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="367" y="201" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="367" dy="0">Quotas and cost</tspan></text><rect x="32" y="222" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="95" y="235" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="95" dy="0">Deployment paths</tspan></text><rect x="168" y="222" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="231" y="235" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="231" dy="0">Logs and traces</tspan></text><rect x="304" y="222" width="126" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="367" y="235" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="367" dy="0">Security controls</tspan></text></svg></div><figcaption>The platform standardises the shared layer; each team keeps the decisions closest to its use case.</figcaption></figure>

<h3 id="capabilities">The capabilities CNCF lists</h3>

<p>The CNCF Platforms White Paper names thirteen capability domains a platform may provide. Several match the shared list in the LinkedIn post:</p>

<div class="tbl"><table>
<thead><tr><th>Post's shared list</th><th>Closest CNCF capability</th></tr></thead>
<tbody>
<tr><td>Identity and access</td><td>Identity and secrets</td></tr>
<tr><td>Deployment paths</td><td>Delivery and verification automation; golden path templates</td></tr>
<tr><td>Logging, tracing and auditability</td><td>Observability</td></tr>
<tr><td>Security controls</td><td>Security (scanning, runtime analysis, policy enforcement)</td></tr>
<tr><td>Model access, quotas and cost</td><td>APIs and CLIs for provisioning; data services</td></tr>
</tbody></table></div>

<p>The paper also describes these capabilities as optional and composable: product teams can use parts of the platform and provision their own capabilities where the platform doesn't cover them.</p>

<h3 id="dora">What DORA found about independence</h3>

<p>DORA's 2024 report found that internal platforms were associated with higher individual productivity, but also with lower throughput and change stability. Developer independence, being able to finish work without waiting on an enabling team, was associated with a productivity gain of about 5%. The report's infographic notes larger downsides when the platform was mandated for the entire application lifecycle.</p>

<h3 id="split">A practical split</h3>

<p>Combining the two sources gives one reasonable reading:</p>

<ul>
<li><strong>Standardise</strong> what is common and undifferentiated: identity, access, delivery paths, observability, security controls.</li>
<li><strong>Leave with the team</strong> what depends on the use case: agent framework, prompt and context design, orchestration, user experience and domain-specific evaluation.</li>
<li><strong>Keep the defaults optional</strong>, so a team with a good reason can step outside them.</li>
</ul>
