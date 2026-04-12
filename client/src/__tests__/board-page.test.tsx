import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BoardPage from '../pages/BoardPage';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();
const apiPatchMock = vi.fn();

vi.mock('../lib/api', () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
    post: (...args: unknown[]) => apiPostMock(...args),
    patch: (...args: unknown[]) => apiPatchMock(...args),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

function mockBoardPageData(): void {
  apiGetMock.mockImplementation((url: string) => {
    if (url === '/boards') {
      return Promise.resolve({
        data: [
          {
            id: 'board-1',
            name: 'Team Board',
            createdBy: 'user-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            columns: [{ id: 'column-1', name: 'To Do', position: 0 }]
          }
        ]
      });
    }

    if (url === '/tasks/column/column-1') {
      return Promise.resolve({
        data: [
          {
            id: 'task-1',
            columnId: 'column-1',
            title: 'Task One',
            description: null,
            priority: 'MEDIUM',
            dueDate: null,
            position: 1
          },
          {
            id: 'task-2',
            columnId: 'column-1',
            title: 'Task Two',
            description: null,
            priority: 'LOW',
            dueDate: null,
            position: 2
          }
        ]
      });
    }

    if (url === '/labels') {
      return Promise.resolve({ data: [] });
    }

    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
}

describe('BoardPage flows', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    apiPatchMock.mockReset();
    mockBoardPageData();
    apiPatchMock.mockResolvedValue({ data: [] });
  });

  it('creates a task from column form', async () => {
    const user = userEvent.setup();
    apiPostMock.mockResolvedValue({
      data: {
        id: 'task-3',
        columnId: 'column-1',
        title: 'Task Three',
        description: null,
        priority: 'HIGH',
        dueDate: null,
        position: 3
      }
    });

    render(
      <MemoryRouter initialEntries={['/boards/board-1']}>
        <Routes>
          <Route element={<BoardPage />} path="/boards/:boardId" />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Task One')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+ New Task' }));
    await user.type(screen.getByPlaceholderText('Task title'), 'Task Three');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/tasks', {
        columnId: 'column-1',
        title: 'Task Three',
        description: null,
        dueDate: null,
        priority: 'MEDIUM'
      });
    });

    expect(await screen.findByText('Task Three')).toBeInTheDocument();
  });

  it('persists drag-and-drop reorder through API', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/boards/board-1']}>
        <Routes>
          <Route element={<BoardPage />} path="/boards/:boardId" />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Task One')).toBeInTheDocument();

    await user.click(screen.getByTestId('mock-dnd-drop'));

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledTimes(1);
    });

    expect(apiPatchMock).toHaveBeenCalledWith('/tasks/reorder', {
      tasks: [
        { id: 'task-2', columnId: 'column-1', position: 1 },
        { id: 'task-1', columnId: 'column-1', position: 2 }
      ]
    });
  });
});
