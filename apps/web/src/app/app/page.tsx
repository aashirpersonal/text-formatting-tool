import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/WorkspaceShell';

export const metadata: Metadata = {
  title: 'Workspace',
};

export default function AppPage() {
  return (
    <div className="container page stack">
      <div className="stack" style={{ gap: '0.75rem' }}>
        <span className="badge" role="status">
          v2 · local Worker execution
        </span>
        <h1 style={{ margin: 0, letterSpacing: '-0.03em' }}>Workspace</h1>
        <p className="lede">
          Build a deterministic recipe manually, preview a local sample, then process the complete
          document in a Web Worker. No AI and no network upload in this milestone.
        </p>
      </div>
      <WorkspaceShell />
    </div>
  );
}
