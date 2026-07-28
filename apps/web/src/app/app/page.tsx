import type { Metadata } from 'next';
import { SimpleAppShell } from '@/components/simple/SimpleAppShell';

export const metadata: Metadata = {
  title: 'Transform',
};

export default function AppPage() {
  return <SimpleAppShell />;
}
