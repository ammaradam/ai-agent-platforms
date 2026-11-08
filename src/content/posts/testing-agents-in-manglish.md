---
title: "Testing agents in Manglish"
date: 2026-11-08
themes: ["ai-agents", "reliability"]
insight: "If users mix English and Malay in one sentence, the eval set has to as well. An agent that passes in clean English has only been tested on the users who write like the test author."
caveats:
  - title: "There is no standard Manglish."
    text: "It varies by region, age, community and platform. A small, local set of real phrasing beats a large set of invented phrasing."
  - title: "Synthetic code-switching sounds wrong."
    text: "Models asked to write Manglish tend to produce stiff or exaggerated text. Use it to fill gaps, not as the main source."
  - title: "Graders can misread it too."
    text: "A model grader that struggles with mixed text will mark good answers wrong or bad ones right. Check its verdicts against a fluent reviewer."
  - title: "Published benchmarks are thin."
    text: "Little public work targets Malaysian code-switching in agent tasks, so most of the evidence has to come from your own users."
sources:
  - title: "CS-Sum: A Benchmark for Code-Switching Dialogue Summarization and the Limits of Large Language Models"
    site: "arxiv.org"
    url: "https://arxiv.org/abs/2505.13559"
  - title: "Multilingual Large Language Models Are Not (Yet) Code-Switchers"
    site: "arxiv.org"
    url: "https://arxiv.org/abs/2305.14235"
  - title: "SEA-HELM: Southeast Asian Holistic Evaluation of Language Models"
    site: "arxiv.org"
    url: "https://arxiv.org/abs/2502.14301"
related: ["testing-agents-before-release", "traces-into-eval-sets", "patterns-for-safe-tool-calls"]
---
<h3 id="idea">The idea in brief</h3>

<p>Most agent evals are written in tidy English by the people who built the agent. Many real users, in Malaysia at least, do not write that way. A single message can move between English, Malay and a few Chinese or Tamil words, with particles such as <em>lah</em>, <em>kan</em> and <em>je</em> changing the tone, and spelling that follows speech rather than a dictionary.</p>

<p>For a chatbot, a misread message gives an odd reply. For an agent, it can mean the wrong tool or the wrong arguments. "Cancel the second one, jangan yang first" is a clear instruction to a Malaysian reader. It is a test of whether the agent knows that <em>jangan</em> means "don't".</p>

<ul>
<li>Code-switched messages are a separate test condition, not a translation of English ones.</li>
<li>The risk is in actions: negation, quantities and which item is meant.</li>
<li>Real phrasing from traces is the best source. Invented Manglish is a poor substitute.</li>
<li>Report pass rates for mixed-language cases on their own, so a drop is not hidden by the English average.</li>
</ul>

<h3 id="evidence">What the research shows so far</h3>

<p>Zhang and colleagues (2023) tested multilingual models on code-switched text, including Malay–English, and found that general multilingual ability does not mean a model handles mixed text well. The CS-Sum benchmark (2025) asked models to summarise code-switched dialogue, with Malay–English as one of three language pairs. Its authors report that error rates differ by language pair and model, and that automatic scores can look high even when a summary changes the meaning.</p>

<p>Regional suites are improving but are uneven. SEA-HELM (2025) evaluates Southeast Asian languages, yet its published language list covers Filipino, Indonesian, Tamil, Thai and Vietnamese, not Malay. Neither it nor CS-Sum tests agents that call tools. That gap is the useful one to fill locally.</p>

<h3 id="where">Where mixed language breaks an agent</h3>

<div class="tbl"><table>
<thead><tr><th>Pattern</th><th>Example</th><th>What can go wrong</th></tr></thead>
<tbody>
<tr><td>Negation in Malay</td><td>"Refund order 2, jangan order 1"</td><td>Both orders refunded, or the wrong one</td></tr>
<tr><td>Malay quantity or time</td><td>"Book for dua orang, esok petang"</td><td>Wrong party size or date</td></tr>
<tr><td>Particles and tone</td><td>"Can cancel or not ah?"</td><td>A question read as an instruction</td></tr>
<tr><td>Loose spelling</td><td>"x jadi", "tak jd", "tak jadi"</td><td>Cancellation not recognised</td></tr>
<tr><td>Reference by position</td><td>"Yang last tu, tukar alamat"</td><td>Change applied to the wrong item</td></tr>
</tbody></table></div>

<p>The examples are short on purpose. The hardest cases are rarely long. They are one Malay word that flips the meaning of an English sentence.</p>

<h3 id="build">Building the set</h3>

<p><strong>Start from traces.</strong> The note on <a href="/posts/traces-into-eval-sets">turning traces into an eval set</a> applies directly. Filter real messages that mix languages, clean them, and keep the phrasing exactly as written. Do not correct the spelling; the spelling is the test.</p>

<p><strong>Write paired cases.</strong> For each important task, keep an English case and a mixed case with the same expected outcome. If the English case passes and the mixed one fails, the gap is language handling, not the task.</p>

<p><strong>Grade outcomes, not wording.</strong> As in <a href="/posts/testing-agents-before-release">testing an agent before release</a>, check which tool ran and with which arguments. That avoids asking a grader to judge Manglish prose, which is where graders are weakest.</p>

<p><strong>Ask before acting when unsure.</strong> A clarifying question is a correct outcome for a truly unclear message. An eval should reward "Order 1 or order 2?" over a confident wrong refund.</p>

<h3 id="start">Where to start</h3>

<ol>
<li>Sample a week of real user messages and mark the ones that mix languages.</li>
<li>Pick the five tasks with irreversible actions and write a mixed-language pair for each.</li>
<li>Have a fluent reviewer check the expected outcomes and any model grader's verdicts.</li>
<li>Track the mixed-language pass rate as its own line in the release report.</li>
</ol>
