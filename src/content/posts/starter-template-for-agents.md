---
title: "A starter template for new agents"
date: 2026-11-09
themes: ["developer-experience", "ai-platform-engineering"]
insight: "Tracing, budgets, evals and an owner are cheap on day one and expensive to add after launch. A starter template makes them the default instead of a checklist."
caveats:
  - title: "A template ages."
    text: "Agents created from last year's template keep last year's choices. Plan how updates reach existing agents, not only new ones."
  - title: "Too much in the template slows people down."
    text: "Every extra file is something a team has to understand before it can start. Include what every agent needs, and leave the rest as options."
  - title: "Defaults can be removed."
    text: "A template sets a starting point, not a rule. Checks that must never be skipped belong in the gateway or CI, where a team cannot delete them."
  - title: "It is not the same for every team."
    text: "A one-off internal script and a customer-facing agent need different weight. Offer a light path and a full path rather than one size."
sources:
  - title: "How We Use Golden Paths to Solve Fragmentation in Our Software Ecosystem"
    site: "engineering.atspotify.com"
    url: "https://engineering.atspotify.com/2020/8/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem"
  - title: "Backstage: software templates"
    site: "backstage.io"
    url: "https://backstage.io/docs/features/software-templates/"
  - title: "CNCF Platforms white paper"
    site: "tag-app-delivery.cncf.io"
    url: "https://tag-app-delivery.cncf.io/whitepapers/platforms/"
  - title: "Semantic conventions for generative AI client spans"
    site: "opentelemetry.io"
    url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/"
related: ["standardise-the-right-things", "time-to-first-production-call", "first-users-shape-the-design"]
---
<h3 id="idea">The idea in brief</h3>

<p>A new agent usually starts as a script that calls a model and a couple of tools. It works, people like it, and it goes to production. Tracing, cost limits, tests and an owner get added later, if at all, and each one means reworking code that was never built for it.</p>

<p>Spotify described its answer to this kind of drift in 2020 as a golden path: an opinionated, supported way to build a service, so teams make fewer decisions and stop reinventing the same parts. The same idea fits agents. The platform offers a template that already has the production basics in place, so the easy path and the safe path are the same.</p>

<ul>
<li>A new agent starts from a template, not from an empty folder.</li>
<li>Tracing, a token budget, a small eval set and an owner exist from the first commit.</li>
<li>The template is the platform's product. It is versioned, documented and kept up to date.</li>
<li>Checks that must not be skipped live in the gateway and CI, not only in the template.</li>
</ul>

<h3 id="contents">What goes in it</h3>

<pre><code># illustrative only
my-agent/
  agent.yaml          # name, owner, task types, model, risk class
  prompts/            # versioned, loaded from the registry by label
  tools/              # tool contracts: schema, example, risk class
  evals/
    cases/            # five starter cases, one marked must-pass
    run.yaml          # runs in CI on every change
  budget.yaml         # token and cost limits per task
  telemetry.py        # OpenTelemetry GenAI spans, wired up
  RUNBOOK.md          # how to pause, roll back and who to call</code></pre>

<p>Each file links back to something the platform already provides. Prompts come from the registry, so <a href="/posts/prompt-changes-are-deploys">prompt changes are deploys</a> from day one. Tool contracts follow the shape in <a href="/posts/what-mlops-already-solved">what MLOps already solved</a>. Tracing uses OpenTelemetry's GenAI conventions, so traces from every agent look the same in the trace store.</p>

<h3 id="split">What the template decides and what the team decides</h3>

<div class="tbl"><table>
<thead><tr><th>Part</th><th>Set by the template</th><th>Filled in by the team</th></tr></thead>
<tbody>
<tr><td>Tracing</td><td>Span names, task ID, prompt and model version</td><td>Task types</td></tr>
<tr><td>Budget</td><td>A conservative default limit</td><td>The real limit, once usage is known</td></tr>
<tr><td>Evals</td><td>Folder layout, CI job, grader setup</td><td>The cases themselves</td></tr>
<tr><td>Ownership</td><td>A required owner field that blocks deploy if empty</td><td>The owner's name and on-call rota</td></tr>
<tr><td>Tools</td><td>Contract format and gateway registration</td><td>Which tools, and their risk class</td></tr>
</tbody></table></div>

<p>The template should decide anything that must be the same across agents, such as span names and the contract format. The team decides what only it knows: what the agent is for and what good looks like.</p>

<h3 id="delivery">How it reaches people</h3>

<p>Backstage's software templates are one common way to offer this. A developer fills in a short form, and the template creates the repository, registers the agent in the catalogue and wires up CI. A plain repository template with a setup script works too. What matters more is the measure from <a href="/posts/time-to-first-production-call">measuring the journey to the first production call</a>: how long it takes a new team to go from the template to a traced, budgeted call in production.</p>

<h3 id="product">Treat it as a product</h3>

<p>The CNCF Platforms white paper describes internal platforms as products with users, not projects that finish. A template is a small version of that. It needs an owner, release notes, and a way to tell which agents are on an old version. When the template gains a new default, such as a kill switch or a new span attribute, existing agents should get an upgrade path, not just new ones.</p>

<h3 id="start">Where to start</h3>

<ol>
<li>Look at the last three agents that reached production and list what each one added after launch.</li>
<li>Put the items all three needed into a template: tracing, budget, evals, owner.</li>
<li>Make the owner field and the eval job required in CI.</li>
<li>Time a new team from template to first production call, and fix the slowest step.</li>
</ol>
