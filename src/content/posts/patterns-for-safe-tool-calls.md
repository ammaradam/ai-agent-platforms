---
title: "Patterns for agent tool calls you can trust in production"
date: 2026-10-19
themes: ["ai-agents", "identity-security", "reliability"]
insight: "Most of what makes an agent safe to run happens at the tool call, not in the prompt: who the call acts for, how risky it is, what happens when it is retried, and whether anyone can see it afterwards."
caveats:
  - title: "Patterns, not a framework."
    text: "These are design habits drawn from public sources and distributed-systems practice. Each team still has to decide which tools need which controls."
  - title: "Some of the standards are young."
    text: "MCP tool annotations and the OpenTelemetry GenAI conventions are still changing. Field names here may move."
  - title: "Controls cost something."
    text: "Approvals slow people down and a gateway is another service to run. Grade tools by risk so the cost lands where it is worth paying."
  - title: "Prompt injection is not solved."
    text: "The patterns limit what an injected instruction can do. They do not stop the model from being misled."
sources:
  - title: "Building effective agents"
    site: "anthropic.com"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
  - title: "MCP specification: Tools (2025-06-18)"
    site: "modelcontextprotocol.io"
    url: "https://modelcontextprotocol.io/specification/2025-06-18/server/tools"
  - title: "Tool annotations as a risk vocabulary"
    site: "blog.modelcontextprotocol.io"
    url: "https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/"
  - title: "LLM06:2025 Excessive Agency"
    site: "genai.owasp.org"
    url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
  - title: "RFC 8693: OAuth 2.0 Token Exchange"
    site: "datatracker.ietf.org"
    url: "https://datatracker.ietf.org/doc/html/rfc8693"
  - title: "Idempotent requests"
    site: "docs.stripe.com"
    url: "https://docs.stripe.com/api/idempotent_requests"
  - title: "Making retries safe with idempotent APIs"
    site: "builder.aws.com"
    url: "https://builder.aws.com/content/3Ev0BENTyBr0XxzRk5FDZzgNYos/making-retries-safe-with-idempotent-apis"
  - title: "The lethal trifecta for AI agents"
    site: "simonwillison.net"
    url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"
  - title: "OpenTelemetry GenAI semantic conventions"
    site: "github.com"
    url: "https://github.com/open-telemetry/semantic-conventions-genai"
  - title: "RFC 9457: Problem Details for HTTP APIs"
    site: "datatracker.ietf.org"
    url: "https://datatracker.ietf.org/doc/html/rfc9457"
related: ["tool-call-timeouts", "agent-identity-is-not-authorization", "agent-success-is-not-a-200"]
---
<h3 id="idea">The idea in brief</h3>

<p>An agent becomes risky the moment it can do things, not when it says things. Every action it takes goes through a tool call: a ticket created, a refund issued, a file deleted, an email sent. That makes the tool call the most useful place to put controls.</p>

<p>Prompts help, but they are requests to a model that can be misled. The controls that hold up in production sit outside the model, at the boundary between what the agent proposes and what a system actually does. This post collects seven patterns for that boundary, drawn from public guidance and from older distributed-systems practice that already solved half the problem.</p>

