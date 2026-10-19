---
title: "Gateway errors that help someone fix the problem"
date: 2026-10-06
themes: ["ai-platform-engineering", "developer-experience"]
insight: "A blocked request is more useful when the error says what happened, where, and what to try next, without exposing sensitive details."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7513146097813426177/"
caveats:
  - title: "Some policies should stay opaque."
    text: "For abuse or security rules, naming the exact rule can help someone work around it. OWASP's generic-message advice applies there."
  - title: "Status codes still matter."
    text: "RFC 9457 notes that generic HTTP software usually ignores the status member, so the real HTTP status must be correct too."
  - title: "Error copy needs maintenance."
    text: "Problem types are a small public contract. Changing them can break clients that rely on them."
sources:
  - title: "RFC 9457: Problem Details for HTTP APIs"
    site: "datatracker.ietf.org"
    url: "https://datatracker.ietf.org/doc/html/rfc9457"
  - title: "Error Handling Cheat Sheet"
    site: "cheatsheetseries.owasp.org"
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html"
  - title: "Trace Context (W3C Recommendation)"
    site: "w3.org"
    url: "https://www.w3.org/TR/trace-context/"
related: ["hide-complexity-not-evidence", "time-to-first-production-call"]
---
<h3 id="idea">The idea in brief</h3>

<p>A gateway in front of model APIs often rejects requests for good reasons: quotas, identity checks, content policies. A bare <code>403 Forbidden</code> is accurate but leaves the caller guessing. Two public references help balance usefulness against security: the IETF's Problem Details standard and OWASP's error-handling guidance.</p>

<figure><div class="fig-scroll"><svg viewBox="0 0 460 280" role="img" aria-label="One request ID links the short, safe problem details returned to the caller with the full reason kept in logs."><defs><marker id="d4-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:currentColor"/></marker><marker id="d4-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:hsl(var(--brand))"/></marker></defs><rect x="30" y="16" width="170" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="115" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="115" dy="0">Application</tspan></text><rect x="260" y="16" width="170" height="40" rx="8" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="345" y="36" font-size="12.5" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;font-weight:500;"><tspan x="345" dy="0">Gateway</tspan></text><line x1="200" y1="28" x2="258" y2="28" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d4-a)"/><text x="229" y="20" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="229" dy="0">request</tspan></text><line x1="258" y1="46" x2="202" y2="46" style="stroke:hsl(var(--brand));stroke-opacity:1;stroke-width:1.4;" marker-end="url(#d4-b)"/><text x="229" y="68" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="229" dy="0">429 problem+json</tspan></text><line x1="115" y1="56" x2="115" y2="94" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d4-a)"/><line x1="345" y1="56" x2="345" y2="94" style="stroke:currentColor;stroke-opacity:0.55;stroke-width:1.4;" marker-end="url(#d4-a)"/><text x="353" y="75" font-size="11" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="353" dy="0">writes</tspan></text><rect x="30" y="96" width="190" height="166" rx="10" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="46" y="116" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="46" dy="0">Returned to caller</tspan></text><text x="46" y="142" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="46" dy="0">type</tspan></text><text x="46" y="164" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="46" dy="0">title</tspan></text><text x="46" y="186" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="46" dy="0">status</tspan></text><text x="46" y="208" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;"><tspan x="46" dy="0">detail</tspan></text><text x="46" y="230" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="46" dy="0">instance</tspan></text><rect x="250" y="96" width="180" height="166" rx="10" style="fill:hsl(var(--card));stroke:currentColor;stroke-opacity:0.32;stroke-width:1.2;"/><text x="266" y="116" font-size="12.5" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;font-weight:600;"><tspan x="266" dy="0">Kept in logs</tspan></text><text x="266" y="142" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="266" dy="0">matched rule</tspan></text><text x="266" y="164" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="266" dy="0">internal component</tspan></text><text x="266" y="186" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:currentColor;opacity:.62;"><tspan x="266" dy="0">full reason</tspan></text><text x="266" y="230" font-size="12" text-anchor="start" dominant-baseline="middle" style="fill:hsl(var(--brand));font-weight:600;"><tspan x="266" dy="0">instance</tspan></text><line x1="110" y1="230" x2="258" y2="230" style="stroke:hsl(var(--brand));stroke-width:1.2;stroke-dasharray:3 4"/><text x="184" y="246" font-size="11" text-anchor="middle" dominant-baseline="middle" style="fill:hsl(var(--brand));"><tspan x="184" dy="0">same ID</tspan></text></svg></div><figcaption>One request ID links the short, safe problem details returned to the caller with the full reason kept in logs.</figcaption></figure>

<h3 id="rfc9457">A standard shape for API errors</h3>

<p>RFC 9457, Problem Details for HTTP APIs (2023), defines a JSON format served as <code>application/problem+json</code>. Its members are:</p>

<div class="tbl"><table>
<thead><tr><th>Member</th><th>Meaning in the RFC</th></tr></thead>
<tbody>
<tr><td><code>type</code></td><td>A URI identifying the kind of problem</td></tr>
<tr><td><code>title</code></td><td>A short summary that stays the same for that problem type</td></tr>
<tr><td><code>status</code></td><td>The HTTP status code</td></tr>
<tr><td><code>detail</code></td><td>An explanation of this occurrence, aimed at helping the client fix it</td></tr>
<tr><td><code>instance</code></td><td>An identifier for this specific occurrence</td></tr>
</tbody></table></div>

<p>Problem types can add extension members. An illustrative quota rejection might look like this:</p>

<pre><code>HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json

{
  "type": "https://example.com/problems/token-quota",
  "title": "Token quota exceeded",
  "status": 429,
  "detail": "This project used its hourly token quota. Retry after the reset or request a higher quota.",
  "instance": "urn:request:4bf92f3577b34da6a3ce929d0e0e4736"
}</code></pre>

<p>The <code>instance</code> value can carry the same trace ID used in the W3C <code>traceparent</code> header, so support can find the exact request.</p>

<h3 id="owasp">What not to put in the error</h3>

<p>Both sources warn against oversharing. RFC 9457's security section says to vet what goes into problem details and to avoid exposing implementation internals such as stack traces. OWASP's Error Handling Cheat Sheet recommends returning a generic message to the user and logging the details server side for investigation.</p>

<p>Read together, they suggest a split: the response names the problem type and a next step, while the detailed reason (which rule matched, internal component names) stays in the logs, reachable through the request ID.</p>

<h3 id="questions">Four questions as a design check</h3>

<p>A good error answers four questions. They map onto the standard fairly directly:</p>

<ul>
<li><strong>What happened?</strong> <code>type</code> and <code>title</code>.</li>
<li><strong>Where did it happen?</strong> The problem type, for example gateway quota versus provider error.</li>
<li><strong>What can the caller change?</strong> <code>detail</code>.</li>
<li><strong>What should go to support?</strong> <code>instance</code> and a timestamp, never credentials or prompt content.</li>
</ul>
