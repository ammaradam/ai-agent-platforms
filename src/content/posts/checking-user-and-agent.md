---
title: "Checking both the user and the agent"
date: 2026-09-16
themes: ["identity-security", "ai-agents"]
lane: "identity"
short: "User and agent"
insight: "Workload identity says which software is calling; authorizing an agent's action also needs to know which user it acts for and through which chain of agents."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7505898286952808449/"
caveats:
  - title: "Uber's setup is customised."
    text: "The post describes a tailored version of token exchange, not an off-the-shelf product."
  - title: "Scale changes the design."
    text: "Patterns built for a large fleet of agents may be more than a small deployment needs."
  - title: "Chains add latency."
    text: "Uber reports fast token exchange, but every hop still adds a call."
sources:
  - title: "Solving the Agent Identity Crisis"
    site: "uber.com"
    url: "https://www.uber.com/en-US/blog/solving-the-agent-identity-crisis/"
  - title: "Solving the Agent Identity Crisis, with Sergey Burykin"
    site: "insecureagents.com"
    url: "https://www.insecureagents.com/episodes/sergey-burykin"
  - title: "RFC 8693: OAuth 2.0 Token Exchange"
    site: "datatracker.ietf.org"
    url: "https://datatracker.ietf.org/doc/html/rfc8693"
related: ["agent-identity-is-not-authorization", "tool-call-timeouts"]
---
<h3 id="idea">The idea in brief</h3>

<p>Workload identity lets software authenticate without managing credentials. Agents add a further question: should this agent perform this action, for this user, at this point? Uber's engineering blog and an Insecure Agents podcast episode describe one large-scale answer.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 340" role="img" aria-label="Each hop gets a new short-lived token for the next destination, and the actor chain grows so the final policy can check both user and agents."><defs><marker id="d10-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d10-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="30" y="16" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">User</tspan></text><rect x="30" y="106" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="126" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">On-call agent</tspan></text><rect x="30" y="196" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="216" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">Investigation agent</tspan></text><rect x="30" y="286" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="120" y="306" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">Tool via MCP gateway</tspan></text><line x1="120" y1="56" x2="120" y2="104" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d10-a)"/><line x1="120" y1="146" x2="120" y2="194" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d10-a)"/><line x1="120" y1="236" x2="120" y2="284" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d10-b)"/><rect x="236" y="58" width="208" height="42" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="250" y="72" font-size="10.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="250" dy="0">token exchange, one audience</tspan></text><text x="250" y="88" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="250" dy="0">[user]</tspan></text><line x1="122" y1="79" x2="234" y2="79" style="stroke:currentColor;stroke-opacity:.25;stroke-dasharray:3 3"/><rect x="236" y="148" width="208" height="42" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="250" y="162" font-size="10.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="250" dy="0">token exchange, one audience</tspan></text><text x="250" y="178" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="250" dy="0">[user, on-call]</tspan></text><line x1="122" y1="169" x2="234" y2="169" style="stroke:currentColor;stroke-opacity:.25;stroke-dasharray:3 3"/><rect x="236" y="238" width="208" height="42" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="250" y="252" font-size="10.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="250" dy="0">token exchange, one audience</tspan></text><text x="250" y="268" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="250" dy="0">[user, on-call, investigation]</tspan></text><line x1="122" y1="259" x2="234" y2="259" style="stroke:currentColor;stroke-opacity:.25;stroke-dasharray:3 3"/><text x="236" y="298.525" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="236" dy="0">policy checks user</tspan><tspan x="236" dy="14.950000000000001">and agent together</tspan></text></svg></div><figcaption>Each hop gets a new short-lived token for the next destination, and the actor chain grows so the final policy can check both user and agents.</figcaption></figure>

<h3 id="uber">How Uber describes its approach</h3>

<p>Uber's post "Solving the Agent Identity Crisis" describes the following design:</p>

<div class="tbl"><table>
<thead><tr><th>Concern</th><th>Approach described in the post</th></tr></thead>
<tbody>
<tr><td>Proving the workload</td><td>A SPIRE-issued credential for each workload</td></tr>
<tr><td>Proving the agent</td><td>An agent registry linking agents to the workloads allowed to run them</td></tr>
<tr><td>Delegation</td><td>No reuse of the user's credentials; a new token for each hop, via a customised OAuth 2.0 Token Exchange</td></tr>
<tr><td>Token scope</td><td>One audience, valid for minutes</td></tr>
<tr><td>Provenance</td><td>An actor chain in each token: user, then each agent in turn</td></tr>
<tr><td>Enforcement</td><td>An MCP gateway applying tool-level policies that can check both user and agent</td></tr>
<tr><td>Audit</td><td>A dashboard tracing each hop with identities and allow decisions</td></tr>
</tbody></table></div>

<p>Sergey Burykin of Uber's AI Security team discusses the work on the Insecure Agents podcast.</p>

<h3 id="exchange">The standard underneath</h3>

<p>RFC 8693 defines OAuth 2.0 Token Exchange, a way to swap one token for another, including for delegation, where a token can represent both the subject and the party acting on its behalf. That is the general mechanism behind carrying a user's authority through a chain of services.</p>

<h3 id="takeaway">What carries over</h3>

<ul>
<li>Separate proof of the workload from proof of the agent.</li>
<li>Scope each token to one destination and keep it short-lived.</li>
<li>Record the full chain of who is acting for whom.</li>
<li>Evaluate both the user and the agent when deciding.</li>
</ul>
