---
title: "A 200 OK doesn't mean the agent succeeded"
date: 2026-09-18
themes: ["observability", "ai-agents"]
insight: "Infrastructure can be healthy while an agent's task goes wrong, so agent observability leans on execution traces, not only logs and latency."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7506608295965507585/"
caveats:
  - title: "Tool arguments are sensitive."
    text: "In OpenTelemetry, tool arguments and results only appear when content capture is enabled, which is off by default."
  - title: "Traces are not evaluations."
    text: "A complete trace shows what happened, not whether the answer was good."
  - title: "More telemetry, more cost."
    text: "Recording every step of long agent runs adds up."
sources:
  - title: "Make Agents Observable: Tracing Decisions, Tool Calls and Recovery"
    site: "conf42.com"
    url: "https://www.conf42.com/Observability_2026_Emerson_Braun_agents_llms_observability"
  - title: "Inside the LLM call: GenAI observability with OpenTelemetry"
    site: "opentelemetry.io"
    url: "https://opentelemetry.io/blog/2026/genai-observability/"
related: ["hide-complexity-not-evidence", "tool-call-timeouts"]
---
<h3 id="idea">The idea in brief</h3>

<p>For a conventional ML service, logs and latency say a lot about health. An agent can return a successful response while picking the wrong tool, using stale context, or retrying more than it should. That shifts attention to the execution trace.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 270" role="img" aria-label="The trace shows every step, including a timed-out tool call and its retry, but the run still ends in 200 OK without verifying the outcome."><defs><marker id="d9-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d9-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><text x="20" y="43" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="20" dy="0">invoke_agent</tspan></text><rect x="180" y="34" width="260" height="18" rx="4" style="fill:currentColor;fill-opacity:.14;"/><text x="432" y="43" font-size="11" text-anchor="end" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="432" dy="0">200 OK</tspan></text><text x="20" y="71" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="20" dy="0">chat</tspan></text><rect x="184" y="62" width="46" height="18" rx="4" style="fill:hsl(var(--brand));"/><text x="20" y="99" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="20" dy="0">execute_tool: lookup</tspan></text><rect x="234" y="90" width="38" height="18" rx="4" style="fill:hsl(var(--brand));"/><text x="20" y="127" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="20" dy="0">chat</tspan></text><rect x="276" y="118" width="28" height="18" rx="4" style="fill:hsl(var(--brand));"/><text x="20" y="155" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="20" dy="0">execute_tool: refund</tspan></text><rect x="308" y="146" width="62" height="18" rx="4" style="fill:none;stroke:hsl(var(--brand));stroke-dasharray:3 3;"/><text x="20" y="183" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="20" dy="0">execute_tool: refund</tspan></text><rect x="374" y="174" width="30" height="18" rx="4" style="fill:hsl(var(--brand));"/><text x="20" y="211" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="20" dy="0">chat</tspan></text><rect x="408" y="202" width="28" height="18" rx="4" style="fill:hsl(var(--brand));"/><line x1="20" y1="236" x2="440" y2="236" style="stroke:currentColor;stroke-opacity:.2"/><text x="20" y="254" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="20" dy="0">Was the refund issued exactly once?</tspan></text><text x="440" y="254" font-size="11.5" text-anchor="end" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="440" dy="0">not in the trace</tspan></text></svg></div><figcaption>The trace shows every step, including a timed-out tool call and its retry, but the run still ends in 200 OK without verifying the outcome.</figcaption></figure>

<h3 id="talk">Points from the Conf42 talk</h3>

<p>Emerson Braun's Conf42 Observability 2026 talk, "Make Agents Observable: Tracing Decisions, Tool Calls and Recovery", makes several points along these lines:</p>

<ul>
<li>An agent reporting that a task is done is not proof that it is done.</li>
<li>A valid HTTP response doesn't mean the intended change happened.</li>
<li>Evidence should cover context, decisions, actions and outcomes, with credentials and personal data redacted before export.</li>
<li>Cost includes tool calls, retry loops and approval waits, not only model tokens.</li>
</ul>

<h3 id="otel">What standard telemetry already provides</h3>

<p>OpenTelemetry's 2026 walkthrough of GenAI observability shows the structure the GenAI conventions give an agent run: an <code>invoke_agent</code> span with nested <code>chat</code> spans for model calls and <code>execute_tool</code> spans for each tool invocation. The <code>gen_ai.response.finish_reasons</code> attribute can show when a model stopped to request a tool.</p>

<p>That covers which tools were called and how long each step took. Whether the task actually succeeded usually needs a check against the target system, which no generic convention can supply.</p>

<h3 id="signals">What each signal can and can't tell you</h3>

<div class="tbl"><table>
<thead><tr><th>Signal</th><th>Tells you</th><th>Doesn't tell you</th></tr></thead>
<tbody>
<tr><td>HTTP status</td><td>The request completed</td><td>Whether the task was done</td></tr>
<tr><td>Latency</td><td>How long it took</td><td>Whether the right tool was used</td></tr>
<tr><td><code>execute_tool</code> spans</td><td>Which tools ran, and in what order</td><td>Whether their results were correct</td></tr>
<tr><td>Outcome check</td><td>Whether the change actually happened</td><td>Needs a domain-specific check</td></tr>
</tbody></table></div>

<h3 id="checklist">Questions a trace should answer</h3>

<ul>
<li>Which tools were called, in what order, with what result?</li>
<li>How many retries or fallbacks happened?</li>
<li>Where was the run blocked, if anywhere?</li>
<li>Was the outcome verified, and how?</li>
</ul>
