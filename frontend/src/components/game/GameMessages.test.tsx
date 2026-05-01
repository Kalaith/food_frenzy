import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameMessages } from './GameMessages';

describe('GameMessages', () => {
  it('hides the welcome message after the intro timeout', () => {
    vi.useFakeTimers();

    render(<GameMessages messages={[]} />);

    expect(screen.getByText(/Welcome to Feast Frenzy!/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(8300);
    });

    expect(screen.queryByText(/Welcome to Feast Frenzy!/)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
