---
title: "Deciding what not to expose"
date: 2026-09-14
themes: ["ai-platform-engineering", "developer-experience"]
lane: "platform"
short: "What to hide"
insight: "Infrastructure was largely designed for people who read docs and debug by hand; building for agents and for non-infrastructure users both raise the question of what to hide."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7505158749809094656/"
caveats:
  - title: "Agents and people differ."
    text: "The episode notes that people still need good dashboards for judgement calls, even when agents work through a CLI."
  - title: "Hidden still has to work."
    text: "Whatever the platform hides, it has to keep reliable, because users can no longer work around it."
  - title: "Abstractions leak."
    text: "Some failures will always need lower-level detail to resolve."
sources:
  - title: "Why AI Infrastructure must evolve for Agent Experience"
    site: "latent.space"
    url: "https://latent.space/p/modal2026"
  - title: "CNCF Platforms White Paper"
    site: "tag-app-delivery.cncf.io"
    url: "https://tag-app-delivery.cncf.io/whitepapers/platforms/"
related: ["hide-complexity-not-evidence", "first-users-shape-the-design"]
---
<h3 id="idea">The idea in brief</h3>

<p>Much cloud infrastructure assumes a person who can read documentation, write configuration and debug when something breaks. A Latent Space episode on agent experience argues that agents don't have that context. The same question applies to people who use a platform without being infrastructure specialists.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 300" role="img" aria-label="A small surface sits over the hidden detail, with a window that still passes evidence up to the user."><defs><marker id="d11-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d11-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="30" y="16" width="400" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="230" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="230" dy="0">Person or agent using the platform</tspan></text><line x1="150" y1="56" x2="150" y2="94" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d11-a)"/><text x="142" y="75" font-size="11" text-anchor="end" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="142" dy="0">uses</tspan></text><line x1="330" y1="128" x2="330" y2="58" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d11-b)"/><text x="338" y="74.85" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="338" dy="0">evidence: errors,</tspan><tspan x="338" dy="14.3">trace IDs, model used</tspan></text><rect x="30" y="96" width="400" height="40" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="230" y="116" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="230" dy="0">Surface: API, CLI, templates</tspan></text><rect x="16" y="156" width="428" height="128" rx="12" style="fill:none;stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;stroke-dasharray:5 5;"/><text x="32" y="174" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:600;"><tspan x="32" dy="0">Hidden by default</tspan></text><rect x="32" y="190" width="126" height="30" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="95" y="205" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:400;"><tspan x="95" dy="0">Clusters</tspan></text><rect x="168" y="190" width="126" height="30" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="231" y="205" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:400;"><tspan x="231" dy="0">Networking</tspan></text><rect x="304" y="190" width="126" height="30" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="367" y="205" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:400;"><tspan x="367" dy="0">Identity plumbing</tspan></text><rect x="32" y="232" width="126" height="30" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="95" y="247" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:400;"><tspan x="95" dy="0">Gateway policies</tspan></text><rect x="168" y="232" width="126" height="30" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="231" y="247" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:400;"><tspan x="231" dy="0">Provider APIs</tspan></text><rect x="304" y="232" width="126" height="30" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="367" y="247" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:400;"><tspan x="367" dy="0">Quota internals</tspan></text></svg></div><figcaption>A small surface sits over the hidden detail, with a window that still passes evidence up to the user.</figcaption></figure>

<h3 id="episode">Points from the Latent Space episode</h3>

<p>In "Why AI Infrastructure must evolve for Agent Experience" (July 2026), Akshat Bubna, CTO of Modal, talks with swyx and Vibhu. Points from the episode:</p>

<ul>
<li>Traditional cloud tooling assumed a human operator who carries implicit context about how it works.</li>
<li>Modal shifted part of its SDK work from developer experience to agent experience, and argues the same improvements help both.</li>
<li>Defining infrastructure in code rather than configuration files makes it easier for agents to change and observe their environments.</li>
<li>Guardrails for agent sandboxes should rely on hard boundaries, not only permissions mediated by a model.</li>
</ul>

<h3 id="cncf">A thin layer over what exists</h3>

<p>The CNCF Platforms White Paper recommends building the thinnest reasonable layer over existing managed services, and offering capabilities through self-service APIs, CLIs and templates. That is a way of exposing a smaller surface without rebuilding what is underneath.</p>

<h3 id="balance">The balance</h3>

<div class="tbl"><table>
<thead><tr><th>Usually hidden</th><th>Still worth showing</th></tr></thead>
<tbody>
<tr><td>Cluster and network layout</td><td>Which deployment served the request</td></tr>
<tr><td>Identity plumbing</td><td>Which identity and scope were used</td></tr>
<tr><td>Gateway policy internals</td><td>Which policy acted on the request</td></tr>
<tr><td>Provider APIs</td><td>Which model version answered</td></tr>
<tr><td>Quota mechanics</td><td>Quota used and when it resets</td></tr>
</tbody></table></div>

<p>Hiding detail and hiding evidence are different things. A user may not need to know about clusters, identity plumbing or gateway policies, but still needs enough signal to tell where a problem is. The post on abstractions and evidence looks at that side.</p>
