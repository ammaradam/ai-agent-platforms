---
title: "First users shape the platform's design"
date: 2026-09-29
themes: ["ai-platform-engineering", "developer-experience"]
insight: "A platform's first real users show where its abstractions help and where they get in the way, which makes their feedback part of the design work."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7510609596965744640/"
caveats:
  - title: "Early users are not every user."
    text: "The most engaged teams may tolerate more friction than later adopters, so their feedback is a start, not a sample."
  - title: "Feedback needs triage."
    text: "CNCF suggests prioritising what many teams need over single-team requests."
  - title: "Iteration can churn interfaces."
    text: "Changing the platform often has a cost for the teams already on it."
sources:
  - title: "CNCF Platforms White Paper"
    site: "tag-app-delivery.cncf.io"
    url: "https://tag-app-delivery.cncf.io/whitepapers/platforms/"
  - title: "2024 DORA Report"
    site: "dora.dev"
    url: "https://dora.dev/report/2024"
related: ["standardise-the-right-things", "what-not-to-expose"]
---
<h3 id="idea">The idea in brief</h3>

<p>An interface can look clean on paper and still fail its first real workflow. Comparing two deployments, understanding a blocked request, or diagnosing a failure are the kinds of tasks that expose gaps. Treating early users as a design input is a recurring recommendation in public platform-engineering guidance.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 270" role="img" aria-label="Early users close a loop: what they struggle with becomes the next design decision."><defs><marker id="d6-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d6-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="30" y="30" width="180" height="46" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="53" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">Ship a thin first version</tspan></text><rect x="250" y="30" width="180" height="46" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="340" y="53" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="340" dy="0">Watch real workflows</tspan></text><rect x="250" y="190" width="180" height="46" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="340" y="213" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="340" dy="0">Find the friction</tspan></text><rect x="30" y="190" width="180" height="46" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="120" y="213" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:500;"><tspan x="120" dy="0">Make the next decision</tspan></text><line x1="210" y1="53" x2="248" y2="53" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d6-a)"/><line x1="340" y1="76" x2="340" y2="188" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d6-a)"/><line x1="250" y1="213" x2="212" y2="213" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d6-a)"/><line x1="120" y1="190" x2="120" y2="78" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d6-a)"/><text x="348" y="124.85" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="348" dy="0">repeat questions,</tspan><tspan x="348" dy="14.3">workarounds, gaps</tspan></text><text x="128" y="104.85" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="128" dy="0">prioritise what</tspan><tspan x="128" dy="14.3">many teams need</tspan></text><text x="250" y="156" font-size="12" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="250" dy="0">feedback loop</tspan></text></svg></div><figcaption>Early users close a loop: what they struggle with becomes the next design decision.</figcaption></figure>

<h3 id="product">Platforms as products</h3>

<p>The CNCF Platforms White Paper recommends building platforms around user requirements, as a product rather than a mandate. It lists ways to learn from users, including interviews, hackathons, surveys, issue trackers and usage data, and warns that platform teams relying on mandates instead of feedback risk resistance.</p>

<div class="tbl"><table>
<thead><tr><th>Method listed by CNCF</th><th>What it tends to surface early</th></tr></thead>
<tbody>
<tr><td>Interviews</td><td>Where the mental model differs from the design</td></tr>
<tr><td>Hackathons</td><td>Steps that block a first working result</td></tr>
<tr><td>Surveys</td><td>Satisfaction across many teams at once</td></tr>
<tr><td>Issue trackers</td><td>Repeated problems and missing features</td></tr>
<tr><td>Usage data</td><td>What people actually use, and what they skip</td></tr>
</tbody></table></div>

<h3 id="small">Start small, with engaged teams</h3>

<p>The same paper suggests beginning with the thinnest reasonable layer over existing managed services, covering common needs such as pipelines, databases and observability, and working first with a small group of engaged application teams. That matches the post's point about getting a useful first version into people's hands and watching where they struggle.</p>

<h3 id="dora">User focus in DORA's research</h3>

<p>DORA's 2024 report returns to user-centricity repeatedly. It associates a user-centred approach with better product performance and developer well-being, and its platform-engineering findings emphasise developer independence and a product-oriented approach.</p>

<h3 id="signals">Signals worth watching early</h3>

<ul>
<li>Questions that repeat in support channels.</li>
<li>Steps where users leave the platform for a workaround.</li>
<li>Requests for information the abstraction currently hides.</li>
<li>Tasks that need help from the platform team to complete.</li>
</ul>
