import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <div className="container page prose">
      <h1>About</h1>
      <p>
        Large text clean-up is often repetitive and rule-like: normalising dates, converting
        delimiters, deduplicating lines, or reshaping predictable logs. Sending entire documents to
        a language model for every run can be costly, hard to reproduce, and unnecessary when the
        desired behaviour is deterministic.
      </p>
      <p>
        Text Formatting Tool v2 is designed so people can describe a change in plain English, review
        a preview, then apply a trusted local transformation. AI may later help author an
        explainable recipe from an instruction and approved samples—never by executing model-written
        code.
      </p>
      <h2>What makes it different</h2>
      <ul>
        <li>Normal users get a simple flow; recipes stay under Advanced details.</li>
        <li>The full document is processed locally by an allowlisted engine.</li>
        <li>Generated JavaScript is never executed.</li>
      </ul>
      <h2>Limitations</h2>
      <ul>
        <li>Live AI generation is not connected yet.</li>
        <li>The current prototype supports approved example instructions only.</li>
        <li>Creative rewriting, factual correction, and open-ended summarisation are non-goals.</li>
      </ul>
      <p>
        Source and architecture notes live on the{' '}
        <a
          href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
          target="_blank"
          rel="noreferrer"
        >
          v2-rebuild
        </a>{' '}
        branch. Legacy evidence is retained under the <code>legacy-v1</code> Git tag.
      </p>
      <p className="muted">
        Continue to the <Link href="/app">app</Link>,{' '}
        <Link href="/app/advanced">advanced editor</Link>, or <Link href="/privacy">privacy</Link>{' '}
        pages.
      </p>
    </div>
  );
}
