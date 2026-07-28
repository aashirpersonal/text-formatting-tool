import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { executeTransformationPlan } from '@tft/transformation-engine';
import type { RecipeGenerationAdapter } from '@/generation/types';

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
  isWorkerCancellation: () => false,
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

const plan = {
  schemaVersion: '1.0' as const,
  title: 'Clean list',
  summary: 'Trim and dedupe.',
  assumptions: [] as string[],
  warnings: [] as string[],
  operations: [
    {
      id: 'op1',
      type: 'lines.trim' as const,
      enabled: true,
      description: 'Trim',
      mode: 'both' as const,
    },
    {
      id: 'op2',
      type: 'lines.removeEmpty' as const,
      enabled: true,
      description: 'Remove empty',
      whitespaceOnly: true,
    },
    {
      id: 'op3',
      type: 'lines.dedupe' as const,
      enabled: true,
      description: 'Dedupe',
      caseSensitive: true,
      trimBeforeCompare: true,
    },
  ],
};

const largeDoc = `${'line-content-padding\n'.repeat(120)}SECRET_FULL_DOCUMENT_MARKER\n${'tail-content-padding\n'.repeat(120)}`;

describe('SimpleAppShell OpenAI sample review', () => {
  beforeEach(() => {
    executeMock.mockClear();
  });

  it('opens review, never sends full document, and continues into preview', async () => {
    const user = userEvent.setup();
    const generate = vi.fn(
      async (request: {
        instruction: string;
        samples?: ReadonlyArray<{ id: string; text: string }>;
        documentMetadata?: { characters: number };
      }) => {
        expect(request.samples?.length).toBeGreaterThan(0);
        expect(request).not.toHaveProperty('document');
        expect(request).not.toHaveProperty('fullDocument');
        const sampleChars = request.samples!.reduce((sum, sample) => sum + sample.text.length, 0);
        expect(sampleChars).toBeLessThan(largeDoc.length);
        expect(request.documentMetadata?.characters).toBe(largeDoc.length);
        return {
          ok: true as const,
          title: 'Clean list',
          explanation: 'Trim and dedupe.',
          assumptions: [],
          warnings: [],
          plan,
          prototype: false,
        };
      },
    );
    const adapter: RecipeGenerationAdapter = {
      modeLabel: 'AI recipes · local execution',
      requiresSampleReview: true,
      generate,
    };

    render(
      <SimpleAppShell
        initialStatus={{ mode: 'openai', openaiReady: true }}
        generatorOverride={adapter}
        initialDocument={largeDoc}
        initialInstruction="Remove duplicate lines and trim spaces"
      />,
    );

    await user.click(screen.getByTestId('generate-transformation'));
    expect(await screen.findByTestId('sample-review')).toBeVisible();
    expect(screen.getByTestId('sample-review-summary')).toHaveTextContent(/characters selected/i);
    expect(generate).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('cancel-sample-review'));
    expect(screen.queryByTestId('sample-review')).not.toBeInTheDocument();
    expect(generate).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('generate-transformation'));
    expect(screen.getByTestId('sample-text-start')).toBeVisible();
    await user.clear(screen.getByTestId('sample-text-start'));
    await user.type(screen.getByTestId('sample-text-start'), '  apple  \n  apple  \n');
    await user.click(screen.getByTestId('generate-safely'));

    expect(await screen.findByTestId('generation-summary')).toBeVisible();
    expect(screen.getByTestId('generation-mode-badge')).toHaveTextContent(/AI recipes/i);
    expect(screen.getByTestId('advanced-details')).not.toHaveAttribute('open');
    expect(screen.getByTestId('technical-recipe')).not.toHaveAttribute('open');
    expect(generate).toHaveBeenCalledOnce();

    await user.click(screen.getByTestId('run-preview'));
    await waitFor(() => expect(screen.getByTestId('preview-after')).toBeVisible());
    await user.click(screen.getByTestId('run-full'));
    await waitFor(() => expect(screen.getByTestId('result-output')).toBeVisible());
  });

  it('keeps at least one sample and surfaces unsupported/rate-limit messages', async () => {
    const user = userEvent.setup();
    const generate = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        code: 'UNSUPPORTED_INSTRUCTION',
        message:
          'This request needs open-ended writing or reasoning that the local transformation engine cannot safely reproduce.',
      })
      .mockResolvedValueOnce({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many recipe requests. Please wait a moment and try again.',
      })
      .mockResolvedValueOnce({
        ok: false,
        code: 'CONFIGURATION_UNAVAILABLE',
        message: 'AI recipe generation is not configured on this server yet.',
      });

    render(
      <SimpleAppShell
        initialStatus={{ mode: 'openai', openaiReady: false }}
        generatorOverride={{
          modeLabel: 'AI recipes · local execution',
          requiresSampleReview: true,
          generate,
        }}
        initialDocument={largeDoc}
        initialInstruction="summarise poetically"
      />,
    );

    await user.click(screen.getByTestId('generate-transformation'));
    expect(screen.getByTestId('sample-remove-start')).toBeEnabled();
    await user.click(screen.getByTestId('sample-remove-start'));
    expect(screen.queryByTestId('sample-start')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('sample-remove-middle'));
    const lastRemove = screen.getByText(/remove excerpt/i);
    expect(lastRemove).toBeDisabled();

    await user.click(screen.getByTestId('restore-samples'));
    expect(screen.getByTestId('sample-start')).toBeVisible();
    await user.click(screen.getByTestId('generate-safely'));
    expect(await screen.findByTestId('generation-error')).toHaveTextContent(/open-ended writing/i);

    await user.click(screen.getByTestId('generate-transformation'));
    await user.click(screen.getByTestId('generate-safely'));
    expect(await screen.findByTestId('generation-error')).toHaveTextContent(
      /too many recipe requests/i,
    );

    await user.click(screen.getByTestId('generate-transformation'));
    await user.click(screen.getByTestId('generate-safely'));
    expect(await screen.findByTestId('generation-error')).toHaveTextContent(/not configured/i);
  });
});
