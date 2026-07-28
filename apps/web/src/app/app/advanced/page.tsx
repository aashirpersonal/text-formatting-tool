import type { Metadata } from 'next';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';

export const metadata: Metadata = {
  title: 'Advanced editor',
};

export default function AdvancedAppPage() {
  return (
    <div className="advanced-workspace" data-testid="advanced-workspace">
      <header className="advanced-intro">
        <h1>Advanced recipe editor</h1>
        <p className="muted">
          Manual control for trusted operations. Prefer the{' '}
          <Link href="/app">simple transform flow</Link> for everyday use.
        </p>
      </header>
      <div className="advanced-body">
        <WorkspaceShell />
      </div>
    </div>
  );
}
