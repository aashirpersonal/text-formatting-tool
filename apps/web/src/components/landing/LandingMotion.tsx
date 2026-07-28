'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BEFORE_LINES = [
  { id: 'b1', text: '  apple  ' },
  { id: 'b2', text: '  apple  ' },
  { id: 'b3', text: '  banana  ' },
];
const AFTER_LINES = [
  { id: 'a1', text: 'apple' },
  { id: 'a2', text: 'banana' },
];

export function LandingMotion() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        gsap.set(
          [
            '.hero-copy > *',
            '.hero-window',
            '.demo-line',
            '.demo-instruction',
            '.demo-after',
            '.demo-status',
            '.landing-cta-primary',
            '.benefit-item',
            '.flow-step',
          ],
          { clearProps: 'all', opacity: 1, y: 0, scale: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-copy > *', { y: 28, opacity: 0, stagger: 0.08, duration: 0.7 })
        .from('.hero-window', { y: 48, opacity: 0, scale: 0.96, duration: 0.85 }, '-=0.35')
        .from('.demo-line', { opacity: 0, x: -12, stagger: 0.08, duration: 0.35 }, '-=0.2')
        .from('.demo-instruction', { opacity: 0, y: 10, duration: 0.4 })
        .to('.demo-before', { opacity: 0.35, duration: 0.25 })
        .from('.demo-after', { opacity: 0, y: 8, duration: 0.45 })
        .from('.demo-status', { opacity: 0, scale: 0.95, duration: 0.35 });

      // Keep CTA visible and solid for contrast; avoid animating its paint styles.

      gsap.from('.benefit-item', {
        scrollTrigger: {
          trigger: '.benefits-section',
          start: 'top 80%',
        },
        y: 24,
        opacity: 0,
        stagger: 0.12,
        duration: 0.55,
      });

      gsap.from('.flow-step', {
        scrollTrigger: {
          trigger: '.flow-section',
          start: 'top 78%',
        },
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.5,
      });

      gsap.from('.final-cta-panel', {
        scrollTrigger: {
          trigger: '.final-cta-section',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.65,
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="landing landing-motion" data-testid="landing-motion">
      <section className="hero-viewport" aria-labelledby="hero-heading">
        <div className="hero-grid">
          <div className="hero-copy stack">
            <span className="badge" role="status">
              v2 · local prototype
            </span>
            <p className="eyebrow">Text Formatting Tool</p>
            <h1 id="hero-heading">
              Tell AI what to change.
              <br />
              Apply it locally.
            </h1>
            <p className="lede">
              Describe a transformation once. Review the change, then process the complete text in
              your browser.
            </p>
            <div className="actions wrap-actions">
              <Link
                className="button button-primary landing-cta-primary"
                href="/app"
                data-testid="landing-cta"
              >
                Open the app
              </Link>
              <a
                className="button button-secondary"
                href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
                target="_blank"
                rel="noreferrer"
                data-testid="landing-source"
              >
                View source
              </a>
            </div>
          </div>

          <div className="hero-window" aria-hidden="true" data-testid="hero-product-window">
            <div className="hero-window-bar">
              <span />
              <span />
              <span />
              <strong>Text Formatting Tool</strong>
            </div>
            <div className="hero-window-body">
              <div className="demo-source">
                <small>Your text</small>
                <div className="demo-before">
                  {BEFORE_LINES.map((line) => (
                    <div key={line.id} className="demo-line">
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="demo-intel">
                <small>Preview</small>
                <div className="demo-after">
                  {AFTER_LINES.map((line) => (
                    <div key={line.id}>{line.text}</div>
                  ))}
                </div>
                <div className="demo-status">Processed locally</div>
              </div>
            </div>
            <div className="demo-composer">
              <div className="demo-instruction">Remove duplicates and trim spaces.</div>
              <div className="demo-generate">Generate transformation</div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="container landing-section benefits-section"
        aria-labelledby="benefits-heading"
      >
        <h2 id="benefits-heading">Built for clarity before action</h2>
        <div className="benefit-row">
          <article className="benefit-item">
            <h3>Describe it naturally</h3>
            <p className="muted">No scripts or regular expressions required.</p>
          </article>
          <article className="benefit-item">
            <h3>Review before applying</h3>
            <p className="muted">See exactly what will change.</p>
          </article>
          <article className="benefit-item">
            <h3>Process locally</h3>
            <p className="muted">The full document stays in your browser.</p>
          </article>
        </div>
      </section>

      <section className="container landing-section flow-section" aria-labelledby="flow-heading">
        <h2 id="flow-heading">How it works</h2>
        <ol className="flow-list">
          <li className="flow-step">
            <strong>Add text</strong>
            <span className="muted">Paste or choose a file.</span>
          </li>
          <li className="flow-step">
            <strong>Describe the change</strong>
            <span className="muted">Use an example prompt or write your own.</span>
          </li>
          <li className="flow-step">
            <strong>Preview and apply locally</strong>
            <span className="muted">Review, then process the complete input.</span>
          </li>
        </ol>
        <div className="flow-path" aria-hidden="true">
          <span>Instruction</span>
          <span className="flow-arrow" />
          <span>Safe plan</span>
          <span className="flow-arrow" />
          <span>Local processing</span>
        </div>
      </section>

      <section className="container landing-section" aria-labelledby="use-heading">
        <h2 id="use-heading">Practical uses</h2>
        <ul className="chip-cloud">
          {[
            'Clean copied lists',
            'Standardise exported data',
            'Filter logs',
            'Convert delimiters',
            'Reformat repeated labels',
            'Prepare structured text files',
          ].map((item) => (
            <li key={item} className="chip">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="container landing-section" aria-labelledby="trust-heading">
        <h2 id="trust-heading">Trust without theatre</h2>
        <ul className="trust-list">
          <li>The complete document is processed locally in your browser.</li>
          <li>
            Future AI generation will use only approved samples and your instruction—not the whole
            document by default.
          </li>
          <li>Generated code is never executed. Transformations use trusted operations.</li>
        </ul>
      </section>

      <section className="container landing-section" aria-labelledby="oss-heading">
        <h2 id="oss-heading">Open source</h2>
        <p className="muted">
          The engine and architecture are developed in the open on the{' '}
          <a
            href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
            target="_blank"
            rel="noreferrer"
          >
            v2-rebuild
          </a>{' '}
          branch.
        </p>
      </section>

      <section className="final-cta-section" aria-labelledby="final-heading">
        <div className="container final-cta-panel">
          <h2 id="final-heading">Transform your first text</h2>
          <Link className="button button-primary" href="/app">
            Open the app
          </Link>
        </div>
      </section>
    </div>
  );
}
