---
title: "Pause the call, not the agent"
date: 2026-11-08
themes: ["ai-agents", "identity-security", "reliability"]
insight: "A kill switch stops an agent after something has gone wrong. A pause stops it at the one call that can't be undone."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7526622525703909376/"
caveats:
  - title: "A pause is only as good as its reader."
    text: "Busy approvers click yes. Keep pauses rare so each one gets real attention."
  - title: "Grading tools is a judgement call."
    text: "A tool's risk can depend on its arguments, such as a refund of 5 versus 50,000."
  - title: "Durable pauses add moving parts."
    text: "They need a state store, an approval service and expiry handling."
  - title: "A pause does not stop prompt injection."
    text: "It limits what an injected instruction can do without a person seeing it."
sources:
  - title: "CrowdStrike Introduces the AI Kill Switch for AI Safety"
    site: "ir.crowdstrike.com"
    url: "https://ir.crowdstrike.com/node/17956/pdf"
  - title: "LLM06:2025 Excessive Agency"
    site: "genai.owasp.org"
    url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
  - title: "LangGraph: interrupts"
    site: "docs.langchain.com"
    url: "https://docs.langchain.com/oss/python/langgraph/interrupts"
related: ["patterns-for-safe-tool-calls", "tool-call-timeouts", "token-budgets-are-enforcement"]
---
<h3 id="idea">The idea in brief</h3>

<p>Most of what an agent does is cheap to get wrong. A bad search, a clumsy draft, or a wasted read can be redone. A small number of calls are different: sending an email, issuing a refund, deleting a record, or merging to production. Once those run, no retry or rollback brings the world back.</p>

<p>That makes the irreversible call the place to stop and check, not the whole run. Pausing every step makes the agent useless. Pausing nothing leaves an emergency stop as the only control, and by the time someone presses it, the email has already been sent.</p>

<ul>
<li>Put the pause on the call, not the agent: only irreversible or external actions wait for a person.</li>
<li>A pause has to survive a restart. The run's state is saved, so approval can come minutes or days later.</li>
<li>The approver sees the exact arguments that will run, not the agent's summary of them.</li>
<li>No answer means no. A pause that times out cancels the call; it never goes ahead by default.</li>
</ul>

<h3 id="why">Kill switches are arriving, and they solve a different problem</h3>

<p>On 3 November 2026, CrowdStrike announced an AI Kill Switch in Falcon Guardian. An administrator can stop an agent, block it from restarting, and cut its network access, starting at the AI gateway, with every action logged. It is a useful control, and it says a lot that security vendors now sell agents with a brake attached.</p>

<p>A kill switch answers the question "this agent is misbehaving, make it stop". Someone has to notice first, and then act. That works for an agent that has gone rogue over minutes or hours. It does not help with the single refund that went out three seconds after the model decided to send it.</p>

<p>The older guidance still applies. OWASP's Excessive Agency entry recommends requiring a person to approve high-impact actions before they are taken, and placing that approval inside the function that performs the action. That is the pause: a check built into the call itself, not a button someone has to find in time.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 520 224" role="img" aria-label="An agent proposes a call. If it is not irreversible it runs now. If it is, the run pauses, saves its state and shows the arguments to a person. Approval runs the approved arguments; a denial or no answer cancels the call and stops cleanly."><defs><marker id="pc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker></defs><rect x="4" y="40" width="120" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="64" y="64" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Agent proposes call</text><polygon points="136,60 194,30 252,60 194,90" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="194" y="64" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Irreversible?</text><rect x="264" y="38" width="120" height="44" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="324" y="57" font-size="12" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">Pause the run</text><text x="324" y="73" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">save state, show args</text><rect x="394" y="40" width="120" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="454" y="64" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Person decides</text><line x1="124" y1="60" x2="135" y2="60" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pc-a)"/><line x1="252" y1="60" x2="263" y2="60" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pc-a)"/><text x="258" y="30" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">yes</text><line x1="384" y1="60" x2="393" y2="60" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pc-a)"/><line x1="194" y1="90" x2="194" y2="167" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pc-a)"/><text x="202" y="132" font-size="10.5" style="fill:currentColor;opacity:.62;">no</text><path d="M434 80 V120 H324 V167" style="fill:none;stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pc-a)"/><text x="379" y="113" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">deny or no answer</text><line x1="474" y1="80" x2="474" y2="167" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pc-a)"/><text x="468" y="140" font-size="10.5" text-anchor="end" style="fill:currentColor;opacity:.62;">approve</text><rect x="134" y="168" width="120" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="194" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Run it now</text><rect x="264" y="168" width="120" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="324" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Cancel, stop cleanly</text><rect x="394" y="168" width="120" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="454" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Run approved args</text></svg></div><figcaption>Most calls run straight through. An irreversible one saves the run and waits; a missing answer counts as no.</figcaption></figure>

