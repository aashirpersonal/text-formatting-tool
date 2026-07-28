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
        This page describes the privacy posture for Text Formatting Tool v2. It distinguishes
        prototype mode from OpenAI recipe-generation mode. It does not claim absolute privacy or
        security.
      </p>

      <h2>What never leaves your browser for transformation</h2>
      <ul>
        <li>
          Preview and full-document processing always run locally in a Web Worker using the trusted
          allowlisted engine. The complete document is never sent to the recipe-generation endpoint
          for transformation.
        </li>
        <li>Copy and download use browser-local APIs only.</li>
        <li>No analytics are currently enabled.</li>
        <li>
          This browser session is not persisted to localStorage; refreshing the page clears the
          workspace.
        </li>
        <li>
          Document content is not intentionally logged by the application. Instruction and sample
          text are not written to application logs.
        </li>
      </ul>

      <h2>Prototype mode</h2>
      <ul>
        <li>
          When <code>RECIPE_GENERATOR_MODE=prototype</code> (the default), Generate uses a local
          example adapter only.
        </li>
        <li>No AI request is made. No excerpts are uploaded.</li>
        <li>Your document remains in the browser for the whole flow.</li>
      </ul>

      <h2>OpenAI mode</h2>
      <ul>
        <li>
          When OpenAI mode is configured, Generate first shows a review step for the instruction and
          a small number of start/middle/end excerpts you can edit, remove, or cancel.
        </li>
        <li>
          Only after you approve does the app send the instruction, approved excerpts, and optional
          document metadata (counts only) to the same-origin recipe endpoint, which calls OpenAI
          server-side.
        </li>
        <li>The complete document stays local in deterministic transformation mode.</li>
        <li>
          Recipe responses are requested with <code>store: false</code>. That setting must not be
          described as guaranteed Zero Data Retention. OpenAI processing is subject to the
          applicable API data controls and account configuration.
        </li>
        <li>The browser never receives or stores an OpenAI API key.</li>
        <li>
          Generated output is a schema-validated Transformation Plan. JavaScript is never generated
          or executed.
        </li>
      </ul>

      <h2>What this page does not claim</h2>
      <ul>
        <li>It does not say “nothing leaves your device” in OpenAI mode.</li>
        <li>It does not claim zero retention, complete privacy, or 100% security.</li>
        <li>
          Start/middle/end sampling may miss rare patterns; it is not intelligent representative
          sampling.
        </li>
      </ul>

      <p className="muted">
        Continue to the <Link href="/app">app</Link> or <Link href="/about">about</Link> pages. See{' '}
        <code>docs/v2/AI_RECIPE_GENERATION_V1.md</code> for technical detail.
      </p>
    </div>
  );
}
