---
title: "When a tool call times out, did it happen?"
date: 2026-09-22
themes: ["ai-agents", "reliability"]
insight: "A timed-out tool call may still have completed, so retrying safely needs the familiar distributed-systems tools: idempotency keys, durable state and verification."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7508072963515162624/"
caveats:
  - title: "Not every tool supports idempotency."
    text: "Wrapping a tool that can't deduplicate may need a separate record of what was attempted."
  - title: "Keys need a retention window."
    text: "AWS ties retention to the resource lifetime plus a buffer; too short and late retries slip through."
  - title: "Durable runtimes add moving parts."
    text: "They help with recovery but bring their own operational overhead."
sources:
  - title: "Making retries safe with idempotent APIs"
    site: "builder.aws.com"
    url: "https://builder.aws.com/content/3Ev0BENTyBr0XxzRk5FDZzgNYos/making-retries-safe-with-idempotent-apis"
  - title: "Durable Execution for AI Agents in Kubernetes"
    site: "buoyant.io"
    url: "https://www.buoyant.io/ai-kubernetes-episode/durable-execution-for-ai-agents-in-kubernetes"
  - title: "Make Agents Observable: Tracing Decisions, Tool Calls and Recovery"
    site: "conf42.com"
    url: "https://www.conf42.com/Observability_2026_Emerson_Braun_agents_llms_observability"
related: ["agent-success-is-not-a-200", "agent-identity-is-not-authorization"]
---
<h3 id="idea">The idea in brief</h3>

<p>When an agent's tool call times out, the action may have succeeded without the response arriving. A blind retry could create a second ticket or repeat a payment. This is a long-standing distributed-systems problem, and the established answers apply to agents too.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 300" role="img" aria-label="With an idempotency key, a retry after a lost response returns the original result instead of repeating the action."><defs><marker id="d8-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d8-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="40" y="14" width="140" height="34" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="110" y="31" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="110" dy="0">Agent workflow</tspan></text><rect x="280" y="14" width="140" height="34" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="350" y="31" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="350" dy="0">Tool</tspan></text><line x1="110" y1="48" x2="110" y2="286" style="stroke:currentColor;stroke-opacity:.25;stroke-dasharray:4 4"/><line x1="350" y1="48" x2="350" y2="286" style="stroke:currentColor;stroke-opacity:.25;stroke-dasharray:4 4"/><line x1="110" y1="78" x2="348" y2="78" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d8-a)"/><text x="230" y="68" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;"><tspan x="230" dy="0">create ticket, key K1</tspan></text><rect x="296" y="92" width="108" height="24" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="350" y="104" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="350" dy="0">ticket created</tspan></text><line x1="350" y1="134" x2="236" y2="134" style="stroke:currentColor;stroke-opacity:.55;stroke-width:1.4"/><text x="226" y="134" font-size="14" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;"><tspan x="226" dy="0">✕</tspan></text><text x="290" y="124" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="290" dy="0">response lost</tspan></text><rect x="56" y="150" width="108" height="24" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;stroke-dasharray:5 5;"/><text x="110" y="162" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:400;"><tspan x="110" dy="0">timeout</tspan></text><line x1="110" y1="196" x2="348" y2="196" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d8-b)"/><text x="230" y="186" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="230" dy="0">retry, same key K1</tspan></text><rect x="276" y="210" width="148" height="24" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="350" y="222" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:500;"><tspan x="350" dy="0">K1 seen: no new ticket</tspan></text><line x1="348" y1="256" x2="112" y2="256" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d8-b)"/><text x="230" y="246" font-size="11.5" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="230" dy="0">original result</tspan></text></svg></div><figcaption>With an idempotency key, a retry after a lost response returns the original result instead of repeating the action.</figcaption></figure>

<h3 id="idempotency">Idempotency keys</h3>

<p>AWS's Builders' Library article "Making retries safe with idempotent APIs" (2021) describes the approach used across many AWS APIs:</p>

<ul>
<li>The caller sends a unique client request identifier, such as <code>ClientToken</code> in EC2, and reuses it on every retry.</li>
<li>The service records that identifier atomically with the change it makes.</li>
<li>A retry with the same identifier gets a response equivalent to the original, instead of a second action.</li>
<li>Reusing an identifier with different parameters is rejected as a validation error.</li>
</ul>

<p>For agents, the identifier needs to be created by the workflow before the tool call, not by the model, so a retry carries the same key.</p>

<h3 id="durable">Durable execution</h3>

<p>In The AI Kubernetes Show episode on durable execution, Mark Fussell, creator of Dapr, describes runtimes that save state at each step so a crashed process can resume from its last completed step. He suggests keeping workflows deterministic where possible and using the model only for the decisions that need it.</p>

<h3 id="verify">Check before retrying</h3>

<p>Emerson Braun's Conf42 Observability 2026 talk makes a related point: treat failures as states, classify them (a timeout is not the same as an invalid result), verify what actually happened, and only then retry, reroute, compensate or escalate. The talk's demo used a status check after a timeout to confirm that a refund had already gone through.</p>

<h3 id="risk">Matching autonomy to risk</h3>

<p>The same talk suggests bounding how much an agent may do on its own by the risk of the action:</p>

<div class="tbl"><table>
<thead><tr><th>Kind of action</th><th>Suggested handling</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Low-risk read</td><td>Run automatically</td><td>Look up an order</td></tr>
<tr><td>Reversible change</td><td>Run with limits</td><td>Draft a ticket</td></tr>
<tr><td>High-impact action</td><td>Ask a human, with context</td><td>Issue a refund</td></tr>
</tbody></table></div>
