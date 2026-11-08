---
title: "Turning agent traces into an eval set"
date: 2026-11-08
themes: ["observability", "ai-agents", "reliability"]
insight: "The best release tests for an agent come from what it got wrong last week, so the trace store should be the main source of test cases, not an archive."
caveats:
  - title: "Traces carry personal data."
    text: "A failed trace often holds the exact prompt, arguments and results that made it fail. Redact or rewrite before it becomes a test case kept for years."
  - title: "A trace is not a label."
    text: "It records what happened, not what should have happened. Someone still has to write the expected outcome, and that is the slow part."
  - title: "Old cases go stale."
    text: "Tools, prompts and policies change. A case built for last quarter's tools can fail for reasons that no longer matter, so the set needs pruning as well as growth."
  - title: "Production only shows what users tried."
    text: "Rare and dangerous cases may never appear in traces. Hand-written cases still cover what must never happen."
sources:
  - title: "Agent Evaluation Readiness Checklist"
    site: "langchain.com"
    url: "https://www.langchain.com/blog/agent-evaluation-readiness-checklist"
  - title: "Demystifying evals for AI agents"
    site: "anthropic.com"
    url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
  - title: "Your AI Product Needs Evals"
    site: "hamel.dev"
    url: "https://hamel.dev/blog/posts/evals/"
  - title: "Cookbook: evaluating agent traces from Hugging Face"
    site: "braintrust.dev"
    url: "https://braintrust.dev/docs/cookbook/recipes/HuggingFaceAgentTraces"
related: ["what-to-trace-for-agents", "testing-agents-before-release", "agent-success-is-not-a-200"]
---
<h3 id="idea">The idea in brief</h3>

<p>Two earlier notes covered <a href="/posts/what-to-trace-for-agents">what to put in an agent trace</a> and <a href="/posts/testing-agents-before-release">how to test an agent before release</a>. They are usually owned by different people. One team keeps traces for debugging; another writes evals from imagined cases. The two rarely meet.</p>

<p>They should. Every failed run in the trace store is a test case someone has already paid for. The work is turning it into one: picking the right traces, removing what should not be kept, writing down what should have happened, and running it on every release.</p>

<ul>
<li>Read failed traces by hand before building anything. The failure types come from reading, not from a dashboard.</li>
<li>A trace becomes a case when it has an input, a starting state and an expected outcome. The trace supplies the first two.</li>
<li>Clean the case before storing it. An eval set is kept far longer than a trace.</li>
<li>Every fixed incident adds a case, so the same failure cannot come back unnoticed.</li>
</ul>

<h3 id="read">1. Read before you automate</h3>

<p>LangChain's 2026 readiness checklist suggests reviewing 20 to 50 real traces by hand before writing any eval code. Hamel Husain's guide (2024) makes the same point: looking at real data is what shows which failures matter. A short session of reading usually sorts failures into a few groups, such as the wrong tool, the right tool with bad arguments, a stop too early, or a correct action with a wrong final answer.</p>

<p>Those groups decide what the eval set needs. Ten cases of one failure type tell you more than one case each of ten types nobody has seen.</p>

<h3 id="shape">2. Give each case a shape</h3>

<p>A trace shows what the agent did. A test case also needs what it should have done. The structure the trace note recommends, recording the user, the tools that ran and how each call ended, is enough to rebuild most of a case.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 520 150" role="img" aria-label="A failed trace is reviewed and labelled, then cleaned of personal data, then stored as a case with an input, a starting state and an expected outcome, which runs on every release."><defs><marker id="te-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker></defs><rect x="4" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="59" y="50" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Failed trace</text><text x="59" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">from production</text><rect x="138" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="193" y="50" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Review and label</text><text x="193" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">failure type</text><rect x="272" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="327" y="50" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Clean</text><text x="327" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">redact, rewrite</text><rect x="406" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="461" y="50" font-size="12" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">Eval case</text><text x="461" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">input + expected</text><line x1="114" y1="52" x2="137" y2="52" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#te-a)"/><line x1="248" y1="52" x2="271" y2="52" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#te-a)"/><line x1="382" y1="52" x2="405" y2="52" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#te-a)"/><path d="M461 74 V112 H59 V75" style="fill:none;stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#te-a)"/><text x="260" y="130" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">runs on every release; new failures feed back in</text></svg></div><figcaption>The trace supplies the input and the starting state. A person supplies the expected outcome.</figcaption></figure>

<pre><code># illustrative only
case = {
  "id": "refund-wrong-order-0412",
  "source_trace": "trace_9f2c...",          # kept for reference, not copied
  "input": "Refund the second order, not the first",
  "state": {"orders": [{"id": 1, "paid": 120}, {"id": 2, "paid": 45}]},
  "expected": {"tool": "refund_order", "args": {"order_id": 2}},
  "never": ["refund_order(order_id=1)"],
  "failure_type": "wrong_arguments",
}</code></pre>

<p>Anthropic's guide to agent evals recommends grading the state the agent leaves behind rather than the wording of its reply. A trace makes that practical, because it records the starting state and the calls that changed it.</p>

<h3 id="clean">3. Clean the case, not just the trace</h3>

<p>The trace note argued for keeping content out of traces by default and capturing it only when needed. A failed run is often exactly when it was captured. Before a trace becomes a case, replace names, emails, account numbers and free text with realistic stand-ins. Keep the shape that made it fail: the two orders with different amounts, the vague request, the tool that timed out.</p>

<p>Link to the source trace by ID rather than copying it. The trace can then expire on its normal schedule while the case lives on.</p>

<h3 id="loop">4. Close the loop on every incident</h3>

<p>Braintrust's cookbook describes turning a cluster of bad production traces into a targeted dataset. The habit that matters is simpler: no incident is closed until its trace is a case in the release suite. That turns the eval set into a record of what has actually gone wrong, and stops the same failure shipping twice.</p>

<h3 id="together">Putting it together</h3>

<div class="tbl"><table>
<thead><tr><th>Step</th><th>Owner</th><th>Output</th></tr></thead>
<tbody>
<tr><td>Sample failed and flagged traces</td><td>Platform, from the trace store</td><td>A weekly review queue</td></tr>
<tr><td>Read and label</td><td>Agent team</td><td>Failure types</td></tr>
<tr><td>Write expected outcome</td><td>Agent team, with domain owner</td><td>Expected state and banned actions</td></tr>
<tr><td>Clean</td><td>Platform tooling</td><td>A case with no personal data</td></tr>
<tr><td>Run on release</td><td>CI</td><td>A pass rate per failure type</td></tr>
</tbody></table></div>

<h3 id="start">Where to start</h3>

<ol>
<li>Pull the last 30 failed or thumbs-down runs and read them in one sitting.</li>
<li>Group them by failure type and turn the largest group into five cases.</li>
<li>Add a rule that every closed incident leaves one new case behind.</li>
<li>Prune cases that fail only because a tool or policy has since changed.</li>
</ol>
