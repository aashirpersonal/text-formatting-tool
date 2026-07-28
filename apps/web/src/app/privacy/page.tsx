import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
};

export default function PrivacyPage() {
  return (
    <div className="container page prose">
      <h1>Privacy</h1>
      <p>
        This page describes the privacy posture for Text Formatting Tool v2 and the behaviour of the
        current local workspace.
      </p>
      <h2>Current local workspace</h2>
      <ul>
        <li>
          Document text, recipe editing, preview, and full processing stay in your browser. No text
          is uploaded for transformation.
        </li>
        <li>
          Transformations run in a local Web Worker using the trusted allowlisted engine. No AI
          request is made from the workspace.
        </li>
        <li>Copy and download use browser-local APIs only.</li>
        <li>No analytics are currently enabled.</li>
        <li>
          This browser session is not persisted to localStorage; refreshing the page clears the
          workspace.
        </li>
      </ul>
      <h2>Planned behaviour</h2>
      <ul>
        <li>
          A future AI recipe feature is intended to send only the instruction and user-approved
          representative samples to a secure server-side model API.
        </li>
        <li>
          The complete document is intended to remain local in deterministic transformation mode.
        </li>
        <li>That planned AI behaviour must be verified when integration is implemented.</li>
      </ul>
      <p className="muted">
        This explanation does not claim absolute privacy or security. Threat modelling and
        implementation evidence will be published as the product matures.
      </p>
    </div>
  );
}
