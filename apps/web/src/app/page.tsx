import Link from 'next/link';

const useCases = [
  'Clean copied lists',
  'Standardise exported data',
  'Filter logs',
  'Convert delimiters',
  'Reformat repeated labels',
  'Prepare structured text files',
];

export default function HomePage() {
  return (
    <div className="landing">
      <section className="container landing-hero">
        <div className="landing-copy stack">
          <span className="badge" role="status">
            v2 in development
          </span>
          <p className="eyebrow">Text Formatting Tool</p>
          <h1>Tell AI what to change. Apply it locally.</h1>
          <p className="lede">
            Turn a plain-English instruction into a safe, reusable transformation—then process the
            full document in your browser.
          </p>
          <div className="actions wrap-actions">
            <Link className="button button-primary" href="/app" data-testid="landing-cta">
              Try it locally
            </Link>
            <a
              className="button button-secondary"
              href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
        <div className="product-mock" aria-hidden="true">
          <div className="mock-chrome">
            <span />
            <span />
            <span />
          </div>
          <div className="mock-body stack">
            <strong>What should change?</strong>
            <div className="mock-chip-row">
              <span className="chip">Remove duplicates</span>
              <span className="chip">Trim spaces</span>
            </div>
            <div className="mock-preview">
              <div>
                <small>Before</small>
                <pre>{['  apple  ', '  apple  ', '  banana  '].join('\n')}</pre>
              </div>
              <div>
                <small>After</small>
                <pre>{`apple
banana`}</pre>
              </div>
            </div>
            <div className="mock-cta">Apply to full text locally</div>
          </div>
        </div>
      </section>

      <section className="container landing-section" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading">Built for clarity before action</h2>
        <div className="benefit-grid">
          <article className="panel stack">
            <h3>Describe it naturally</h3>
            <p className="muted">No scripts or regular expressions required.</p>
          </article>
          <article className="panel stack">
            <h3>Review before applying</h3>
            <p className="muted">See exactly what will change.</p>
          </article>
          <article className="panel stack">
            <h3>Process locally</h3>
            <p className="muted">The full document stays in your browser.</p>
          </article>
        </div>
      </section>

      <section className="container landing-section" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <ol className="how-list">
          <li>
            <strong>Add text</strong>
            <span>Paste or choose a plain-text file.</span>
          </li>
          <li>
            <strong>Describe the change</strong>
            <span>Use an example prompt or write your own instruction.</span>
          </li>
          <li>
            <strong>Preview and apply locally</strong>
            <span>Review before/after, then process the complete input in your browser.</span>
          </li>
        </ol>
      </section>

      <section className="container landing-section" aria-labelledby="usecases-heading">
        <h2 id="usecases-heading">Practical use cases</h2>
        <ul className="chip-cloud">
          {useCases.map((item) => (
            <li key={item}>
              <span className="chip">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container landing-section" aria-labelledby="trust-heading">
        <h2 id="trust-heading">Trust without theatre</h2>
        <div className="panel stack">
          <ul className="list">
            <li>The complete document is processed locally by a trusted engine.</li>
            <li>
              A future AI feature is intended to send only the instruction and approved samples—not
              the whole document by default.
            </li>
            <li>Generated code is never executed. Transformations use allowlisted operations.</li>
          </ul>
          <p className="muted" style={{ margin: 0 }}>
            This page does not claim absolute privacy. See <Link href="/privacy">Privacy</Link> for
            the current behaviour.
          </p>
        </div>
      </section>

      <section className="container landing-section" aria-labelledby="oss-heading">
        <h2 id="oss-heading">Open source</h2>
        <p className="lede" style={{ maxWidth: '40rem' }}>
          The transformation engine, schema, and local workspace architecture are developed in the
          open on the <code>v2-rebuild</code> branch.
        </p>
        <a
          className="button button-secondary"
          href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
          target="_blank"
          rel="noreferrer"
        >
          Browse the source
        </a>
      </section>

      <section className="container landing-final">
        <h2>Transform your first text</h2>
        <Link className="button button-primary" href="/app">
          Try it locally
        </Link>
      </section>
    </div>
  );
}
