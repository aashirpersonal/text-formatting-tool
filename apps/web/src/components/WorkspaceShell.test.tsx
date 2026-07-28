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
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { resetOperationIdCounter } from '@/recipes/operation-factory';

describe('WorkspaceShell local recipe workspace', () => {
  beforeEach(() => {
    executeMock.mockClear();
    cancelMock.mockClear();
    disposeMock.mockClear();
    resetOperationIdCounter(0);
    window.confirm = vi.fn(() => true);
  });

  it('updates counts and clears input', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    const input = screen.getByTestId('document-input');
    await user.type(input, 'hello\nworld');
    expect(screen.getByTestId('char-count')).toHaveTextContent('11 characters');
    expect(screen.getByTestId('line-count')).toHaveTextContent('2 lines');
    await user.click(screen.getByTestId('clear-input'));
    expect(input).toHaveValue('');
  });

  it('keeps privacy status visible and blocks preview for invalid recipe', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    expect(screen.getByTestId('privacy-status')).toHaveTextContent(/entirely in your browser/i);
    await user.type(screen.getByTestId('document-input'), 'alpha');
    await user.click(screen.getByTestId('goto-recipe'));
    expect(screen.getByTestId('run-preview')).toBeDisabled();
    expect(screen.getByTestId('recipe-errors')).toBeVisible();
  });

  it('adds, edits, reorders, disables, and removes operations', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    await user.type(screen.getByTestId('document-input'), 'a\nb');
    await user.click(screen.getByTestId('goto-recipe'));
    await user.selectOptions(screen.getByTestId('add-operation'), 'lines.trim');
    await user.selectOptions(screen.getByTestId('add-operation'), 'lines.affix');
    const cards = screen.getAllByTestId(/operation-card-/);
    expect(cards).toHaveLength(2);
    const secondId = cards[1]!.getAttribute('data-testid')!.replace('operation-card-', '');
    await user.type(screen.getByTestId(`field-prefix-${secondId}`), '* ');
    await user.click(screen.getByTestId(`operation-up-${secondId}`));
    const reordered = screen.getAllByTestId(/operation-card-/);
    expect(reordered[0]).toHaveAttribute('data-testid', `operation-card-${secondId}`);
    await user.click(screen.getByTestId(`operation-enabled-${secondId}`));
    expect(screen.getByTestId(`operation-enabled-${secondId}`)).not.toBeChecked();
    await user.click(screen.getByTestId(`operation-remove-${secondId}`));
    expect(screen.getAllByTestId(/operation-card-/)).toHaveLength(1);
  });

  it('loads a template into an editable valid recipe and enables preview', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    await user.type(screen.getByTestId('document-input'), '  apple  \napple\n');
    await user.click(screen.getByTestId('goto-recipe'));
    await user.click(screen.getByTestId('template-clean-copied-list'));
    expect(screen.getByTestId('recipe-valid')).toBeVisible();
    expect(screen.getByTestId('run-preview')).toBeEnabled();
    expect(screen.getByTestId('technical-recipe')).toBeInTheDocument();
  });

  it('runs preview and full processing through the worker client', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    await user.type(screen.getByTestId('document-input'), '  apple  \n  apple  \n  banana  \n');
    await user.click(screen.getByTestId('goto-recipe'));
    await user.click(screen.getByTestId('template-clean-copied-list'));
    await user.click(screen.getByTestId('run-preview'));
    await waitFor(() => expect(executeMock).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('preview-after')).toHaveTextContent('apple'));
    await user.click(screen.getByTestId('run-full'));
    await waitFor(() => expect(screen.getByTestId('result-output')).toBeVisible());
    expect(screen.getByTestId('copy-result')).toBeVisible();
    expect(screen.getByTestId('download-result')).toBeVisible();
    expect(screen.getByTestId('restore-original-from-result')).toBeEnabled();
  });

  it('invalidates preview when input changes', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    await user.type(screen.getByTestId('document-input'), '  a  \n');
    await user.click(screen.getByTestId('goto-recipe'));
    await user.click(screen.getByTestId('template-clean-copied-list'));
    await user.click(screen.getByTestId('run-preview'));
    await waitFor(() => expect(screen.getByTestId('preview-after')).toBeVisible());
    await user.click(screen.getByTestId('stage-input'));
    await user.type(screen.getByTestId('document-input'), 'x');
    expect(screen.queryByTestId('preview-after')).not.toBeInTheDocument();
  });

  it('shows file validation errors', async () => {
    render(<WorkspaceShell />);
    const input = screen.getByTestId('file-input');
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByTestId('file-error')).toBeVisible();
  });

  it('rejects oversized files before reading and keeps existing input', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    await user.type(screen.getByTestId('document-input'), 'keep-me');
    const input = screen.getByTestId('file-input');
    const textFn = vi.fn(async () => 'should-not-load');
    const file = {
      name: 'huge.txt',
      type: 'text/plain',
      size: 10 * 1024 * 1024 + 1,
      text: textFn,
    } as unknown as File;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByTestId('file-error')).toHaveTextContent(/10 MiB/i);
    expect(textFn).not.toHaveBeenCalled();
    expect(screen.getByTestId('document-input')).toHaveValue('keep-me');
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('invalidates preview and result when an operation field changes', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    await user.type(screen.getByTestId('document-input'), 'a\nb\n');
    const original = (screen.getByTestId('document-input') as HTMLTextAreaElement).value;
    await user.click(screen.getByTestId('goto-recipe'));
    await user.selectOptions(screen.getByTestId('add-operation'), 'replace.literal');
    const card = screen.getByTestId(/operation-card-/);
    const opId = card.getAttribute('data-testid')!.replace('operation-card-', '');
    await user.type(screen.getByTestId(`field-find-${opId}`), 'a');
    await user.type(screen.getByTestId(`field-replacement-${opId}`), 'b');
    await user.click(screen.getByTestId('run-preview'));
    await waitFor(() => expect(screen.getByTestId('preview-after')).toBeVisible());
    await user.click(screen.getByTestId('run-full'));
    await waitFor(() => expect(screen.getByTestId('result-output')).toBeVisible());

    await user.click(screen.getByTestId('stage-recipe'));
    await user.clear(screen.getByTestId(`field-replacement-${opId}`));
    await user.type(screen.getByTestId(`field-replacement-${opId}`), 'c');

    expect(screen.getByTestId('stage-result')).toBeDisabled();
    await user.click(screen.getByTestId('stage-preview'));
    expect(screen.queryByTestId('preview-after')).not.toBeInTheDocument();
    expect(screen.getByTestId('run-full')).toBeDisabled();
    await user.click(screen.getByTestId('stage-input'));
    expect(screen.getByTestId('document-input')).toHaveValue(original);
  });
});
