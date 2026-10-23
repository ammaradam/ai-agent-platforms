---
title: "Testing an agent before release, when the output is a decision"
date: 2026-10-23
themes: ["ai-agents", "reliability"]
insight: "An agent's reply can read well and still be wrong, so release tests should check what it did to the world, across several runs, rather than how its final message sounds."
caveats:
  - title: "Evals are only as good as the tasks."
    text: "A suite built from imagined cases tests imagined problems. The useful tasks come from real failures, and the suite needs new ones as the agent changes."
  - title: "Model graders need checking too."
    text: "A model asked to grade can be confidently wrong. Its verdicts need comparing against human labels before anyone trusts them in a release gate."
  - title: "Several trials cost money."
    text: "Running each task five or ten times multiplies the bill. Spend the repeats on the tasks where an inconsistent agent would do real harm."
  - title: "Benchmarks are not your system."
    text: "Public results such as τ-bench show how hard consistency is, but your own tools, data and policies decide what passing means."
sources:
  - title: "Demystifying evals for AI agents"
    site: "anthropic.com"
    url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
  - title: "τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains"
    site: "arxiv.org"
    url: "https://arxiv.org/abs/2406.12045"
  - title: "Berkeley Function-Calling Leaderboard"
    site: "gorilla.cs.berkeley.edu"
    url: "https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html"
  - title: "Your AI Product Needs Evals"
    site: "hamel.dev"
    url: "https://hamel.dev/blog/posts/evals/"
  - title: "Building effective agents"
    site: "anthropic.com"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
related: ["patterns-for-safe-tool-calls", "agent-success-is-not-a-200", "who-chooses-the-model"]
---
<h3 id="idea">The idea in brief</h3>

<p>A unit test asks whether a function returned the right value. An agent rarely has one right value. It can phrase the same answer a hundred ways, take a different route to the same result, and give a different answer to the same request tomorrow. Worse, its real output is often not text at all: it is a refund issued, a ticket closed, a record deleted.</p>

<p>That makes a familiar question harder: is this version safe to ship? The answer that holds up is to test agents the way you would test a distributed system. Check the state it leaves behind, check the few actions that must never happen, run each case more than once, and gate releases on the results.</p>

<h3 id="vocabulary">A shared vocabulary</h3>

<p>Anthropic's "Demystifying evals for AI agents" (2026) gives terms that make these conversations easier, and the rest of this post uses them:</p>

<div class="tbl"><table>
<thead><tr><th>Term</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Task</td><td>One test case: a defined input and what success means</td></tr>
<tr><td>Trial</td><td>One attempt at a task. Agents vary, so a task gets several</td></tr>
<tr><td>Transcript</td><td>Everything that happened in a trial: messages, tool calls, results</td></tr>
<tr><td>Outcome</td><td>The state of the world at the end, such as whether a refund exists</td></tr>
<tr><td>Grader</td><td>Logic that scores a trial. A task can have several</td></tr>
</tbody></table></div>

<p>The distinction between transcript and outcome is the one that matters most.</p>

<h3 id="outcome">1. Grade the outcome, not the wording</h3>

<p>When an agent's job is to change something, the most reliable test is to look at what changed. τ-bench (2024), a benchmark of agents serving simulated customers through real tools, does exactly this: at the end of each conversation it compares the database with the expected state. It does not care how polite the agent was or which order it looked things up in, only whether the booking, refund or address change is right.</p>

