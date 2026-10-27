---
title: "A secretless path from laptop to production"
date: 2026-10-27
themes: ["identity-security", "developer-experience"]
insight: "A path to production is secretless when the code stays the same between environments and only the identity changes."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7520756408733216768/"
caveats:
  - title: "Some providers still need a key."
    text: "Not every model provider or SaaS API accepts federated identity, so a few keys may remain behind a gateway or a secret store."
  - title: "Local sign-in is not the same as production."
    text: "A developer's own account often has broader permissions than the workload will have, so permission errors can still appear for the first time after deployment."
  - title: "Turning keys off is a separate step."
    text: "Disabling key-based access depends on the service and is not always available or recommended for every resource, so check each one before switching it off."
  - title: "Federation needs its own care."
    text: "Trust settings such as the allowed repository, branch or service account become the thing to review, in place of the stored secret."
sources:
  - title: "OpenID Connect in GitHub Actions"
    site: "docs.github.com"
    url: "https://docs.github.com/en/actions/concepts/security/openid-connect"
  - title: "Use keyless connections with Azure OpenAI"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/azure/developer/ai/keyless-connections"
  - title: "Workload identity on Azure Kubernetes Service"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/azure/aks/workload-identity-overview"
  - title: "GitHub and Terraform with OIDC for CI/CD (sample)"
    site: "learn.microsoft.com"
    url: "https://learn.microsoft.com/en-us/samples/azure-samples/github-terraform-oidc-ci-cd/github-terraform-oidc-ci-cd"
  - title: "How Application Default Credentials works"
    site: "cloud.google.com"
    url: "https://cloud.google.com/docs/authentication/application-default-credentials"
  - title: "Standardized credential providers in AWS SDKs and tools"
    site: "docs.aws.amazon.com"
    url: "https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html"
related: ["checking-user-and-agent", "agent-identity-is-not-authorization"]
---
<h3 id="idea">The idea in brief</h3>

<p>An API key in a <code>.env</code> file is the quickest way to make a first call. The trouble starts when the same key is copied into a CI variable, then a Kubernetes secret, then a notebook for a quick test. Each environment ends up with a different credential and a different way of authenticating, and the production path is the one nobody exercised before going live.</p>

<p>A secretless path keeps one pattern from the laptop to production: the application asks a standard credential chain for a token, and each environment supplies its own identity.</p>

<h3 id="stages">One pattern, four environments</h3>

<div class="tbl"><table>
<thead><tr><th>Stage</th><th>Identity used</th><th>What is stored</th></tr></thead>
<tbody>
<tr><td>Local development</td><td>The developer's own SSO sign-in through the cloud CLI</td><td>Nothing in the repository</td></tr>
<tr><td>CI/CD</td><td>An OIDC token from the CI system, exchanged for a short-lived cloud token</td><td>A trust setting, not a credential</td></tr>
<tr><td>Kubernetes workload</td><td>Workload identity federation tied to a service account</td><td>A service account annotation</td></tr>
<tr><td>Gateway to model providers</td><td>The gateway's own workload identity</td><td>Keys only for providers that do not support federation</td></tr>
</tbody></table></div>

<p>In CI, GitHub's documentation describes the job requesting an OIDC token and the cloud provider exchanging it for a short-lived access token, so no long-lived cloud credential has to be saved as a secret. On Kubernetes, AKS workload identity lets a pod use a federated identity linked to its service account in the same way.</p>

<h3 id="chain">The same code everywhere</h3>

<p>The part that makes this work is the credential chain in each cloud's SDK. Google's Application Default Credentials, the AWS SDKs' default credential provider chain and Azure's <code>DefaultAzureCredential</code> each look through a list of sources in order: environment settings, a workload or managed identity when deployed, and the developer's signed-in CLI session locally. Microsoft's keyless connections guide for Azure OpenAI shows the same application code running locally with a developer sign-in and in Azure with a managed identity.</p>

<pre><code># the same lines run on a laptop, in CI and in the cluster
credential = DefaultAzureCredential()
client = AzureOpenAI(azure_ad_token_provider=get_bearer_token_provider(
    credential, "https://cognitiveservices.azure.com/.default"))</code></pre>

<p>Because the code does not change, the production auth path is the same path every developer has already run, just with a different identity behind it.</p>

<h3 id="upstream">Fix it upstream</h3>

<p>Rotating keys and scanning for leaked secrets are useful, but they manage secrets that already exist. The stronger move is not to create them: give each environment an identity, grant that identity the permissions it needs, and only then look at switching key-based access off for services where nothing depends on it any more.</p>

<h3 id="check">A quick check</h3>

<ul>
<li>Does any environment authenticate differently from the others?</li>
<li>Is a cloud credential stored anywhere in CI settings?</li>
<li>Do pods mount a secret only to call a cloud or model API?</li>
<li>Which remaining keys exist only because a provider does not support federation?</li>
</ul>
