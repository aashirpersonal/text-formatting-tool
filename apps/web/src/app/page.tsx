import Link from 'next/link';

const examples = [
  'Normalise mixed date formats into ISO dates',
  'Convert delimiter-separated rows from commas to tabs',
  'Remove exact duplicate lines from a large list',
  'Standardise repeated product label prefixes',
];

export default function HomePage() {
  return (
    <div className="container hero">
      <div>
        <span className="badge" role="status">
          v2 in development
        </span>
      </div>
      <h1>Turn plain-English instructions into safe, reusable text transformations.</h1>
      <p className="lede">
        Text Formatting Tool is being rebuilt so AI can help author an explainable transformation
        recipe, while a trusted local engine processes the complete document in the browser. You can
        already build recipes manually and run them locally in a Web Worker. AI recipe generation is
        not implemented yet.
      </p>
      <div className="actions">
        <Link className="button button-primary" href="/app">
          Open workspace
        </Link>
        <Link className="button button-secondary" href="/about">
          Read the approach
        </Link>
      </div>
      <section className="panel stack" aria-labelledby="examples-heading">
        <h2 id="examples-heading" style={{ margin: 0 }}>
          Example deterministic tasks
        </h2>
        <ul className="list">
          {examples.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="muted" style={{ margin: 0 }}>
          Creative rewriting, open-ended summarisation, and unrestricted code execution are explicit
          non-goals. See the product blueprint for planned behaviour.
        </p>
      </section>
    </div>
  );
}
