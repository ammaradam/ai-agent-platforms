---
title: "What to put in an agent trace, and what to keep out"
date: 2026-10-23
themes: ["observability", "ai-agents"]
insight: "A useful agent trace records who asked, which tools ran and how each call ended, by default, and treats prompts, arguments and results as sensitive extras that are opt-in, redacted and kept for less time."
caveats:
  - title: "Debugging sometimes needs the content."
    text: "Some failures only make sense with the exact prompt in hand. An opt-in, short-lived capture for one agent or one session covers that without recording everything."
  - title: "Redaction is never perfect."
    text: "Pattern-based scrubbing misses unusual formats. Fields that are never captured are safer than fields that are captured and cleaned."
  - title: "The conventions are still moving."
    text: "The OpenTelemetry GenAI conventions are marked as in development, so some attribute names may change."
sources:
  - title: "OpenTelemetry GenAI semantic conventions: spans"
    site: "github.com"
    url: "https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md"
  - title: "Sampling"
    site: "opentelemetry.io"
    url: "https://opentelemetry.io/docs/concepts/sampling/"
  - title: "Logging Cheat Sheet"
    site: "cheatsheetseries.owasp.org"
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  - title: "LLM02:2025 Sensitive Information Disclosure"
    site: "genai.owasp.org"
    url: "https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/"
related: ["agent-success-is-not-a-200", "patterns-for-safe-tool-calls", "hide-complexity-not-evidence"]
---
<h3 id="idea">The idea in brief</h3>

<p>An agent trace has two jobs that pull in opposite directions. It should hold enough to answer "what did the agent do, and why did it fail?" without anyone reproducing the run. It should also hold as little personal and secret data as possible, because a trace store is copied, searched and kept far longer than the conversation that produced it.</p>

<p>The OpenTelemetry GenAI conventions settle most of this with one default: record the structure of every call, and treat the content as opt-in.</p>

<h3 id="always">Always: the shape of the run</h3>

<p>For each tool call, the conventions require only two attributes on an <code>execute_tool</code> span: the operation name and the tool's name. They add the call ID, the agent's name, the conversation ID and the error type when those apply. Together with timing and parent spans, that is enough to see the whole run: which agent called which tool, in what order, how long each took, and which one failed.</p>

<p>Two things are worth adding on top, because incidents nearly always ask them:</p>

<ul>
<li><strong>Who the call was for.</strong> The user and the delegated scope, as a pseudonymous ID rather than a name or email, so a bad action can be traced to its request. OWASP's Logging Cheat Sheet makes this "who" one of the four things every event should carry.</li>
<li><strong>How it ended, in a word.</strong> Succeeded, failed, retried or refused by policy. A run that "returned 200" can still have failed its task, which is the point of <a href="/posts/agent-success-is-not-a-200">a 200 OK doesn't mean the agent succeeded</a>.</li>
</ul>

<h3 id="optin">Opt-in: what was said and sent</h3>

<p>Prompts, model outputs, tool arguments and tool results are where the useful detail lives, and also where the risk lives. The conventions say instrumentations should not capture them by default, but should let users opt in, describing them as "considered sensitive and are often large in size". Tool arguments and results carry an explicit warning that they may contain sensitive information.</p>

<p>When content is switched on, scope it: one agent, one environment or one investigation, with a short retention period and a named owner. A month of every prompt "just in case" is a data breach waiting for its first search query.</p>

<h3 id="never">Never: secrets and identifiers</h3>

<p>Some things should not reach a trace even when content capture is on. OWASP's Logging Cheat Sheet lists them plainly: access tokens, session identifiers, passwords, connection strings, encryption keys, payment card and bank data, and sensitive personal data such as health or government identifiers. Agents make this harder, because a tool result can contain any of these without the agent noticing. LLM02 in the OWASP Top 10 for LLM Applications (2025) treats exactly this kind of leakage as a top risk.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 236" role="img" aria-label="Three tiers of trace data. Always recorded: tool name, call ID, agent, timing, outcome and a pseudonymous user. Opt-in and redacted: prompts, outputs, tool arguments and results. Never recorded: tokens, passwords, keys, card data and sensitive personal identifiers."><g style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.32;stroke-width:1.2;"><rect x="12" y="14" width="436" height="62" rx="10"/><rect x="12" y="86" width="436" height="62" rx="10" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;stroke-dasharray:5 4;"/><rect x="12" y="158" width="436" height="62" rx="10"/></g><g font-size="12" style="fill:currentColor;font-weight:600;"><text x="28" y="38">Always</text><text x="28" y="110" style="fill:hsl(var(--brand));">Opt-in, redacted</text><text x="28" y="182">Never</text></g><g font-size="10.5" style="fill:currentColor;opacity:.62;"><text x="28" y="56">the shape of the run</text><text x="28" y="128">short retention, named owner</text><text x="28" y="200">not even when content is on</text></g><g font-size="11" style="fill:currentColor;"><text x="190" y="38">tool name, call ID, agent, timing</text><text x="190" y="56">outcome, error type, pseudonymous user</text><text x="190" y="110">prompts and model outputs</text><text x="190" y="128">tool arguments and results</text><text x="190" y="182">tokens, passwords, keys</text><text x="190" y="200">card data, health and ID numbers</text></g></svg></div><figcaption>Structure by default, content on purpose, secrets never.</figcaption></figure>

<p>The reliable defence is to strip these at the source, in the instrumentation or the gateway, before the data leaves the service. Cleaning them later in the trace backend means they have already been copied.</p>

<h3 id="sampling">Keep the traces that matter</h3>

<p>Agents produce many spans per request, so most teams sample. The OpenTelemetry documentation explains the catch: deciding at the start of a trace, which is cheap, cannot guarantee that traces containing errors are kept. Deciding after the trace finishes, known as tail sampling, can keep every failed or slow run and a small share of the healthy ones. For agents, where the interesting runs are the odd ones, that trade is usually worth the extra setup.</p>

<h3 id="checklist">A short checklist</h3>

<ul>
<li>Every tool call is a span with tool name, call ID, agent and outcome.</li>
<li>Users appear as pseudonymous IDs, never names or emails.</li>
<li>Prompts, arguments and results are off unless someone switched them on for a reason.</li>
<li>Secrets are removed before data leaves the service.</li>
<li>Failed and slow runs are always kept; healthy ones are sampled.</li>
</ul>
