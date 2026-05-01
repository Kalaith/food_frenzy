import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BalanceSimulatorPanel } from './BalanceSimulatorPanel';

describe('BalanceSimulatorPanel', () => {
  it('opens the simulator modal from the launcher button', async () => {
    const user = userEvent.setup();
    render(<BalanceSimulatorPanel />);

    await user.click(screen.getByRole('button', { name: 'Balance Simulator' }));

    expect(screen.getByRole('heading', { name: 'Balance Simulator' })).toBeInTheDocument();
    expect(screen.getByText('Score / min')).toBeInTheDocument();
    expect(screen.getByText('Run Averages')).toBeInTheDocument();
  });
});
