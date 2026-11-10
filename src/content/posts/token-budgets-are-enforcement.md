---
title: "Token budgets are enforcement, not alerts"
date: 2026-11-08
themes: ["ai-platform-engineering", "ai-agents", "reliability"]
insight: "An agent's spend needs a limit the next model call cannot cross, not a chart someone reads the next morning."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7525898075995914240/"
caveats:
  - title: "Worst-case reservations are pessimistic."
    text: "Tight budgets with large output caps can block calls that would have fit."
  - title: "Prices need an owner."
    text: "Prices change and differ by provider, cached input and reasoning tokens, so the price table has to be kept current."
  - title: "A budget is not a value check."
    text: "It stops runaway spend. It does not tell you whether the spend was worth it; that takes evals."
  - title: "Shared budgets add latency."
    text: "Budgets shared across many gateways need a single store or careful reconciliation, which adds a step to every call."
sources:
  - title: "State of FinOps 2026"
    site: "data.finops.org"
    url: "https://data.finops.org/"
  - title: "The token debt problem: why enterprises can't control AI costs"
    site: "quali.com"
    url: "https://www.quali.com/blog/the-token-debt-problem-why-enterprises-cant-control-ai-costs/"
  - title: "LiteLLM: budgets and rate limits"
    site: "docs.litellm.ai"
    url: "https://docs.litellm.ai/docs/proxy/users"
related: ["gateway-errors-that-help", "tool-call-timeouts", "what-to-trace-for-agents"]
---
<h3 id="idea">The idea in brief</h3>

<p>A web service costs roughly the same per request whether it succeeds or fails. An agent does not. It decides how many calls to make, how much context to carry, and when to stop. A confused agent does not crash. It keeps working, and every extra loop costs more than the last.</p>

<p>Most teams answer this with a budget alert. An alert reports spend that has already happened. By the time someone reads it, the loop has run all night. A budget that protects anything has to be checked before the next call goes out, at a point the agent cannot route around.</p>

<ul>
<li>Agent cost grows with loops and carried context, so estimates based on a single call are badly wrong.</li>
<li>Alerts measure spend after it happens. Budgets have to be checked before each call is sent.</li>
<li>The check belongs in the gateway or runtime, keyed to a run, a user and a team, not inside the agent's prompt.</li>
<li>When a budget runs out, the agent should stop cleanly with a clear reason and a saved state, not fail halfway through a write.</li>
</ul>

<h3 id="why">Why agent cost behaves differently</h3>

<p>Three things make agent spend hard to predict.</p>

<ul>
<li><strong>Loops.</strong> The model decides when it is done. A planner and a checker that disagree can keep handing work back to each other.</li>
<li><strong>Carried context.</strong> Each step usually resends the history so far. Step 20 costs more than step 2, even when it does less.</li>
<li><strong>Retries.</strong> A failed tool call often leads to another model call to recover, which adds tokens on top of the failure.</li>
</ul>

<p>None of these show up in a cost estimate built from one prompt and one reply.</p>

<p>The effects are now visible at company scale. The State of FinOps 2026 reports that 98% of respondents manage AI spend, up from 31% in 2024, and that AI cost management is the skill teams most want to build. In April 2026, Uber's CTO said the company had used its whole 2026 budget for AI coding tools in four months, as reported by The Information and summarised by Quali.</p>

<p>At the scale of a single run, the risk is simple: when nothing in the system is allowed to say stop, one confused run can spend days of budget before anyone looks at the bill.</p>

<h3 id="late">Why alerts arrive too late</h3>

<figure><div class="fig-scroll"><svg viewBox="0 0 524 300" role="img" aria-label="With alerts only, the agent calls the model, usage is logged, an alert fires and someone reads it later. With enforcement, every call first checks whether a reservation fits the budget; if it does the model is called and the real cost settled, and if not the run stops cleanly."><defs><marker id="tb-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="tb-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><text x="8" y="24" font-size="11" style="fill:currentColor;opacity:.62;font-weight:600;">Alert only</text><rect x="8" y="36" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="66" y="60" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Agent calls model</text><rect x="138" y="36" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="196" y="60" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Usage logged</text><rect x="268" y="36" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="326" y="60" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Alert fires</text><rect x="398" y="36" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="456" y="60" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Someone reads it</text><line x1="124" y1="56" x2="137" y2="56" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#tb-a)"/><line x1="254" y1="56" x2="267" y2="56" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#tb-a)"/><line x1="384" y1="56" x2="397" y2="56" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#tb-a)"/><text x="262" y="100" font-size="11" text-anchor="middle" style="fill:currentColor;opacity:.62;">By the time it fires, the spend has already happened</text><text x="8" y="132" font-size="11" style="fill:hsl(var(--brand));font-weight:600;">Enforcement</text><path d="M456 168 V146 H90 V166" style="fill:none;stroke:currentColor;stroke-opacity:0.4;stroke-width:1.2;stroke-dasharray:4 3;" marker-end="url(#tb-a)"/><text x="272" y="141" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">next step</text><rect x="8" y="168" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="66" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Agent wants a call</text><polygon points="138,188 196,158 254,188 196,218" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="196" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">Reserve fits?</text><rect x="268" y="168" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="326" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Call the model</text><rect x="398" y="168" width="116" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="456" y="192" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Settle real cost</text><line x1="124" y1="188" x2="137" y2="188" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#tb-a)"/><line x1="254" y1="188" x2="267" y2="188" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#tb-a)"/><text x="261" y="172" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">yes</text><line x1="384" y1="188" x2="397" y2="188" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#tb-a)"/><line x1="196" y1="218" x2="196" y2="242" style="stroke:hsl(var(--brand));stroke-width:1.4;" marker-end="url(#tb-b)"/><text x="204" y="234" font-size="10.5" style="fill:hsl(var(--brand));">no</text><rect x="106" y="244" width="180" height="46" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="196" y="263" font-size="12" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">Stop cleanly</text><text x="196" y="280" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">save state, return the reason</text></svg></div><figcaption>The model proposes a call. Code in front of the model decides whether the budget allows it, and stops the run cleanly when it does not.</figcaption></figure>

