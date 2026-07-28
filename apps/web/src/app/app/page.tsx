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
          v2 scaffold · local input only
        </span>
        <h1 style={{ margin: 0, letterSpacing: '-0.03em' }}>Workspace</h1>
        <p className="lede">
          Follow the approved journey. In this milestone, only local text and file input work. Later
          steps are shown as structure and labelled examples.
        </p>
      </div>
      <ol className="journey" aria-label="Product journey">
        <li>Add text or file</li>
        <li>Describe transformation</li>
        <li>Review sample</li>
        <li>Review recipe</li>
        <li>Preview</li>
        <li>Process locally</li>
        <li>Export</li>
      </ol>
      <WorkspaceShell />
    </div>
  );
}
