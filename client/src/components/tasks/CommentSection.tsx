import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { z } from 'zod';
import { api } from '../../lib/api';

const commentSchema = z
  .object({
    id: z.string().min(1),
    taskId: z.string().min(1),
    userId: z.string().min(1),
    userName: z.string().min(1),
    content: z.string().min(1),
    createdAt: z.string().datetime()
  })
  .passthrough();

const commentsSchema = z.array(commentSchema);

type CommentItem = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  taskId: string;
  isActive: boolean;
}

function formatTimestamp(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown time';
  }

  return parsedDate.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function CommentSection({ taskId, isActive }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadComments(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/comments', { params: { taskId } });
      const parsedComments = commentsSchema.parse(response.data);
      setComments(parsedComments);
    } catch {
      setError('Failed to load comments.');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadComments();
  }, [isActive, taskId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post('/comments', {
        taskId,
        content: trimmedContent
      });

      const createdComment = commentSchema.parse(response.data);
      setComments((previousComments) => [...previousComments, createdComment]);
      setContent('');
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && typeof caughtError.response?.data?.message === 'string') {
        setError(caughtError.response.data.message);
      } else {
        setError('Failed to add comment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-3" aria-label="Comments">
      <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/70 p-3">
        {isLoading ? <p className="text-sm text-slate-600">Loading comments...</p> : null}

        {!isLoading && comments.length === 0 ? <p className="text-sm text-slate-600">No comments yet.</p> : null}

        {!isLoading
          ? comments.map((comment) => (
              <article className="rounded-md border border-slate-200 bg-white px-3 py-2" key={comment.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-700">{comment.userName}</p>
                  <time className="text-xs text-slate-500">{formatTimestamp(comment.createdAt)}</time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>
              </article>
            ))
          : null}
      </div>

      <form className="space-y-2" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-600">Add comment</span>
          <textarea
            className="min-h-20 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 transition focus:ring-2"
            disabled={isSubmitting}
            maxLength={5000}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a comment..."
            value={content}
          />
        </label>

        {error ? <p className="text-xs text-rose-600">{error}</p> : null}

        <div className="flex justify-end">
          <button
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
