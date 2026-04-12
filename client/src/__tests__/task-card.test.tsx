import { fireEvent, render, screen } from '@testing-library/react';
import TaskCard from '../components/tasks/TaskCard';

describe('TaskCard', () => {
  it('renders key task details and assignees', () => {
    render(
      <TaskCard
        task={{
          id: 'task-1',
          columnId: 'column-1',
          title: 'Implement drag and drop',
          description: 'DnD support',
          priority: 'HIGH',
          dueDate: '2026-05-01T00:00:00.000Z',
          assignees: [
            { id: 'user-1', name: 'Alice Blue' },
            { id: 'user-2', name: 'John Doe' }
          ],
          labels: [{ id: 'label-1', name: 'Feature', color: '#22c55e' }]
        }}
      />
    );

    expect(screen.getByText('Implement drag and drop')).toBeInTheDocument();
    expect(screen.getByText(/Due/)).toBeInTheDocument();
    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('fires onClick when selected', () => {
    const onClick = vi.fn();

    render(
      <TaskCard
        onClick={onClick}
        task={{
          id: 'task-1',
          columnId: 'column-1',
          title: 'Click me',
          priority: 'MEDIUM'
        }}
      />
    );

    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
