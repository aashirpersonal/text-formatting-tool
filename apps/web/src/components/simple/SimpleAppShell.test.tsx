import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeTransformationPlan } from '@tft/transformation-engine';

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

import { SimpleAppShell } from '@/components/simple/SimpleAppShell';

describe('SimpleAppShell', () => {
  beforeEach(() => {
    executeMock.mockClear();
    cancelMock.mockClear();
    disposeMock.mockClear();
    window.confirm = vi.fn(() => true);
  });

  it('renders the full-height workspace without marketing copy', () => {
    render(<SimpleAppShell />);
    expect(screen.getByTestId('simple-app-shell')).toBeVisible();
    expect(screen.getByTestId('source-pane')).toBeVisible();
    expect(screen.getByTestId('result-pane')).toBeVisible();
    expect(screen.queryByText(/schemaVersion/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /tell ai what to change/i }),
    ).not.toBeInTheDocument();
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

  it('keeps Preview and Result mobile tabs disabled until ready', () => {
    render(<SimpleAppShell />);
    expect(screen.getByTestId('mobile-tab-preview')).toBeDisabled();
    expect(screen.getByTestId('mobile-tab-result')).toBeDisabled();
  });

  it('uses the warm light button system and reduced example density', () => {
    render(<SimpleAppShell />);
    const generate = screen.getByTestId('generate-transformation');
    expect(generate).toHaveClass('button-primary');
    expect(generate).toBeDisabled();
    expect(generate).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('clear-input')).toHaveClass('button-tertiary');
    expect(screen.getByTestId('example-featured').querySelectorAll('button')).toHaveLength(2);
    expect(screen.getByTestId('examples-menu')).not.toBeVisible();
    expect(screen.queryByTestId('restore-original')).not.toBeInTheDocument();
    const empty = screen.getByTestId('intelligence-empty');
    expect(empty).toHaveTextContent(/your preview will appear here/i);
    expect(empty).toHaveTextContent(/describe a change to compare/i);
    expect(empty.querySelectorAll('button')).toHaveLength(0);
  });

  it('reveals remaining examples from the dropdown without generating', async () => {
    const user = userEvent.setup();
    render(<SimpleAppShell />);
    await user.click(screen.getByTestId('examples-toggle'));
    expect(screen.getByTestId('examples-menu')).toBeVisible();
    expect(screen.getByTestId('example-bullet')).toBeVisible();
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('populates instruction from an example without auto-generating', async () => {
    const user = userEvent.setup();
    render(<SimpleAppShell />);
    await user.type(screen.getByTestId('document-input'), 'a\na\n');
    await user.click(screen.getByTestId('example-clean-list'));
    expect(screen.getByTestId('instruction-input')).toHaveValue(
      'Remove duplicate lines and trim spaces',
    );
    expect(screen.getByTestId('generate-transformation')).toBeEnabled();
    expect(executeMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId('generation-summary')).not.toBeInTheDocument();
  });

  it('shows restore original only when the source differs from the original', async () => {
    const user = userEvent.setup();
    render(<SimpleAppShell />);
    expect(screen.queryByTestId('restore-original')).not.toBeInTheDocument();
    await user.type(screen.getByTestId('document-input'), 'one\n');
    expect(screen.queryByTestId('restore-original')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('example-clean-list'));
    await user.click(screen.getByTestId('generate-transformation'));
    await user.click(await screen.findByTestId('run-preview'));
    await user.click(screen.getByTestId('run-full'));
    await waitFor(() => expect(screen.getByTestId('result-output')).toBeVisible());
    // After apply, source still holds original typed text until restore from result;
    // mutate source to unlock restore in the source toolbar.
    await user.clear(screen.getByTestId('document-input'));
    await user.type(screen.getByTestId('document-input'), 'changed\n');
    expect(screen.getByTestId('restore-original')).toBeVisible();
  });
});