<h3 id="grade">1. Pause the risky calls, not the whole agent</h3>

<p>Grade each tool by what it can do: read, reversible write, or irreversible and external. Only the last group waits for a person. <a href="/posts/patterns-for-safe-tool-calls">Patterns for agent tool calls</a> covers how to grade tools. If everything pauses, people approve without reading, and the pause stops meaning anything.</p>

<h3 id="save">2. Save the run, not just the request</h3>

<p>Approval can take seconds or days, and the process that asked may have restarted by then. The pause has to write the run's state somewhere durable and release the worker. LangGraph's interrupts work this way: the graph's state is saved by a checkpointer, keyed by a thread ID, and resumed later with the person's answer. Its docs recommend a database-backed checkpointer in production.</p>

<h3 id="args">3. Show the arguments, and approve exactly those</h3>

<p>The approver should see what will actually run: the recipient, the amount, the record ID. The agent's summary of it is not enough, because the summary can be wrong. Bind the approval to those arguments, so a changed amount needs a new approval.</p>

<pre><code># illustrative only
request = {"tool": "refund_order", "args": {"order_id": 9917, "amount": 24000}}
approval = approvals.ask(run_id, request, digest=sha256(canonical(request)))

# later, at execution time
if approval.digest != sha256(canonical(request)):
    return stop("approval_mismatch", run_id)</code></pre>

<h3 id="expiry">4. No answer means no</h3>

<p>Every pause needs an expiry. When it passes, the call is cancelled and the run ends with a clear reason. A pause that goes ahead when nobody answers is not a control. It is a delay.</p>

<h3 id="resume">5. Resume without doing things twice</h3>

<p>Resuming often re-runs some work. LangGraph's docs say the node restarts from its beginning when resumed, so side effects before the pause must be idempotent. Put the irreversible call after the approval, and reuse the same idempotency key on every attempt. The note on <a href="/posts/tool-call-timeouts">tool-call timeouts</a> explains why.</p>

<h3 id="kill">6. Keep a kill switch for the whole run</h3>

<p>A pause covers one call. A kill switch covers everything an agent is doing. Teams need both, and both belong where every call passes, such as the gateway. Decide in advance who may press each one, and record every press.</p>

<h3 id="together">Putting it together</h3>

<div class="tbl"><table>
<thead><tr><th>Pattern</th><th>Stops</th><th>Lives in</th></tr></thead>
<tbody>
<tr><td>Pause only risky calls</td><td>Approval fatigue</td><td>Tool risk grades</td></tr>
<tr><td>Save the run</td><td>Lost work when approval is slow</td><td>Durable run state</td></tr>
<tr><td>Approve the arguments</td><td>A different call running than the one approved</td><td>Gateway, at execution</td></tr>
<tr><td>No answer means no</td><td>Actions going ahead unreviewed</td><td>Approval service</td></tr>
<tr><td>Resume without repeats</td><td>Duplicate side effects after resume</td><td>Workflow and idempotency keys</td></tr>
<tr><td>Kill switch per run</td><td>A misbehaving agent continuing</td><td>Gateway, with audit log</td></tr>
</tbody></table></div>

<h3 id="start">Where to start</h3>

<ol>
<li>List the tools your agents can call and mark the ones that send, pay, delete or deploy.</li>
<li>Put a pause in front of those calls only, with an expiry that cancels.</li>
<li>Make the approval screen show the raw arguments, and check them again at execution.</li>
<li>Test a resume after a restart, and confirm nothing runs twice.</li>
</ol>