<h3 id="run">1. Budget the run, not only the month</h3>

<p>Monthly team budgets catch slow drift. They do nothing about one run that burns a week's allowance overnight. Give every run an ID and a ceiling, then nest it: run inside user, user inside team. Each call is checked against all three, and the tightest one wins.</p>

<h3 id="reserve">2. Check before the call, then settle after</h3>

<p>The exact cost of a call is only known once it returns. The input size is known before it is sent, and the output can be capped with a maximum token setting. Reserve the worst case before sending, then settle to the real usage afterwards, the way a card payment is authorised and then captured.</p>

<pre><code># illustrative only
worst_case = price(model, input_tokens, max_output_tokens)
if not budgets.reserve(run_id, user_id, team_id, worst_case):
    return stop("budget_exhausted", run_id)

response = call_model(request, max_output_tokens=max_output_tokens)
budgets.settle(run_id, reserved=worst_case, actual=price_of(response.usage))</code></pre>

<p>Without the reservation, ten parallel calls can each see enough budget left, and together overspend it.</p>

<h3 id="gateway">3. Enforce in the gateway, not in the prompt</h3>

<p>Telling a model "you have 50,000 tokens left" can help it plan. It is not a control: the model can ignore it or miscount. The check has to sit where every call passes, such as an AI gateway or the agent runtime, so no agent can route around it. Gateways like LiteLLM already support budgets per key, user and team.</p>

<h3 id="steps">4. Limit steps and time as well as tokens</h3>

<p>Tokens are not the only thing that runs away. Paid tools, search APIs and sandboxes cost money per call, and a loop of cheap steps still burns time. Set a maximum number of steps, tool calls and minutes per run alongside the token budget.</p>

<h3 id="cleanly">5. Run out cleanly</h3>

<p>Hitting a budget is an expected outcome, not a crash. Use two levels:</p>

<ul>
<li><strong>Soft limit</strong>, for example 80% of the budget: tell the agent to wrap up, or move it to a cheaper model.</li>
<li><strong>Hard limit</strong>: refuse the next call, save the run's state, and return a clear reason.</li>
</ul>

<p>The refusal should say which budget ran out, how much was spent, and how to resume, as argued in <a href="/posts/gateway-errors-that-help">gateway errors that help</a>. Never stop between a write and its confirmation. The note on <a href="/posts/tool-call-timeouts">tool-call timeouts</a> covers why a half-finished write is the expensive kind of failure.</p>

<h3 id="trace">6. Put cost on the trace, and fail closed</h3>

<p>Record tokens and cost on each step of the run's trace, as covered in <a href="/posts/what-to-trace-for-agents">what to put in an agent trace</a>. That turns "this run hit its budget" into "this step resent the whole history six times". It also gives real data for setting the limits.</p>

<p>Decide what happens when the meter itself is down. LiteLLM's docs note that its budgets need a database and are not enforced without one. For agents that can write or spend, failing closed is usually the safer default.</p>

<h3 id="together">Putting it together</h3>

<div class="tbl"><table>
<thead><tr><th>Pattern</th><th>Stops</th><th>Lives in</th></tr></thead>
<tbody>
<tr><td>Budget the run</td><td>One run eating a team's allowance</td><td>Gateway budget store</td></tr>
<tr><td>Reserve, then settle</td><td>Parallel calls overspending together</td><td>Gateway, before each call</td></tr>
<tr><td>Enforce outside the prompt</td><td>Agents ignoring or miscounting limits</td><td>Gateway or runtime</td></tr>
<tr><td>Step and time limits</td><td>Cheap loops and paid tool calls</td><td>Agent runtime</td></tr>
<tr><td>Soft and hard limits</td><td>Half-finished work at the cutoff</td><td>Runtime and gateway errors</td></tr>
<tr><td>Cost on the trace</td><td>Limits nobody can explain or tune</td><td>Tracing pipeline</td></tr>
</tbody></table></div>

<h3 id="start">Where to start</h3>

<ol>
<li>Give every agent run an ID and pass it through every model and tool call.</li>
<li>Record tokens and cost per run for two weeks before setting any limit.</li>
<li>Set a hard per-run ceiling well above the normal spend you observed, so it only stops runaway runs.</li>
<li>Add the soft limit and the clean stop once the hard limit has fired at least once and you have seen what it interrupts.</li>
</ol>
