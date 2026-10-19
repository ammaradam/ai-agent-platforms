---
title: "Measure the journey to the first production call"
date: 2026-10-08
themes: ["developer-experience", "ai-platform-engineering"]
lane: "developer"
short: "First call"
insight: "Platform metrics are more useful when they cover how quickly a new team gets started, not only how the platform performs once it's running."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7513870865990680576/"
caveats:
  - title: "DORA's findings are correlational."
    text: "They show associations between platform use and outcomes, not causes."
  - title: "The mapping is approximate."
    text: "The scorecard items are close to the published measures, not identical to them."
  - title: "Small samples are noisy."
    text: "When only a few teams onboard each quarter, individual journeys say more than percentages."
  - title: "Any metric can be gamed."
    text: "Pairing speed measures with stability and satisfaction measures, as DORA and CNCF both do, reduces that risk."
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
related: ["gateway-errors-that-help", "standardise-the-right-things"]
---
<h3 id="idea">The idea in brief</h3>

<p>Operational metrics such as uptime and latency describe a platform once teams are using it. Onboarding metrics describe how hard it is to get there. Two public sources support measuring both: the CNCF white paper on platforms and DORA's research on software delivery and platform engineering.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 440 330" role="img" aria-label="Time to first production call spans the whole onboarding journey, not just the model response at the end."><defs><marker id="d3-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d3-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><line x1="48" y1="36" x2="48" y2="292" style="stroke:currentColor;stroke-opacity:.3;stroke-width:2"/><circle cx="48" cy="36" r="6" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.6;stroke-width:1.4"/><text x="66" y="36" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="66" dy="0">1. Onboarding and docs</tspan></text><circle cx="48" cy="80" r="6" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.6;stroke-width:1.4"/><text x="66" y="80" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="66" dy="0">2. Identity and access</tspan></text><circle cx="48" cy="124" r="6" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.6;stroke-width:1.4"/><text x="66" y="124" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="66" dy="0">3. Model discovery</tspan></text><circle cx="48" cy="168" r="6" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.6;stroke-width:1.4"/><text x="66" y="168" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="66" dy="0">4. Gateway configuration</tspan></text><circle cx="48" cy="212" r="6" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.6;stroke-width:1.4"/><text x="66" y="212" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="66" dy="0">5. Deployment</tspan></text><circle cx="48" cy="256" r="6" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.6;stroke-width:1.4"/><text x="66" y="256" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="66" dy="0">6. Logging and cost</tspan></text><circle cx="48" cy="292" r="8" style="fill:hsl(var(--brand))"/><text x="66" y="292" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="66" dy="0">First authenticated, observable call</tspan></text><path d="M318 30 h12 v268 h-12" style="fill:none;stroke:hsl(var(--brand));stroke-width:1.6"/><text x="342" y="144.2" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="342" dy="0">time to first</tspan><tspan x="342" dy="15.600000000000001">production call</tspan></text><text x="342" y="180.85" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="342" dy="0">each ticket</tspan><tspan x="342" dy="14.3">adds waiting</tspan></text></svg></div><figcaption>Time to first production call spans the whole onboarding journey, not just the model response at the end.</figcaption></figure>

<h3 id="cncf">What the CNCF white paper suggests</h3>

<p>The CNCF Platforms White Paper, from the TAG App Delivery Platforms Working Group, groups platform success metrics into three categories:</p>

<div class="tbl"><table>
<thead><tr><th>Category</th><th>Example measures in the paper</th></tr></thead>
<tbody>
<tr><td>User satisfaction and productivity</td><td>Active users and retention, satisfaction surveys such as NPS, SPACE framework measures</td></tr>
<tr><td>Organisational efficiency</td><td>Time to fulfil a request, time to build and deploy a new service, time for a new user to submit their first code change</td></tr>
<tr><td>Product and feature delivery</td><td>The DORA metrics: deployment frequency, lead time for changes, time to restore service, change failure rate</td></tr>
</tbody></table></div>

<p>The paper also suggests that simple surveys and usage analysis are a reasonable place to start.</p>

<h3 id="mapping">How the scorecard maps to these sources</h3>

<p>Each item in this scorecard corresponds to a measure in one of the public frameworks:</p>

<div class="tbl"><table>
<thead><tr><th>Scorecard item</th><th>Closest published measure</th><th>Source</th></tr></thead>
<tbody>
<tr><td>Time to first production call</td><td>Onboarding speed; time to build and deploy a new service</td><td>CNCF</td></tr>
<tr><td>Onboarding without a support ticket</td><td>Developer independence</td><td>DORA 2024</td></tr>
<tr><td>Deployment lead time</td><td>Lead time for changes</td><td>DORA</td></tr>
<tr><td>Failed deployment rate</td><td>Change failure rate</td><td>DORA</td></tr>
<tr><td>Time to diagnose a blocked request</td><td>Time to fulfil a request</td><td>CNCF</td></tr>
<tr><td>Weekly active projects</td><td>Active users and retention</td><td>CNCF</td></tr>
<tr><td>Developer confidence</td><td>Satisfaction surveys</td><td>CNCF</td></tr>
</tbody></table></div>

<h3 id="dora">What DORA's 2024 research found</h3>

<p>DORA's 2024 report included a chapter on platform engineering. Among its findings:</p>

<ul>
<li>Respondents using an internal developer platform reported higher individual productivity and team performance.</li>
<li>The same group showed lower software delivery throughput (about 8%) and change stability (about 14%), which the report described as unexpected.</li>
<li>Developer independence, being able to complete work without waiting on an enabling team, was associated with about a 5% productivity improvement.</li>
<li>The infographic notes that the downsides were more pronounced when the platform was mandated for the whole application lifecycle.</li>
</ul>

<p>These results point towards measuring how independently teams can work, alongside delivery speed and stability.</p>
