---
title: "Prompt changes are deploys"
date: 2026-11-09
themes: ["ai-platform-engineering", "reliability"]
insight: "A prompt edit changes production behaviour as much as a code change does, so it needs the same version, review, test and rollback, even when it skips the code pipeline."
caveats:
  - title: "Not every edit needs the full process."
    text: "A typo fix in a help message and a change to tool-use instructions carry different risk. Scale the checks to what the prompt controls."
  - title: "Evals only cover what they contain."
    text: "A prompt can pass the release suite and still fail on cases nobody wrote down. A canary catches some of what the suite misses."
  - title: "Rollback has a delay."
    text: "Registries usually cache prompts in the client. Moving a label back takes effect only when the cache refreshes, so know that interval before you need it."
  - title: "The model changes too."
    text: "The same prompt can behave differently after a model update. Record the model version next to the prompt version, or the history is incomplete."
sources:
  - title: "Site Reliability Engineering: Introduction"
    site: "sre.google"
    url: "https://sre.google/sre-book/introduction/"
  - title: "Prompt version control"
    site: "langfuse.com"
    url: "https://langfuse.com/docs/prompt-management/features/prompt-version-control"
  - title: "Manage prompt lifecycles with aliases"
    site: "mlflow.org"
    url: "https://mlflow.org/docs/latest/genai/prompt-registry/manage-prompt-lifecycles-with-aliases/"
  - title: "Demystifying evals for AI agents"
    site: "anthropic.com"
    url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
related: ["traces-into-eval-sets", "testing-agents-before-release", "what-mlops-already-solved"]
---
<h3 id="idea">The idea in brief</h3>

<p>In many teams, code goes through review, tests and a staged rollout, while the prompt that decides what the agent actually does is edited in a dashboard and goes live at once. The prompt is often the riskier change. It can alter which tools are called, what the agent refuses, and how it phrases a refund.</p>

<p>The Google SRE book (2016) notes that roughly 70% of outages come from changes to a live system. A prompt edit is one of those changes. It deserves the same handling as any other deploy, even when it travels outside the code pipeline.</p>

<ul>
<li>Every prompt has immutable versions. Production points to a label, not to "latest".</li>
<li>A change runs against the eval set before it reaches the production label.</li>
<li>Risky changes go to a slice of traffic first.</li>
<li>Rollback is moving a label back, and every trace records which version ran.</li>
</ul>

<h3 id="why">Why prompts slip through</h3>

<p>Prompts often live outside the code so that non-engineers can change them without a release. That is a good reason. The mistake is treating "without a release" as "without checks". The edit still changes production behaviour. It just leaves no pull request and no deploy record behind, so when behaviour shifts on a Tuesday afternoon, nobody can say what changed.</p>

<h3 id="versions">Versions and labels</h3>

<p>Prompt registries have settled on a common shape. Langfuse and MLflow both keep each prompt version immutable and use a movable pointer, a label in Langfuse and an alias in MLflow, to say which version an environment uses. The application asks for <code>production</code> and gets whatever version the label points to.</p>

<p>This gives you three things at once. A change is a new version, so the old one is never lost. Promotion is a deliberate act of moving a label. Rollback is moving it back, with no code change.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 520 160" role="img" aria-label="A prompt edit creates a new version, which runs against the eval set, then serves a canary slice of traffic, then receives the production label. A rollback moves the label back to the previous version."><defs><marker id="pd-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker></defs><rect x="4" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="59" y="50" font-size="11.5" text-anchor="middle" style="fill:currentColor;">New version</text><text x="59" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">v14, immutable</text><rect x="138" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="193" y="50" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Eval set</text><text x="193" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">must not regress</text><rect x="272" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="327" y="50" font-size="11.5" text-anchor="middle" style="fill:currentColor;">Canary</text><text x="327" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">5% of traffic</text><rect x="406" y="30" width="110" height="44" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="461" y="50" font-size="12" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">production</text><text x="461" y="65" font-size="10" text-anchor="middle" style="fill:currentColor;opacity:.62;">label moves to v14</text><line x1="114" y1="52" x2="137" y2="52" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pd-a)"/><line x1="248" y1="52" x2="271" y2="52" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pd-a)"/><line x1="382" y1="52" x2="405" y2="52" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#pd-a)"/><path d="M461 74 V112 H59 V75" style="fill:none;stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;stroke-dasharray:4 3;" marker-end="url(#pd-a)"/><text x="260" y="130" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">rollback: move the label back to v13, no code change</text></svg></div><figcaption>Promotion and rollback are both label moves. The versions themselves never change.</figcaption></figure>

<h3 id="test">Test before the label moves</h3>

<p>An eval set built from real failures, as described in <a href="/posts/traces-into-eval-sets">turning traces into an eval set</a>, is the test suite for prompts. Run it on every new version and compare it with the version currently in production. Anthropic's guide to agent evals recommends grading what the agent did, such as which tool ran with which arguments, rather than the wording of its reply. That matters here, because a prompt change often keeps the tone and quietly changes the action.</p>

<p>Block promotion when a version is worse on any case marked as must-pass, even if the average goes up.</p>

<h3 id="record">Record which version ran</h3>

<p>A rollback is only useful if you can tell a prompt problem from everything else. Put the prompt name and version on every model call span, next to the model version. When a failure rate moves, the trace store can then split it by prompt version and show whether v14 is the cause.</p>

<h3 id="levels">Matching checks to risk</h3>

<div class="tbl"><table>
<thead><tr><th>Change</th><th>Example</th><th>Checks</th></tr></thead>
<tbody>
<tr><td>Wording only</td><td>Friendlier greeting</td><td>New version, eval set</td></tr>
<tr><td>Behaviour</td><td>When to ask a clarifying question</td><td>Eval set, review by agent owner</td></tr>
<tr><td>Tools or policy</td><td>When a refund needs approval</td><td>Eval set, review, canary, named approver</td></tr>
</tbody></table></div>

<h3 id="start">Where to start</h3>

<ol>
<li>Move production prompts into a registry with immutable versions and a <code>production</code> label.</li>
<li>Run the eval set on every new version and block promotion on must-pass failures.</li>
<li>Add the prompt version to every model call span.</li>
<li>Practise one rollback before you need it, and time how long it takes to take effect.</li>
</ol>
