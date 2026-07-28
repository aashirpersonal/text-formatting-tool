import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
};

export default function PrivacyPage() {
  return (
    <div className="container page prose">
      <h1>Privacy</h1>
      <p>
        This page describes the intended privacy posture for Text Formatting Tool v2 and the
        behaviour of the current scaffold.
      </p>
      <h2>Current scaffold</h2>
      <ul>
        <li>The current v2 scaffold does not send entered text to an AI service.</li>
        <li>No analytics are currently enabled.</li>
        <li>Text and small plain-text files stay in your browser during local input.</li>
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
        <li>That planned behaviour must be verified when AI integration is implemented.</li>
      </ul>
      <p className="muted">
        This explanation does not claim absolute privacy or security. Threat modelling and
        implementation evidence will be published as the product matures.
      </p>
    </div>
  );
}
