---
title: "What MLOps already solved for agents"
date: 2026-11-08
themes: ["ai-platform-engineering", "ai-agents"]
insight: "A tool an agent calls is a dependency with an interface, just like a deployed model. The contracts MLOps built for models (a schema, an example, a version, an owner) fit tools with little change."
caveats:
  - title: "Tools have side effects; models mostly do not."
    text: "A model contract describes inputs and outputs. A tool contract also has to say what the call changes, and whether it can be undone."
  - title: "Schemas catch shape, not meaning."
    text: "A valid amount can still be the wrong amount. Contracts stop malformed calls, and evals stop wrong ones."
  - title: "Agents read the contract too."
    text: "A model's schema is read by code. A tool's description is also read by the agent, so it can steer behaviour as well as describe it."
  - title: "Standards are still settling."
    text: "MCP's output schemas arrived in 2025 and details are still changing. Pin the protocol version you test against."
sources:
  - title: "Hidden Technical Debt in Machine Learning Systems"
    site: "papers.nips.cc"
    url: "https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems"
  - title: "Model Cards for Model Reporting"
    site: "arxiv.org"
    url: "https://arxiv.org/abs/1810.03993"
  - title: "MLflow: model signatures and input examples"
    site: "mlflow.org"
    url: "https://mlflow.org/docs/latest/ml/model/signatures/"
  - title: "Model Context Protocol: tools"
    site: "modelcontextprotocol.io"
    url: "https://modelcontextprotocol.io/specification/2025-06-18/server/tools"
related: ["patterns-for-safe-tool-calls", "standardise-the-right-things", "gateway-errors-that-help"]
---
<h3 id="idea">The idea in brief</h3>

<p>Deploying a model used to mean handing over a file and hoping the calling service sent the right columns. MLOps spent years fixing that. Models now ship with a declared input and output schema, an example request, a version, and a card that says what the model is for and where it fails.</p>

<p>Agent tools are at the start of the same journey. A tool is a dependency the agent calls over an interface, often written by another team and changed without warning. The problems look familiar: silent schema changes, missing owners, no record of which version ran. So do the fixes.</p>

<ul>
<li>A tool needs a contract: input schema, output schema, an example, a version and an owner.</li>
<li>Check the contract at the gateway on every call, not only in the tool's own code.</li>
<li>Version tools the way models are versioned, and record the version in each trace.</li>
<li>Add what models never needed: a side-effect class and an undo story.</li>
</ul>

<h3 id="debt">The debt is the same debt</h3>

<p>Sculley and colleagues (2015) described machine learning systems as full of hidden dependencies: undeclared consumers, unstable data inputs, and glue code holding it together. Swap "model" for "agent" and "data input" for "tool result" and the list still reads true. An agent depends on tools whose behaviour it cannot see, through descriptions that may be out of date, and a change upstream shows up as a confusing answer rather than an error.</p>

<h3 id="map">What carries over</h3>

<div class="tbl"><table>
<thead><tr><th>MLOps practice</th><th>For a model</th><th>For a tool</th></tr></thead>
<tbody>
<tr><td>Signature</td><td>MLflow input and output schema</td><td>MCP <code>inputSchema</code> and <code>outputSchema</code></td></tr>
<tr><td>Input example</td><td>Logged with the model, used to check it loads</td><td>A sample call run in CI before release</td></tr>
<tr><td>Model card</td><td>Intended use, limits, evaluation results</td><td>Tool card: purpose, risk class, owner, known failures</td></tr>
<tr><td>Registry and versions</td><td>Every deployed model has a version</td><td>Every tool has a version, recorded in each trace</td></tr>
<tr><td>Shadow and canary</td><td>New model serves a slice of traffic</td><td>New tool version serves a slice of agent calls</td></tr>
<tr><td>Drift monitoring</td><td>Input distribution moves from training</td><td>Argument patterns or error rates move from baseline</td></tr>
</tbody></table></div>

<h3 id="signature">Signatures, enforced where it counts</h3>

<p>MLflow checks inputs against a model's signature when it is loaded as a Python function and raises an error on a missing required field. The useful part is that the check sits in the serving path, not in the caller's good intentions.</p>

<p>MCP added a similar idea in its 2025-06-18 revision: a tool may declare an output schema, and its structured result must conform to it. The same rule should apply on the way in. The gateway validates the agent's arguments against the input schema before the tool runs, and returns <a href="/posts/gateway-errors-that-help">an error the agent can act on</a> when they do not match.</p>

<pre><code># illustrative only
tool:
  name: refund_order
  version: 3.2.0
  owner: payments-platform
  risk: irreversible          # read | reversible | irreversible
  input_schema:  { order_id: int, amount: number, reason: string }
  output_schema: { refund_id: string, status: [pending, done] }
  example: { order_id: 9917, amount: 45.0, reason: "damaged" }</code></pre>

<h3 id="cards">Cards, for tools</h3>

<p>Mitchell and colleagues (2019) proposed model cards so that anyone using a model could see its intended use, its limits and how it was evaluated. A tool card does the same job for the people wiring tools into agents. It also has a second reader: the agent sees the tool's description in its context, so a vague or outdated card shapes behaviour directly.</p>

<h3 id="new">What is new</h3>

<p>Models mostly return a prediction and change nothing. Tools send, pay, delete and deploy. That is the part MLOps never had to solve. A tool contract needs a risk class, as set out in <a href="/posts/patterns-for-safe-tool-calls">patterns for agent tool calls</a>, and a note on whether a call can be retried or undone.</p>

<h3 id="start">Where to start</h3>

<ol>
<li>Write a contract for the ten most-used tools: schemas, example, version, owner, risk class.</li>
<li>Validate arguments against the input schema at the gateway.</li>
<li>Record the tool version on every <code>execute_tool</code> span.</li>
<li>Run each tool's example call in CI, and block releases that break it.</li>
</ol>
