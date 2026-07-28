import { executeTransformationPlan } from '@tft/transformation-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeMock = vi.fn(async (args: { input: string; plan: unknown }) =>
  executeTransformationPlan(args.input, args.plan),
);
const cancelMock = vi.fn();
const disposeMock = vi.fn();

vi.mock('@/worker/transformation-worker-client', () => ({
  TransformationWorkerClient: class {
    execute = executeMock;
    cancel = cancelMock;
    dispose = disposeMock;
  },
  isWorkerCancellation: (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'WORKER_CANCELLED',
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleAppShell } from '@/components/simple/SimpleAppShell';

describe('SimpleAppShell', () => {
  beforeEach(() => {
    executeMock.mockClear();
    cancelMock.mockClear();
    disposeMock.mockClear();
    window.confirm = vi.fn(() => true);
  });

  it('shows the prototype notice and hides advanced JSON by default', () => {
    render(<SimpleAppShell />);
    expect(screen.getByTestId('prototype-notice')).toHaveTextContent(/prototype mode/i);
    expect(screen.queryByText(/schemaVersion/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('advanced-editor-link')).toHaveAttribute('href', '/app/advanced');
  });

  it('loads an example prompt and rejects unsupported instructions', async () => {
    const user = userEvent.setup();
    render(<SimpleAppShell />);
    await user.type(screen.getByTestId('document-input'), 'a\na\n');
    await user.click(screen.getByTestId('example-clean-list'));
    expect(screen.getByTestId('instruction-input')).toHaveValue(
      'Remove duplicate lines and trim spaces',
    );
    await user.clear(screen.getByTestId('instruction-input'));
    await user.type(screen.getByTestId('instruction-input'), 'summarise this like a poet');
    await user.click(screen.getByTestId('generate-transformation'));
    expect(await screen.findByTestId('generation-error')).toHaveTextContent(
      /prototype currently supports/i,
    );
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('generates, previews, and applies a supported transformation locally', async () => {
    const user = userEvent.setup();
    render(<SimpleAppShell />);
    await user.type(screen.getByTestId('document-input'), '  apple  \n  apple  \n  banana  \n');
    await user.click(screen.getByTestId('example-clean-list'));
    await user.click(screen.getByTestId('generate-transformation'));
    expect(await screen.findByTestId('generation-summary')).toBeVisible();
    expect(screen.getByTestId('advanced-details')).not.toHaveAttribute('open');
    await user.click(screen.getByTestId('run-preview'));
    await waitFor(() => expect(screen.getByTestId('preview-after')).toHaveTextContent('apple'));
    await user.click(screen.getByTestId('run-full'));
    await waitFor(() => expect(screen.getByTestId('result-output')).toBeVisible());
    expect(screen.getByTestId('copy-result')).toBeVisible();
    expect(screen.getByTestId('download-result')).toBeVisible();
    expect(screen.getByTestId('success-pill')).toHaveTextContent(/processed locally/i);
    expect(executeMock).toHaveBeenCalled();
  });

  it('preserves original input after a successful transformation', async () => {
    const user = userEvent.setup();
    render(<SimpleAppShell />);
    const original = '  apple  \n  apple  \n';
    await user.type(screen.getByTestId('document-input'), original);
    await user.click(screen.getByTestId('example-clean-list'));
    await user.click(screen.getByTestId('generate-transformation'));
    await user.click(await screen.findByTestId('run-preview'));
    await waitFor(() => expect(screen.getByTestId('preview-after')).toBeVisible());
    await user.click(screen.getByTestId('run-full'));
    await waitFor(() => expect(screen.getByTestId('result-output')).toBeVisible());
    await user.click(screen.getByTestId('restore-original-from-result'));
    expect(screen.getByTestId('document-input')).toHaveValue(original);
  });
});