<p>Anthropic's guidance makes the same point from the other side. Graders that insist on a particular sequence of steps are brittle, because agents regularly find valid routes the test's author did not think of. Grading what the agent produced, rather than the path it took, keeps the test about the job.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 250" role="img" aria-label="Four trials of the same task take different paths through the tools. The outcome grader compares only the final state with the expected state: three trials pass and one fails."><defs><marker id="t1-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker></defs><rect x="14" y="95" width="92" height="44" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="60" y="113" font-size="12.5" text-anchor="middle" style="fill:currentColor;font-weight:500;">Task</text><text x="60" y="129" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">refund order 9917</text><g style="fill:none;stroke:currentColor;stroke-opacity:.45;stroke-width:1.3;"><path d="M106 117 C140 117 140 42 176 42"/><path d="M106 117 C140 117 140 92 176 92"/><path d="M106 117 C140 117 140 142 176 142"/><path d="M106 117 C140 117 140 192 176 192"/></g><g font-size="10.5" style="fill:currentColor;"><text x="182" y="38">look up → refund</text><text x="182" y="50" style="opacity:.6;">trial 1</text><text x="182" y="88">look up → check policy → refund</text><text x="182" y="100" style="opacity:.6;">trial 2</text><text x="182" y="138">refund → confirm</text><text x="182" y="150" style="opacity:.6;">trial 3</text><text x="182" y="188">look up → refund twice</text><text x="182" y="200" style="opacity:.6;">trial 4</text></g><rect x="352" y="70" width="96" height="94" rx="10" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="400" y="92" font-size="12" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">Outcome</text><text x="400" y="108" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.7;">one refund of</text><text x="400" y="121" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.7;">RM240 exists?</text><text x="400" y="146" font-size="13" text-anchor="middle" style="fill:currentColor;font-weight:600;letter-spacing:.06em;">✓ ✓ ✓ ✗</text><text x="230" y="236" font-size="11" text-anchor="middle" style="fill:currentColor;opacity:.62;">Different paths are fine. A second refund is not.</text></svg></div><figcaption>Grade the state the agent leaves behind. Three routes pass; the run that refunded twice fails.</figcaption></figure>

<p>Not every task has an outcome you can query. For questions and summaries, the output is the text, and a different kind of grader is needed (more on that below). But for any agent that acts, start by asking: what should the world look like when it is done?</p>

<h3 id="calls">2. Check the actions that must never happen</h3>

<p>Grading outcomes leaves one gap. An agent can reach the right end state through a step that should never have run: it issued the refund, but without the approval your policy requires, or it read a record it had no reason to read. For those cases the path does matter, but only a few steps of it.</p>

<p>The answer is a short list of rules about tool calls, not a full expected sequence. The Berkeley Function-Calling Leaderboard (2024) shows the useful technique: parse each call and compare its structure, the function name, the required arguments and their types, instead of matching text. Applied to an agent's transcript, that turns into assertions like these:</p>

<pre><code># illustrative only
calls = transcript.tool_calls

assert not any(c.name == "refund" and c.args["amount"] > 50_00 and not c.approved for c in calls)
assert count(calls, name="refund", order_id=9917) <= 1          # never twice
assert all(c.name in TOOLS_FOR[agent] for c in calls)            # no tools outside its grant</code></pre>

<p>Rules like these stay valid when the agent finds a new route, and they encode the things a reviewer would actually block a release for.</p>

<h3 id="trials">3. Run each task more than once</h3>

<p>The same agent, given the same task, can succeed on Monday and fail on Tuesday. A single passing run says the agent can do the task. It does not say it will.</p>

<p>Two measures separate those questions. pass@k is the chance that at least one of k trials succeeds: it rises with every extra attempt and suits jobs where one good answer is enough. pass^k is the chance that all k trials succeed: it falls with every attempt and is the one that matters for an agent customers rely on. Anthropic's example shows how far apart they get: an agent that succeeds 75% of the time passes three trials at least once about 98% of the time, but all three only about 42% of the time.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 260" role="img" aria-label="For an agent with a 75 percent success rate per trial, pass at k rises towards 100 percent as k grows, while pass to the power k falls: 75, 56, 32 and 10 percent at k of 1, 2, 4 and 8."><g style="stroke:currentColor;stroke-opacity:.18;"><line x1="56" y1="40" x2="440" y2="40"/><line x1="56" y1="100" x2="440" y2="100"/><line x1="56" y1="160" x2="440" y2="160"/><line x1="56" y1="220" x2="440" y2="220" style="stroke-opacity:.45"/></g><g font-size="10.5" text-anchor="end" style="fill:currentColor;opacity:.6;"><text x="48" y="44">100%</text><text x="48" y="104">67%</text><text x="48" y="164">33%</text><text x="48" y="224">0</text></g><g style="fill:currentColor;fill-opacity:.25;"><rect x="76" y="85" width="34" height="135" rx="3"/><rect x="171" y="51" width="34" height="169" rx="3"/><rect x="266" y="41" width="34" height="179" rx="3"/><rect x="361" y="40" width="34" height="180" rx="3"/></g><g style="fill:hsl(var(--brand));"><rect x="114" y="85" width="34" height="135" rx="3"/><rect x="209" y="119" width="34" height="101" rx="3"/><rect x="304" y="163" width="34" height="57" rx="3"/><rect x="399" y="202" width="34" height="18" rx="3"/></g><g font-size="10.5" text-anchor="middle" style="fill:currentColor;"><text x="93" y="79">75</text><text x="131" y="79">75</text><text x="188" y="45">94</text><text x="226" y="113">56</text><text x="283" y="35">100</text><text x="321" y="157">32</text><text x="378" y="34">100</text><text x="416" y="196">10</text></g><g font-size="11" text-anchor="middle" style="fill:currentColor;opacity:.7;"><text x="112" y="238">k = 1</text><text x="207" y="238">k = 2</text><text x="302" y="238">k = 4</text><text x="397" y="238">k = 8</text></g><rect x="60" y="250" width="10" height="8" style="fill:currentColor;fill-opacity:.25;"/><text x="76" y="258" font-size="10.5" style="fill:currentColor;opacity:.75;">pass@k: at least one trial succeeds</text><rect x="262" y="250" width="10" height="8" style="fill:hsl(var(--brand));"/><text x="278" y="258" font-size="10.5" style="fill:currentColor;opacity:.75;">pass^k: every trial succeeds</text></svg></div><figcaption>The same agent, 75% reliable per trial. Ask "can it?" and it looks perfect; ask "will it, every time?" and it does not.</figcaption></figure>

