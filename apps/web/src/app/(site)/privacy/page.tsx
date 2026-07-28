import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy',
};

export default function PrivacyPage() {
  return (
    <div className="container page prose">
      <h1>Privacy</h1>
      <p>
        This page describes the privacy posture for Text Formatting Tool v2 and the current local
        product experience.
      </p>
      <h2>Current simple transform flow</h2>
      <ul>
        <li>
          Your text, instruction, preview, and full processing stay in the browser for the current
          prototype. No document is uploaded for transformation.
        </li>
        <li>
          Transformations run in a local Web Worker using the trusted allowlisted engine. No AI
          request is made from the app yet.
        </li>
        <li>
          The “Generate transformation” control currently uses a local prototype adapter for example
          prompts only. It is not connected to OpenAI or any remote model.
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
        This explanation does not claim absolute privacy or security. Continue to the{' '}
        <Link href="/app">app</Link> or <Link href="/about">about</Link> pages.
      </p>
    </div>
  );
}
