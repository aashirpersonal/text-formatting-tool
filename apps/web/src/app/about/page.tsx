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
        Text Formatting Tool v2 focuses on <strong>deterministic transformation recipes</strong>: AI
        may help author an explainable plan from an instruction and approved samples, then a trusted
        local engine applies that plan to the full document.
      </p>
      <h2>Limitations</h2>
      <ul>
        <li>Not every natural-language request can be expressed as a safe deterministic recipe.</li>
        <li>Creative rewriting, factual correction, and open-ended summarisation are non-goals.</li>
        <li>The model must never generate JavaScript that this application executes.</li>
      </ul>
      <p>
        This repository is an open-source work in progress. After cloning, see{' '}
        <code>docs/v2/PRODUCT_BLUEPRINT.md</code> and <code>docs/v2/ARCHITECTURE_DECISIONS.md</code>{' '}
        for the approved direction. Legacy evidence is retained under the <code>legacy-v1</code> Git
        tag.
      </p>
      <p className="muted">
        Continue to the <Link href="/app">workspace</Link> or <Link href="/privacy">privacy</Link>{' '}
        pages.
      </p>
    </div>
  );
}