<p>Published results show this is not a theoretical gap. The τ-bench authors found that even strong function-calling agents completed fewer than half of their tasks, and in the retail setting fewer than a quarter of tasks were passed in all eight trials. If customers will hit a task many times a day, pass^k is the number to gate on.</p>

<h3 id="suites">4. Keep two suites with different jobs</h3>

<p>Anthropic distinguishes two kinds of eval, and keeping them apart stops a common argument about what a falling score means:</p>

<ul>
<li><strong>Capability evals</strong> ask what the agent can do. They should start with a low pass rate, because they exist to show progress on hard tasks.</li>
<li><strong>Regression evals</strong> ask whether the agent still does what it used to. They should pass at close to 100%, and any drop blocks a release.</li>
</ul>

<p>Tasks graduate from the first suite to the second as the agent masters them. Neither needs to be large to start. Anthropic suggests 20 to 50 tasks taken from real failures, and Hamel Husain's "Your AI Product Needs Evals" (2024) describes a team whose quick assertion tests grew from failures they saw in production, one at a time. A small suite built from real incidents beats a large one built from imagination.</p>

<h3 id="graders">5. Use model graders, and check them</h3>

<p>Some things only a reader can judge: whether a summary is faithful, whether a refusal was explained clearly. A second model, given a rubric, can grade those at scale. Anthropic lists the trade-off plainly: model graders are flexible and capture nuance, but they are non-deterministic, cost more, and need calibrating against human judgement.</p>

<p>Husain's advice for that calibration is simple: label a set of real transcripts as good or bad yourself, then check the model grader agrees with you before relying on it. Anthropic adds a habit worth keeping long after: read transcripts regularly. It is the only way to tell an agent's genuine mistake from a grader that rejected a valid answer, and a failure should always look fair to the person reading it.</p>

<h3 id="gate">6. Make it a release gate</h3>

