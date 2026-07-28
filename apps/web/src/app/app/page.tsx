import type { Metadata } from 'next';
import { SimpleAppShell } from '@/components/simple/SimpleAppShell';

export const metadata: Metadata = {
  title: 'Transform',
};

export default function AppPage() {
  return (
    <div className="container page stack simple-page">
      <SimpleAppShell />
    </div>
  );
}
