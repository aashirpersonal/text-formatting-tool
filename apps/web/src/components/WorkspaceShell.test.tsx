import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkspaceShell } from '@/components/WorkspaceShell';

describe('WorkspaceShell', () => {
  it('updates character and line counts as the user types', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    const input = screen.getByTestId('document-input');
    await user.type(input, 'hello\nworld');
    expect(screen.getByTestId('char-count')).toHaveTextContent('11 characters');
    expect(screen.getByTestId('line-count')).toHaveTextContent('2 lines');
  });

  it('clears input', async () => {
    const user = userEvent.setup();
    render(<WorkspaceShell />);
    const input = screen.getByTestId('document-input');
    await user.type(input, 'temporary');
    await user.click(screen.getByTestId('clear-input'));
    expect(input).toHaveValue('');
    expect(screen.getByTestId('char-count')).toHaveTextContent('0 characters');
  });

  it('shows recipe generation as unavailable and keeps privacy status visible', () => {
    render(<WorkspaceShell />);
    const button = screen.getByTestId('generate-recipe');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('recipe-unavailable-note')).toBeVisible();
    expect(screen.getByTestId('privacy-status')).toHaveTextContent(/does not send entered text/i);
  });
});