<p>An eval suite earns its keep when it runs automatically on every change that can alter behaviour. For an agent that list is longer than for normal code:</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 228" role="img" aria-label="Any change to the prompt, model, tools or policy triggers the regression suite. Each task runs several trials and is scored by outcome checks, tool-call rules and a calibrated model grader. The release ships only if pass to the power k meets the threshold for that task's risk tier."><defs><marker id="t3-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="t3-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><g font-size="11" style="fill:currentColor;"><rect x="10" y="30" width="96" height="150" rx="10" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.32;stroke-width:1.2;"/><text x="58" y="50" text-anchor="middle" style="font-weight:600;">A change</text><text x="58" y="78" text-anchor="middle" style="opacity:.75;">prompt</text><text x="58" y="100" text-anchor="middle" style="opacity:.75;">model version</text><text x="58" y="122" text-anchor="middle" style="opacity:.75;">tool or schema</text><text x="58" y="144" text-anchor="middle" style="opacity:.75;">policy</text></g><line x1="106" y1="105" x2="130" y2="105" style="stroke:currentColor;stroke-opacity:.55;stroke-width:1.4;" marker-end="url(#t3-a)"/><rect x="132" y="30" width="188" height="150" rx="10" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-width:1.6;"/><text x="226" y="50" font-size="12" text-anchor="middle" style="fill:hsl(var(--brand));font-weight:600;">Regression suite</text><text x="226" y="66" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.62;">every task, k trials</text><g font-size="11" style="fill:currentColor;"><rect x="146" y="78" width="160" height="26" rx="6" style="fill:hsl(var(--background));stroke:currentColor;stroke-opacity:.18;"/><text x="158" y="95">Outcome checks</text><rect x="146" y="110" width="160" height="26" rx="6" style="fill:hsl(var(--background));stroke:currentColor;stroke-opacity:.18;"/><text x="158" y="127">Tool-call rules</text><rect x="146" y="142" width="160" height="26" rx="6" style="fill:hsl(var(--background));stroke:currentColor;stroke-opacity:.18;"/><text x="158" y="159">Calibrated model grader</text></g><line x1="320" y1="105" x2="344" y2="105" style="stroke:hsl(var(--brand));stroke-width:1.4;" marker-end="url(#t3-b)"/><rect x="346" y="72" width="104" height="66" rx="10" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:.32;stroke-width:1.2;"/><text x="398" y="94" font-size="12" text-anchor="middle" style="fill:currentColor;font-weight:600;">Gate</text><text x="398" y="111" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.7;">pass^k ≥ bar</text><text x="398" y="125" font-size="10.5" text-anchor="middle" style="fill:currentColor;opacity:.7;">for the risk tier</text><text x="230" y="212" font-size="11" text-anchor="middle" style="fill:currentColor;opacity:.62;">Results stored with the prompt, model and suite versions that produced them</text></svg></div><figcaption>The gate runs on any change that can alter behaviour, not only on code changes.</figcaption></figure>

<ul>
<li><strong>Prompts and instructions.</strong> A one-word edit can change which tool the agent reaches for.</li>
<li><strong>Model versions.</strong> Providers retire models on a schedule. A pinned version buys time, but the upgrade still needs evidence it behaves the same, which is the argument in <a href="/posts/who-chooses-the-model">who chooses the model</a>.</li>
<li><strong>Tools and their schemas.</strong> Renaming an argument can quietly break every task that uses it.</li>
<li><strong>Policies.</strong> A new approval limit should fail the tasks that now break it, on purpose.</li>
</ul>

<p>Two details make the gate trustworthy. Set the bar by risk, the same tiers as in <a href="/posts/patterns-for-safe-tool-calls">patterns for agent tool calls</a>: a read-only lookup can ship at a lower pass^k than a refund. And store every result with the prompt, model and suite versions that produced it, as Husain recommends, so a drop next month can be traced to the change that caused it.</p>

<h3 id="together">Putting it together</h3>

<div class="tbl"><table>
<thead><tr><th>Question before release</th><th>What answers it</th></tr></thead>
<tbody>
<tr><td>Does it leave the world in the right state?</td><td>Outcome graders on the end state</td></tr>
<tr><td>Did it do anything it must never do?</td><td>Rules on parsed tool calls</td></tr>
<tr><td>Will it work every time, not just once?</td><td>Several trials, gated on pass^k</td></tr>
<tr><td>Did this change break something that worked?</td><td>A regression suite near 100%</td></tr>
<tr><td>Is the text good enough?</td><td>A model grader, checked against human labels</td></tr>
<tr><td>Can we trust the graders?</td><td>Someone reading transcripts every week</td></tr>
</tbody></table></div>

<h3 id="start">Where to start</h3>

<ol>
<li><strong>Collect 20 real failures.</strong> Incidents, support complaints and odd traces, each written as a task with a checkable end state.</li>
<li><strong>Write the never-rules.</strong> The three or four tool calls that would block a release on sight.</li>
<li><strong>Run each task five times.</strong> Report pass^5 next to the average, and watch how far apart they are.</li>
<li><strong>Wire it to every change.</strong> Prompt, model, tool and policy changes all run the suite before they ship.</li>
</ol>

<p>The <a href="https://agent-gateway-playground.vercel.app/">Agent Gateway Playground</a> shows what several of these failures look like from the inside: a retried call that creates a second ticket, and a 200 that was not a success. Each would make a good first task.</p>