<p>The short version: the model proposes, and the system decides. Each pattern is one question the system should be able to answer before, during or after a call.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 290" role="img" aria-label="The model proposes a tool call. A gateway answers five questions before the tool runs: who it is for, whether it is allowed, how risky it is, whether it has already run, and how it is recorded."><defs><marker id="p1-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="p1-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="10" y="108" width="96" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="58" y="125" font-size="12.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">Model</text><text x="58" y="142" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">proposes a call</text><rect x="136" y="14" width="190" height="232" rx="10" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="231" y="36" font-size="12.5" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">Tool boundary</text><rect x="150" y="50" width="162" height="28" rx="6" style="fill:hsl(var(--muted));"/><text x="162" y="68" font-size="11.5" style="fill:currentColor;">1  Who is it for?</text><rect x="150" y="86" width="162" height="28" rx="6" style="fill:hsl(var(--muted));"/><text x="162" y="104" font-size="11.5" style="fill:currentColor;">2  Is it allowed?</text><rect x="150" y="122" width="162" height="28" rx="6" style="fill:hsl(var(--muted));"/><text x="162" y="140" font-size="11.5" style="fill:currentColor;">3  How risky is it?</text><rect x="150" y="158" width="162" height="28" rx="6" style="fill:hsl(var(--muted));"/><text x="162" y="176" font-size="11.5" style="fill:currentColor;">4  Has it run already?</text><rect x="150" y="194" width="162" height="28" rx="6" style="fill:hsl(var(--muted));"/><text x="162" y="212" font-size="11.5" style="fill:currentColor;">5  Is it on the record?</text><rect x="356" y="108" width="94" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="403" y="125" font-size="12.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">Tool or API</text><text x="403" y="142" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">does the work</text><line x1="106" y1="130" x2="134" y2="130" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#p1-a)"/><line x1="326" y1="130" x2="354" y2="130" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#p1-a)"/><path d="M403 152 V272 H58 V154" style="fill:none;stroke:hsl(var(--brand));stroke-width:1.4;stroke-dasharray:5 4;" marker-end="url(#p1-b)"/><text x="231" y="266" font-size="11" text-anchor="middle" style="fill:hsl(var(--brand));">result, or an error the agent can act on</text></svg></div><figcaption>The model proposes. Code at the boundary decides, and records what happened.</figcaption></figure>

<h3 id="tool-design">1. Design tools that are hard to misuse</h3>

<p>The first control is the shape of the tool itself. A tool with a vague name, loose arguments and a dozen modes invites the model to guess. A narrow tool with strict arguments leaves less to guess.</p>

<p>Anthropic's "Building effective agents" (2024) calls this the agent-computer interface and argues it deserves as much care as a human interface. It borrows the term poka-yoke, from lean manufacturing: change the arguments so mistakes are harder to make. Its example is concrete. In their SWE-bench agent, the model made mistakes with relative file paths after moving out of the root directory. Requiring absolute paths fixed it, and the team reports spending more time on tools than on the overall prompt.</p>

<p>In practice that means:</p>

<ul>
<li><strong>One job per tool.</strong> <code>refund_order</code> and <code>cancel_order</code>, not <code>manage_order(action=...)</code>. A narrow tool can be granted, graded and audited on its own.</li>
<li><strong>Types that rule out bad input.</strong> Enums instead of free text, amounts in minor units, identifiers that must exist. MCP lets a tool publish an input schema and, since the 2025-06-18 revision, an output schema that clients should validate.</li>
<li><strong>Descriptions that state the boundary.</strong> Say what the tool will not do, and which similar tool to use instead.</li>
</ul>

<p>Good tool design does not make a tool safe. It removes the mistakes that never needed to happen, so the remaining controls deal with the ones that matter.</p>

<h3 id="identity">2. Know who the call is for</h3>

<p>When an agent calls a tool, there are at least two parties: the agent, which is software with its own identity, and the person it is acting for. Most systems were built to see one of them. A service account token says "the support bot is calling" and nothing about which customer asked, or what that customer may do.</p>

