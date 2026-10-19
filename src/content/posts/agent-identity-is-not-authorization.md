---
title: "An agent's identity is not its permission"
date: 2026-10-13
themes: ["identity-security", "ai-agents", "ai-platform-engineering"]
lane: "identity"
short: "Identity ≠ access"
insight: "Knowing who an agent is answers only part of the question. Whether an action is allowed depends on the user, the scope they delegated and the resource's own policy."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7515683149171974146/"
caveats:
  - title: "Entra Agent ID is in preview."
    text: "The object model and APIs may change; the docs describe it as preview."
  - title: "The example is a simplification."
    text: "Real authorization for payments or personal data is subject to its own regulatory and audit requirements."
  - title: "Mediation adds work."
    text: "Enforcing policy in every downstream system takes effort. Shared policy services are a common way to reduce duplication."
  - title: "Valid tokens can still be misused."
    text: "OWASP notes that an agent can be steered into misusing legitimate access, which is why it recommends checks downstream and human approval for high-impact actions."
sources:
  - title: "SP 800-207, Zero Trust Architecture"
    site: "csrc.nist.gov"
    url: "https://csrc.nist.gov/pubs/sp/800/207/final"
  - title: "LLM06:2025 Excessive Agency"
    site: "genai.owasp.org"
    url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
  - title: "Agent on-behalf-of OAuth flow"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/en-us/entra/agent-id/agent-on-behalf-of-oauth-flow"
  - title: "Microsoft Entra Agent ID APIs overview"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/en-us/graph/api/resources/agentid-platform-overview"
  - title: "Governing agent identities"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/agent-id-governance-overview"
related: ["checking-user-and-agent", "tool-call-timeouts"]
---
<h3 id="idea">The idea in brief</h3>

<p>Authentication establishes who is calling. Authorization decides what that caller may do. With AI agents the two are easy to blur, because the agent has its own identity but often acts on behalf of a person. Three public sources describe how to keep them apart: NIST's zero trust architecture, OWASP's guidance on LLM applications, and Microsoft's documentation for Entra Agent ID.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 300" role="img" aria-label="The token carries who is acting; the allow or deny decision happens at the resource, where the business context lives."><defs><marker id="d2-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d2-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="30" y="16" width="170" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="115" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="115" dy="0">User</tspan></text><rect x="260" y="16" width="170" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="345" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="345" dy="0">Agent</tspan></text><line x1="200" y1="36" x2="258" y2="36" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d2-a)"/><text x="229" y="26" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="229" dy="0">delegates</tspan></text><line x1="345" y1="56" x2="345" y2="110" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d2-b)"/><text x="355" y="76" font-size="11.5" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="355" dy="0">token: agent, user, scope</tspan></text><text x="355" y="94" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="355" dy="0">evidence, not a decision</tspan></text><rect x="30" y="112" width="400" height="172" rx="12" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="50" y="134" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="50" dy="0">Finance tool decides</tspan></text><text x="50" y="162" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="50" dy="0">✓  agent registered for this tool</tspan></text><text x="50" y="186" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="50" dy="0">✓  user holds the approver role</tspan></text><text x="50" y="210" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="50" dy="0">✓  delegated scope covers the action</tspan></text><text x="50" y="234" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="50" dy="0">?  amount within user and agent limits</tspan></text><rect x="50" y="248" width="90" height="26" rx="8" style="fill:hsl(var(--card));stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.6;"/><text x="95" y="261" font-size="12" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:500;"><tspan x="95" dy="0">allow</tspan></text><rect x="150" y="248" width="120" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="210" y="261" font-size="12" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="210" dy="0">ask a human</tspan></text><rect x="280" y="248" width="80" height="26" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="320" y="261" font-size="12" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="320" dy="0">deny</tspan></text></svg></div><figcaption>The token carries who is acting; the allow or deny decision happens at the resource, where the business context lives.</figcaption></figure>

<h3 id="zero-trust">The zero trust starting point</h3>

<p>NIST SP 800-207 (2020) describes zero trust as moving protection away from network perimeters and towards users, assets and resources. Being on the right network or holding a device grants no implicit trust, and authentication and authorization are treated as separate steps performed before a session with a resource begins. An agent with a valid identity fits the same model: the identity is an input, not a grant.</p>

<h3 id="owasp">What OWASP recommends for agents</h3>

<p>The OWASP Top 10 for LLM Applications (2025) lists <strong>Excessive Agency</strong> as LLM06. It traces the risk to three causes: excessive functionality, excessive permissions and excessive autonomy. Several of its recommended mitigations map directly onto the identity question:</p>

<ul>
<li><strong>Execute in the user's context.</strong> Act on downstream systems as the specific user, with the minimum privileges needed, for example OAuth with narrow scopes.</li>
<li><strong>Complete mediation.</strong> Enforce authorization in the downstream systems, rather than relying on the model to decide.</li>
<li><strong>Require user approval</strong> for high-impact actions.</li>
<li><strong>Minimise permissions and functionality</strong>, for example read-only access where that is enough.</li>
<li><strong>Log and monitor</strong> downstream activity and apply rate limits, to limit damage.</li>
</ul>

<h3 id="example">An illustrative example</h3>

<p>Consider a hypothetical expense agent that can approve payments in a finance system. Applying the points above, an approval might depend on several conditions at once, only some of which a token can carry:</p>

<pre><code># illustrative only
allow approve_payment if
    agent is registered for the finance tool
and user holds the approver role
and delegated scope includes payments.approve
and amount is within the user's approval limit
and amount is within the agent's limit, else ask a human</code></pre>

<p>The limits and the amount belong to the finance system. That is the reasoning behind OWASP's complete mediation point: the downstream system is the place that can see both the caller's identity and the business context.</p>

<h3 id="entra">How Microsoft Entra Agent ID models it</h3>

<p>Microsoft's Entra Agent ID documentation shows one vendor's implementation of these ideas:</p>

<ul>
<li>Agents get dedicated identities, created from an <em>agent identity blueprint</em>, separate from ordinary application registrations.</li>
<li>For delegated access, the docs describe an on-behalf-of (OBO) flow: the agent exchanges the user's token for a token to call a downstream API, and Entra validates both before issuing it. The user consents to the delegated permissions.</li>
<li>Conditional Access policies can be applied to agent identities, based on the agent and other context.</li>
<li>Access can be granted through access packages with an end date. The governance docs describe a human sponsor who can renew access; if no one acts, the assignment expires and the agent loses access.</li>
</ul>

<p>The expiring, sponsor-owned access is one concrete answer to the "for how long" part of the authorization question.</p>
