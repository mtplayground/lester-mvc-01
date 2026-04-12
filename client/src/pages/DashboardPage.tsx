import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import BoardCard from '../components/boards/BoardCard';
import CreateBoardModal from '../components/boards/CreateBoardModal';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';

const boardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  columns: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      position: z.number()
    })
  )
});

const boardListSchema = z.array(boardSchema);

type Board = z.infer<typeof boardSchema>;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedBoards = useMemo(
    () =>
      [...boards].sort((left, right) => {
        if (left.createdAt < right.createdAt) return 1;
        if (left.createdAt > right.createdAt) return -1;
        return 0;
      }),
    [boards]
  );

  async function fetchBoards(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/boards');
      const parsed = boardListSchema.parse(response.data);
      setBoards(parsed);
    } catch {
      const message = 'Failed to load boards. Please refresh and try again.';
      setError(message);
      showToast({
        type: 'error',
        title: 'Could not load boards',
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchBoards();
  }, []);

  async function createBoard(name: string): Promise<void> {
    try {
      setIsCreating(true);
      setError(null);
      const response = await api.post('/boards', { name });
      const createdBoard = boardSchema.parse(response.data);
      setBoards((previous) => [createdBoard, ...previous]);
      setIsCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Board created',
        description: `"${createdBoard.name}" is ready`
      });
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        const message = caughtError.response.data.message;
        setError(message);
        showToast({
          type: 'error',
          title: 'Board creation failed',
          description: message
        });
      } else {
        const message = 'Failed to create board. Please try again.';
        setError(message);
        showToast({
          type: 'error',
          title: 'Board creation failed',
          description: message
        });
      }
    } finally {
      setIsCreating(false);
    }
  }

  function openBoard(boardId: string): void {
    navigate(`/boards/${boardId}`);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Board Dashboard</h2>
          <p className="text-sm text-slate-600">Track all boards and create a new one.</p>
        </div>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          onClick={() => setIsCreateModalOpen(true)}
          type="button"
        >
          Create Board
        </button>
      </div>

      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={index}>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && sortedBoards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No boards yet. Create your first board to get started.
        </div>
      ) : null}

      {!isLoading && sortedBoards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedBoards.map((board) => (
            <BoardCard board={board} key={board.id} onClick={openBoard} />
          ))}
        </div>
      ) : null}

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreating}
        onClose={() => {
          if (!isCreating) {
            setIsCreateModalOpen(false);
          }
        }}
        onCreate={createBoard}
      />
    </section>
  );
}