<p>OAuth already has a shape for this. RFC 8693, OAuth 2.0 Token Exchange (2020), lets a service swap a user's token for a new one that names both the subject and the actor. The <code>act</code> claim records who is acting on whose behalf, and actors can be nested when one agent calls another. Microsoft's Entra Agent ID documentation describes the same idea as an on-behalf-of flow for agents.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 236" role="img" aria-label="A user delegates a limited scope to an agent. The agent exchanges tokens and calls the tool with a token that names both the user as subject and the agent as actor, so the tool can check both."><defs><marker id="p2-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="p2-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="14" y="20" width="100" height="36" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="64" y="42" font-size="12.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">User</text><rect x="180" y="20" width="100" height="36" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="230" y="42" font-size="12.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">Agent</text><rect x="346" y="20" width="100" height="36" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="396" y="42" font-size="12.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">Payments API</text><line x1="114" y1="38" x2="178" y2="38" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#p2-a)"/><text x="146" y="74" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">delegates</text><text x="146" y="88" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">refunds only</text><line x1="280" y1="38" x2="344" y2="38" style="stroke:hsl(var(--brand));stroke-width:1.4;" marker-end="url(#p2-b)"/><text x="312" y="74" font-size="10.5" text-anchor="middle" style="fill:hsl(var(--brand));">exchanged</text><text x="312" y="88" font-size="10.5" text-anchor="middle" style="fill:hsl(var(--brand));">token</text><rect x="110" y="112" width="240" height="100" rx="10" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="126" y="136" font-size="11.5" style="fill:currentColor;font-family:ui-monospace,monospace;">sub   customer-4821</text><text x="126" y="156" font-size="11.5" style="fill:hsl(var(--brand));font-family:ui-monospace,monospace;">act   support-agent</text><text x="126" y="176" font-size="11.5" style="fill:currentColor;font-family:ui-monospace,monospace;">scope refunds:create</text><text x="126" y="196" font-size="11.5" style="fill:currentColor;font-family:ui-monospace,monospace;">aud   payments-api</text><path d="M350 162 H396 V58" style="fill:none;stroke:hsl(var(--brand));stroke-width:1.4;stroke-dasharray:5 4;" marker-end="url(#p2-b)"/><text x="402" y="120" font-size="10.5" style="fill:hsl(var(--brand));">checks</text><text x="402" y="134" font-size="10.5" style="fill:hsl(var(--brand));">both</text></svg></div><figcaption>One token, two parties. The tool can ask whether this agent may act, and whether this person may ask for it.</figcaption></figure>

<p>With both parties on the request, the tool can apply the rule that matters: the action must be allowed for the user and for the agent. OWASP's entry on Excessive Agency (LLM06, 2025) recommends exactly this, executing in the user's context with the minimum privileges needed, and enforcing authorization in the downstream system rather than trusting the model to decide.</p>

<p>Two details are easy to miss. The scope delegated to the agent should be narrower than the user's own permissions, since "everything I can do" is rarely what someone means. And the delegation should expire, so an agent that runs for weeks is not still holding last month's consent.</p>

<h3 id="risk">3. Grade every tool by risk</h3>

<p>Not every tool needs the same treatment. Looking up an order is not issuing a refund. If every call needs approval, people stop reading the prompts and click yes. If none do, the first mistake is the expensive kind.</p>

<p>MCP gives tools a vocabulary for this. Since the 2025-03-26 revision, a tool can carry four annotations: <code>readOnlyHint</code>, <code>destructiveHint</code>, <code>idempotentHint</code> and <code>openWorldHint</code>. The defaults are deliberately cautious. A tool with no annotations is assumed to write, possibly destructively, not to be safe to repeat, and to reach outside systems. A March 2026 post on the MCP blog describes the annotations as a risk vocabulary that clients can use to decide when to ask for confirmation.</p>

<p>The same post, and the specification, are clear that annotations are hints. A server can describe its own tools wrongly, so clients must treat annotations as untrusted unless the server is trusted. The grade that drives approvals should belong to the platform, not to whoever wrote the tool.</p>

<div class="tbl"><table>
<thead><tr><th>Tier</th><th>What it can do</th><th>Default handling</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Read</td><td>Returns data, changes nothing</td><td>Run, within the user's own access</td><td>Look up an order</td></tr>
<tr><td>Reversible write</td><td>Changes state that can be undone</td><td>Run, with limits and a record</td><td>Draft a reply, add a tag</td></tr>
<tr><td>Irreversible or external</td><td>Moves money, deletes, or leaves the system</td><td>Ask a person, showing the arguments</td><td>Issue a refund, send an email</td></tr>
</tbody></table></div>

<p>The MCP specification adds one more client duty here: show the tool's inputs to the user before calling it. An approval prompt that says "Allow refund?" is not a decision. One that says "Refund RM240 to customer 4821 for order 9917" is.</p>

