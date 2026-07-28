import type { Metadata } from 'next';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';

export const metadata: Metadata = {
  title: 'Advanced editor',
};

export default function AdvancedAppPage() {
  return (
    <div className="container page stack">
      <div className="stack" style={{ gap: '0.75rem' }}>
        <span className="badge" role="status">
          Advanced · manual recipes
        </span>
        <h1 style={{ margin: 0, letterSpacing: '-0.03em' }}>Advanced editor</h1>
        <p className="lede">
          Build a Transformation Plan manually, reorder trusted operations, then preview and process
          locally in a Web Worker. Prefer the <Link href="/app">simple transform flow</Link> for
          everyday use.
        </p>
      </div>
      <WorkspaceShell />
    </div>
  );
}
