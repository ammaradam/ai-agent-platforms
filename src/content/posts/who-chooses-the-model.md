---
title: "Who chooses the model: the application or the platform?"
date: 2026-09-24
themes: ["ai-platform-engineering"]
insight: "Pinning a model version gives reproducibility; letting a platform route by requirements eases upgrades. Model retirement schedules make the trade-off concrete."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7508797932775624704/"
caveats:
  - title: "Vendor details vary."
    text: "Lifecycle lengths and notice periods differ by provider and model family, and can change."
  - title: "Automatic upgrades change behaviour."
    text: "A newer version can respond differently, so evaluation is still needed before relying on it."
  - title: "Routing adds a layer."
    text: "A platform that picks models on the application's behalf takes on responsibility for explaining what ran."
sources:
  - title: "Foundry models lifecycle and retirement"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements"
  - title: "Model deprecations and retirements"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/model-lifecycle-retirement"
  - title: "OpenTelemetry GenAI semantic conventions"
    site: "github.com"
    url: "https://github.com/open-telemetry/semantic-conventions-genai"
related: ["standardise-the-right-things", "hide-complexity-not-evidence"]
---
<h3 id="idea">The idea in brief</h3>

<p>Choosing a deployment by name is simple, but it ties an application to a specific model version, region and price. Model versions also have a published end of life. Microsoft's documentation for models in Azure AI Foundry is a useful public example of how that lifecycle works.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 320" role="img" aria-label="Pinning ties the app to one version until it retires; routing by requirement lets the platform move to a newer one."><defs><marker id="d7-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d7-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><text x="30" y="20" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="30" dy="0">A. App pins a version</tspan></text><text x="250" y="20" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="250" dy="0">B. App states its needs</tspan></text><rect x="30" y="36" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="56" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">Application</tspan></text><rect x="250" y="36" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="340" y="56" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="340" dy="0">Application</tspan></text><line x1="120" y1="76" x2="120" y2="114" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d7-a)"/><text x="128" y="95" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="128" dy="0">model-x v1</tspan></text><line x1="340" y1="76" x2="340" y2="114" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d7-b)"/><text x="348" y="95" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="348" dy="0">latency, cost, region</tspan></text><rect x="30" y="116" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="120" y="136" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">Deployment v1</tspan></text><rect x="250" y="116" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="340" y="136" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="340" dy="0">Platform router</tspan></text><line x1="120" y1="156" x2="120" y2="198" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;stroke-dasharray:4 4;" marker-end="url(#d7-a)"/><text x="128" y="177" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="128" dy="0">retires</tspan></text><rect x="30" y="200" width="180" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;stroke-dasharray:5 5;"/><text x="120" y="220" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="120" dy="0">410 Gone</tspan></text><line x1="300" y1="156" x2="292" y2="198" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;stroke-dasharray:4 4;" marker-end="url(#d7-a)"/><line x1="380" y1="156" x2="388" y2="198" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d7-b)"/><rect x="250" y="200" width="84" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.18;stroke-width:1.2;"/><text x="292" y="220" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;font-weight:500;"><tspan x="292" dy="0">v1</tspan></text><rect x="346" y="200" width="84" height="40" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="388" y="220" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="388" dy="0">v2</tspan></text><text x="250" y="254.85" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="250" dy="0">records which model answered</tspan><tspan x="250" dy="14.3">(gen_ai.response.model)</tspan></text><text x="30" y="254.85" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="30" dy="0">app must change</tspan><tspan x="30" dy="14.3">before the date</tspan></text></svg></div><figcaption>Pinning ties the app to one version until it retires; routing by requirement lets the platform move to a newer one.</figcaption></figure>

<h3 id="lifecycle">Models have a lifecycle</h3>

<p>Microsoft's model lifecycle documentation describes stages from Preview through Generally Available, Legacy, Deprecated and Retired. Some details it lists:</p>

<ul>
<li>A standard GA model lifecycle of 18 months from launch, with the retirement date published at launch.</li>
<li>At least 60 days' notice before a GA model retires, and at least 30 days for preview models.</li>
<li>After retirement, existing deployments stop working and inference requests return <code>410 Gone</code>.</li>
</ul>

<p>For an application that hard-codes a deployment, retirement means a change and a redeploy before the date.</p>

<h3 id="upgrade">Built-in upgrade options</h3>

<p>The same docs describe a <code>versionUpgradeOption</code> setting for standard deployments:</p>

<div class="tbl"><table>
<thead><tr><th>Value</th><th>Behaviour described in the docs</th></tr></thead>
<tbody>
<tr><td><code>OnceNewDefaultVersionAvailable</code></td><td>Upgrades when a new default version is set</td></tr>
<tr><td><code>OnceCurrentVersionExpired</code></td><td>Upgrades only at retirement</td></tr>
<tr><td><code>NoAutoUpgrade</code></td><td>Never upgrades; the deployment stops working at retirement</td></tr>
</tbody></table></div>

<p>The docs note that provisioned deployments are not upgraded automatically and need a manual migration. They also suggest evaluating replacement models on your own data, comparing quality, latency and cost.</p>

<h3 id="tradeoff">The trade-off</h3>

<ul>
<li><strong>Application pins the model:</strong> behaviour is reproducible and testable, which matters for evaluation, but every retirement needs a change.</li>
<li><strong>Platform chooses by requirement</strong> (latency, cost, data location): upgrades are easier, but the exact model behind a response can change, so it needs to be recorded, for example with the <code>gen_ai.response.model</code> attribute from OpenTelemetry.</li>
</ul>