<h3 id="retries">4. Make retries safe</h3>

<p>Agents retry. Networks drop responses, tools time out, and runtimes restart mid-task. A timed-out call may still have completed, so a blind retry can create a second ticket or a second payment.</p>

<p>This is the oldest problem in the list, and it has a settled answer: idempotency keys. The caller attaches a unique key to each logical action and reuses it on every retry. The service stores the key with the result and returns the stored result when it sees the key again. Stripe's API documents the details well: keys of up to 255 characters, results saved once execution begins, keys that may be pruned after at least 24 hours, and an error if a key is reused with different parameters. AWS describes the same design across its own APIs.</p>

<p>The agent-specific part is where the key comes from. If the model generates the key, a retry may come back with a new one, because the model regenerated the whole call. The key belongs to the workflow: create it before the call, store it with the step, and reuse it on every attempt.</p>

<pre><code># illustrative only
step = workflow.step("refund", order_id=9917)
key  = step.key or step.save_key(uuid4())   # made once, before the first attempt

for attempt in retries(max=3):
    result = payments.refund(order_id=9917, amount=24000, idempotency_key=key)
    if result.ok or not result.retryable:
        break</code></pre>

<p>Tools that cannot deduplicate need a different answer: check before retrying. Look up whether the refund exists, then decide. That is slower, and it is the reason the tier table above treats non-idempotent, irreversible tools with the most care.</p>

<h3 id="trifecta">5. Never give one agent the lethal trifecta</h3>

<p>Some risks come from combinations, not single tools. Simon Willison's post "The lethal trifecta" (2025) names one that sits behind many published exploits. An agent becomes exploitable when it has all three of: access to private data, exposure to untrusted content, and a way to send data out.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 270" role="img" aria-label="Three overlapping circles: private data, untrusted content, and a way to send data out. Where all three overlap, injected instructions can leak data."><circle cx="186" cy="104" r="78" style="fill:hsl(var(--brand));fill-opacity:.07;stroke:currentColor;stroke-opacity:.35;stroke-width:1.2;"/><circle cx="274" cy="104" r="78" style="fill:hsl(var(--brand));fill-opacity:.07;stroke:currentColor;stroke-opacity:.35;stroke-width:1.2;"/><circle cx="230" cy="178" r="78" style="fill:hsl(var(--brand));fill-opacity:.07;stroke:currentColor;stroke-opacity:.35;stroke-width:1.2;"/><text x="150" y="82" font-size="12" text-anchor="middle" style="fill:currentColor;font-weight:500;">Private data</text><text x="150" y="98" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">inbox, CRM, files</text><text x="310" y="82" font-size="12" text-anchor="middle" style="fill:currentColor;font-weight:500;">Untrusted content</text><text x="310" y="98" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">web pages, emails</text><text x="230" y="222" font-size="12" text-anchor="middle" style="fill:currentColor;font-weight:500;">Can send data out</text><text x="230" y="238" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">email, HTTP, links</text><circle cx="230" cy="130" r="5" style="fill:hsl(var(--brand));"/><text x="230" y="150" font-size="11" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">data can leak</text></svg></div><figcaption>Any two are manageable. All three in one agent is how an injected instruction turns into a data leak.</figcaption></figure>

<p>The reason is prompt injection. Untrusted content can carry instructions, the model may follow them, and the instructions can say "send this to me". Willison's advice is blunt: avoid the combination entirely, because no reliable filter for injected instructions exists yet.</p>

<p>This turns into a design rule for the platform. Treat the three as capabilities, and refuse configurations that grant all three to one agent. Split the work instead. An agent that reads the web does not get the inbox. An agent with the inbox cannot make arbitrary HTTP calls. Where all three are needed, put a person or a narrow allow-list on the outbound path.</p>

<h3 id="trace">6. Leave a trace for every call</h3>

<p>When something goes wrong, the first question is what the agent actually did. "The run succeeded" is not an answer if the run issued the wrong refund. Each tool call needs its own record: which tool, which arguments, for whom, with what result, and as part of which run.</p>

