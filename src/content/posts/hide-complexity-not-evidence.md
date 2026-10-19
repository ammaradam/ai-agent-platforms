---
title: "Good abstractions hide complexity, not evidence"
date: 2026-10-15
themes: ["observability", "ai-platform-engineering"]
lane: "observability"
short: "Keep evidence"
insight: "An abstraction can reduce how much infrastructure a user needs to know without reducing the evidence they need to diagnose a problem."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7516407996646686721/"
caveats:
  - title: "The conventions are not final."
    text: "Attribute names and structure can still change while the GenAI conventions are in Development."
  - title: "Standards cover only part of the picture."
    text: "Retries, fallbacks and policy decisions have no standard names yet, so each platform defines its own."
  - title: "Content capture needs care."
    text: "Prompts and tool arguments can contain sensitive data, which is why capture is opt-in."
  - title: "Telemetry has a cost."
    text: "More attributes and more spans mean more storage and processing, so sampling choices matter."
sources:
  - title: "Inside the LLM call: GenAI observability with OpenTelemetry"
    site: "opentelemetry.io"
    url: "https://opentelemetry.io/blog/2026/genai-observability/"
  - title: "OpenTelemetry GenAI semantic conventions"
    site: "github.com"
    url: "https://github.com/open-telemetry/semantic-conventions-genai"
  - title: "OpenTelemetry GenAI semantic conventions explained"
    site: "dash0.com"
    url: "https://www.dash0.com/knowledge/opentelemetry-genai-semantic-conventions-explained"
  - title: "Trace Context (W3C Recommendation)"
    site: "w3.org"
    url: "https://www.w3.org/TR/trace-context/"
related: ["what-not-to-expose", "agent-success-is-not-a-200"]
---
<h3 id="idea">The idea in brief</h3>

<p>A shared platform for model access hides a lot on purpose: deployments, networking, credentials and provider APIs. The question this post looks at is narrower: which signals should still reach the teams calling it, so they can tell where a problem sits. Public standards from OpenTelemetry and the W3C already cover a good part of this.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 300" role="img" aria-label="The platform hides its internals but returns evidence to the caller, and both sides share one trace ID."><defs><marker id="d1-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d1-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="30" y="16" width="400" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="230" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="230" dy="0">Application team</tspan></text><line x1="90" y1="56" x2="90" y2="138" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d1-a)"/><text x="98" y="84.525" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="98" dy="0">request +</tspan><tspan x="98" dy="14.950000000000001">traceparent</tspan></text><line x1="170" y1="138" x2="170" y2="58" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d1-b)"/><text x="180" y="84.525" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="180" dy="0">evidence: model served,</tspan><tspan x="180" dy="14.950000000000001">tokens, retries, policy</tspan></text><rect x="16" y="112" width="428" height="112" rx="12" style="fill:none;stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;stroke-dasharray:5 5;"/><text x="430" y="126" font-size="11" text-anchor="end" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="430" dy="0">platform internals stay hidden</tspan></text><rect x="40" y="140" width="160" height="46" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="163" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">Gateway</tspan></text><rect x="260" y="140" width="160" height="46" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="340" y="163" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="340" dy="0">Model or tool</tspan></text><line x1="200" y1="163" x2="258" y2="163" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d1-a)"/><text x="229" y="153" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="229" dy="0">call</tspan></text><line x1="120" y1="186" x2="120" y2="246" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;stroke-dasharray:4 4;" marker-end="url(#d1-a)"/><line x1="340" y1="186" x2="340" y2="246" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;stroke-dasharray:4 4;" marker-end="url(#d1-a)"/><text x="348" y="216" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="348" dy="0">spans</tspan></text><text x="128" y="216" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="128" dy="0">spans</tspan></text><rect x="30" y="248" width="400" height="36" rx="8" style="fill:hsl(var(--brand) / .08);stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="230" y="266" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="230" dy="0">One trace, same ID on both sides</tspan></text></svg></div><figcaption>The platform hides its internals but returns evidence to the caller, and both sides share one trace ID.</figcaption></figure>

<h3 id="vocabulary">A shared vocabulary from OpenTelemetry</h3>

<p>OpenTelemetry's GenAI semantic conventions define standard names for telemetry about model calls, agent operations and tool execution. The OpenTelemetry project's own 2026 walkthrough of GenAI observability shows what this looks like in practice:</p>

<ul>
<li><strong>Token usage</strong> is recorded on spans as <code>gen_ai.usage.input_tokens</code> and <code>gen_ai.usage.output_tokens</code>, and aggregated in the <code>gen_ai.client.token.usage</code> histogram.</li>
<li><strong>Latency</strong> is recorded in the <code>gen_ai.client.operation.duration</code> histogram, which can be split by <code>gen_ai.request.model</code>.</li>
<li><strong>Tool calls</strong> appear as <code>execute_tool</code> spans nested under an <code>invoke_agent</code> span, next to the model call spans.</li>
</ul>

<p>Mapped to the questions an application team is likely to ask, the conventions cover several of them directly:</p>

<div class="tbl"><table>
<thead><tr><th>Question</th><th>Signal</th><th>Defined in</th></tr></thead>
<tbody>
<tr><td>Which request is this?</td><td><code>traceparent</code> header (trace ID, parent ID)</td><td>W3C Trace Context</td></tr>
<tr><td>Which model was requested and which answered?</td><td><code>gen_ai.request.model</code>, <code>gen_ai.response.model</code></td><td>OTel GenAI conventions</td></tr>
<tr><td>How many tokens did it use?</td><td><code>gen_ai.usage.input_tokens</code>, <code>gen_ai.usage.output_tokens</code></td><td>OTel GenAI conventions</td></tr>
<tr><td>How long did it take?</td><td><code>gen_ai.client.operation.duration</code></td><td>OTel GenAI conventions</td></tr>
<tr><td>Did a tool call fail?</td><td><code>execute_tool</code> spans</td><td>OTel GenAI conventions</td></tr>
<tr><td>Was there a retry, fallback or policy change?</td><td>No standard name today</td><td>Left to each platform</td></tr>
</tbody></table></div>

<p>The last row is the gap. Retries, fallbacks and policy decisions happen inside the platform, so they only become visible if the platform chooses to emit them.</p>

<h3 id="maturity">How settled the conventions are</h3>

<p>The conventions are still evolving. According to the project's repository and Dash0's guide, they are marked as Development, and in June 2026 (semantic conventions v1.42.0) they moved into a dedicated <code>semantic-conventions-genai</code> repository so they can change faster than the core conventions. Dash0 notes that the only Stable attributes on a typical GenAI span are inherited from the core conventions, such as <code>error.type</code> and <code>server.address</code>.</p>

<p>A practical consequence is that attribute names may still change. Teams adopting them may find it easier to emit these signals from one shared place, such as a gateway or a common client library, rather than in every application.</p>

<h3 id="correlation">Connecting what each side sees</h3>

<p>The W3C Trace Context Recommendation defines the <code>traceparent</code> header, which carries a trace ID, the caller's span ID and a sampled flag between services. When the same trace ID shows up in the application's logs and in the platform's traces, both sides can look at one request together. An example value from the specification's format:</p>

<pre><code>traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^  ^ trace ID                       ^ parent span ID ^ flags</code></pre>

<h3 id="content">What usually stays out by default</h3>

<p>Prompt and response content is handled differently from metadata. The OpenTelemetry walkthrough describes content capture as off by default: without it, spans carry model names, token counts and durations, but no prompts or tool arguments. It also points out that captured content can be sensitive. Metadata alone is often enough to tell whether a problem is in the application, the platform, the model or a tool.</p>
