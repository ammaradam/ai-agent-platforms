---
title: "Cost per successful task, not per token"
date: 2026-11-09
themes: ["observability", "ai-platform-engineering"]
insight: "Token prices tell you what a call costs. What the business pays for is a task that got done, so the number to track is total cost divided by tasks that actually succeeded."
caveats:
  - title: "It depends on the definition of success."
    text: "If success is counted loosely, the number looks better than it is. Use the same outcome checks as the eval set, not the HTTP status."
  - title: "Human cost is hard to price."
    text: "The time a person spends fixing a failed run is real but rarely measured. A rough estimate per failure is better than leaving it out."
  - title: "Averages hide task types."
    text: "A cheap, easy task and an expensive, rare one should not share a number. Report the metric per task type."
  - title: "It is a trend, not a target on its own."
    text: "Cutting cost per success by dropping hard tasks is easy and useless. Track it next to the success rate and the volume of tasks handled."
sources:
  - title: "AI Agents That Matter"
    site: "arxiv.org"
    url: "https://arxiv.org/abs/2407.01502"
  - title: "FinOps for AI Overview"
    site: "finops.org"
    url: "https://www.finops.org/wg/finops-for-ai-overview/"
  - title: "Semantic conventions for generative AI client spans"
    site: "opentelemetry.io"
    url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/"
related: ["agent-success-is-not-a-200", "token-budgets-are-enforcement", "who-chooses-the-model"]
---
<h3 id="idea">The idea in brief</h3>

<p>Most AI cost dashboards report tokens and spend per model. Those numbers are easy to collect, and they answer the wrong question. A cheaper model that fails more often can cost more overall, once you count the retries, the loops and the person who has to finish the job by hand.</p>

<p>The useful unit is the cost of a task that actually got done. Kapoor and colleagues (2024) argue that agents should be evaluated on cost and accuracy together, not accuracy alone. The FinOps Foundation's overview of FinOps for AI makes the same point from the finance side: measure cost per successful outcome, not just spend.</p>

<ul>
<li>Cost per successful task = all cost for a task type ÷ tasks that succeeded.</li>
<li>All cost includes failed runs, retries, tool calls and human follow-up.</li>
<li>Success uses the same outcome check as the eval set.</li>
<li>Report it per task type, next to the success rate.</li>
</ul>

<h3 id="example">An illustrative example</h3>

<p>Two versions of a support agent each handle 1,000 refund requests. Version A uses a cheaper model. Version B uses a more capable one. Every failed request goes to a person, at a rough cost of $1.50 each.</p>

<div class="tbl"><table>
<thead><tr><th></th><th>Version A</th><th>Version B</th></tr></thead>
<tbody>
<tr><td>Model and tool cost</td><td>$20</td><td>$50</td></tr>
<tr><td>Tasks that succeeded</td><td>500</td><td>900</td></tr>
<tr><td>Failures sent to a person</td><td>500 × $1.50 = $750</td><td>100 × $1.50 = $150</td></tr>
<tr><td>Total cost</td><td>$770</td><td>$200</td></tr>
<tr><td><strong>Cost per successful task</strong></td><td><strong>$1.54</strong></td><td><strong>$0.22</strong></td></tr>
</tbody></table></div>

<p>On a token dashboard, Version A looks two and a half times cheaper. Per task that got done, it is about seven times more expensive. The numbers are made up, but the shape is common: the cost of failure usually sits outside the model bill.</p>

<h3 id="numerator">What goes on top</h3>

<p>The numerator is every cost the task caused, not only the final successful call.</p>

<ul>
<li><strong>Model calls</strong>, including retries and the extra turns of a loop. OpenTelemetry's GenAI conventions put input and output token counts on each model call span, so they can be summed per task.</li>
<li><strong>Tool calls</strong> that cost money, such as paid APIs, search or compute.</li>
<li><strong>Failed and abandoned runs.</strong> They cost the same tokens and produce nothing.</li>
<li><strong>Human follow-up</strong>, even as a flat estimate per escalation.</li>
</ul>

<p>To sum costs per task, every span in a run needs a shared task ID and a task type. Without them, spend can only be split by model or by team.</p>

<h3 id="denominator">What goes underneath</h3>

<p>The denominator is where most teams cut corners. A run that returned 200 is not a success. As <a href="/posts/agent-success-is-not-a-200">an earlier note on agent success</a> argued, success means the intended outcome happened: the right order was refunded, the ticket was actually resolved. Use the same check the eval set uses, and if production has no such check yet, sample and grade a slice of runs by hand.</p>

<h3 id="use">What the number is for</h3>

<p>It changes the questions people ask. Model choice becomes "which model gives the lowest cost per success for this task type", which may be the expensive one. A <a href="/posts/token-budgets-are-enforcement">token budget</a> can be set from what a successful task is worth. And a rising bill stops being alarming on its own when the cost per success is falling because the agent is handling more work.</p>

<h3 id="start">Where to start</h3>

<ol>
<li>Add a task ID and task type to every span in an agent run.</li>
<li>Pick one task type and define success with an outcome check.</li>
<li>Estimate the human cost of one failure for that task, even roughly.</li>
<li>Report cost per successful task weekly, next to the success rate and volume.</li>
</ol>