<p>OpenTelemetry's GenAI semantic conventions give this a shared shape. A tool call becomes an <code>execute_tool</code> span with attributes such as <code>gen_ai.tool.name</code> and <code>gen_ai.tool.call.id</code>, nested under the agent's run. Using the standard, rather than a home-grown log format, means traces from different frameworks and vendors can sit in the same backend. The conventions are still marked as in development, so expect some names to move.</p>

<p>Two practical points. Propagate trace context into the tool's own service, so the agent's span and the API's span join up. And decide early what not to record: arguments and results can hold personal data, and a trace store is a poor place to discover that.</p>

<h3 id="errors">7. Return errors the agent can act on</h3>

<p>An agent reads errors the way a developer does, except faster and more literally. "Request failed" leads to a retry loop. "Refund exceeds the delegated limit of RM50; ask the user to approve" leads to the right next step.</p>

<p>RFC 9457, Problem Details for HTTP APIs (2023), gives errors a stable structure: a type, a title, a status, a detail and an instance. A typed error lets the agent, and the code around it, tell a retryable failure from a permanent one, and a policy refusal from a broken tool. MCP makes a similar split between protocol errors and tool execution errors, which are returned to the model as results with <code>isError</code> set.</p>

<p>The usual caution applies. A useful error says what happened and what to try next. It does not reveal the exact policy rule, internal hostnames or stack traces, which are as useful to an attacker steering the agent as they are to the agent.</p>

<h3 id="together">Putting it together</h3>

<p>None of these patterns is new on its own. Narrow interfaces, delegated tokens, risk tiers, idempotency keys, separation of duties, tracing and typed errors are all ordinary engineering. What is new is the caller: a component that is capable, fast, and occasionally wrong in ways that are hard to predict. That makes the boundary more important, not less.</p>

<p>A useful test for any tool an agent can call is whether the platform can answer these questions about it without reading the prompt:</p>

<div class="tbl"><table>
<thead><tr><th>Question</th><th>Pattern</th><th>What answers it</th></tr></thead>
<tbody>
<tr><td>Could the model call this wrongly by accident?</td><td>Tool design</td><td>Narrow tool, strict schema</td></tr>
<tr><td>Who is this call for, and may they ask for it?</td><td>Identity</td><td>Token with subject and actor</td></tr>
<tr><td>Does a person need to see it first?</td><td>Risk tier</td><td>Platform-owned grade, approval with arguments</td></tr>
<tr><td>What happens if it runs twice?</td><td>Retries</td><td>Workflow-owned idempotency key</td></tr>
<tr><td>Can it combine with other tools to leak data?</td><td>Trifecta</td><td>Capability rules per agent</td></tr>
<tr><td>Can we see what it did?</td><td>Tracing</td><td><code>execute_tool</code> spans with call IDs</td></tr>
<tr><td>Can the agent recover when it fails?</td><td>Errors</td><td>Typed problem details</td></tr>
</tbody></table></div>

<h3 id="start">Where to start</h3>

<p>For a team with agents already running, the order that pays back fastest is usually:</p>

<ol>
<li><strong>Trace every tool call.</strong> It is cheap, it changes nothing about behaviour, and it shows which tools are actually used and how.</li>
<li><strong>Grade the tools.</strong> Most will be reads. The few irreversible ones are where approvals and idempotency keys are worth the effort.</li>
<li><strong>Fix identity on the risky tools.</strong> Start with the ones that move money or touch personal data, and pass the user through.</li>
<li><strong>Check each agent for the trifecta.</strong> It is a configuration review, not a project, and it closes the worst class of leak.</li>
</ol>

<p>The rest, better tool design and better errors, tends to follow once the traces show where agents get stuck. If you want to see three of these failures happen step by step, the <a href="https://agent-gateway-playground.vercel.app/">Agent Gateway Playground</a> runs them in the browser: a timeout and retry, a delegated permission check, and a 200 that was not a success.</p>
