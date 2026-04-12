import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock('../lib/api', () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
    post: (...args: unknown[]) => apiPostMock(...args)
  }
}));

describe('DashboardPage create board flow', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    apiGetMock.mockResolvedValue({ data: [] });
  });

  it('creates a board from modal form', async () => {
    const user = userEvent.setup();

    apiPostMock.mockResolvedValue({
      data: {
        id: 'board-1',
        name: 'Planning',
        createdBy: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        columns: []
      }
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Create Board' }));
    await user.type(screen.getByLabelText('Board name'), 'Planning');
    await user.click(screen.getByRole('button', { name: 'Create board' }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/boards', { name: 'Planning' });
    });

    expect(await screen.findByText('Planning')).toBeInTheDocument();
  });
});
