import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { api } from '../../lib/api';

const activitySchema = z
  .object({
    id: z.string().min(1),
    taskId: z.string().min(1),
    userId: z.string().min(1),
    userName: z.string().min(1),
    action: z.string().min(1),
    metadata: z.record(z.unknown()).nullable().optional(),
    createdAt: z.string().datetime()
  })
  .passthrough();

const activitiesSchema = z.array(activitySchema);

type ActivityItem = z.infer<typeof activitySchema>;

interface ActivityFeedProps {
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

function formatActivityMessage(activity: ActivityItem): string {
  const metadata = activity.metadata ?? {};

  if (activity.action === 'TASK_CREATED') {
    return `${activity.userName} created this task`;
  }

  if (activity.action === 'TASK_ASSIGNED') {
    const assigneeName = typeof metadata.assigneeName === 'string' ? metadata.assigneeName : 'a user';
    return `${activity.userName} assigned ${assigneeName}`;
  }

  if (activity.action === 'TASK_COMPLETED') {
    return `${activity.userName} marked this task complete`;
  }

  if (activity.action === 'TASK_MOVED') {
    const fromColumnName = typeof metadata.fromColumnName === 'string' ? metadata.fromColumnName : 'Unknown';
    const toColumnName = typeof metadata.toColumnName === 'string' ? metadata.toColumnName : 'Unknown';
    return `${activity.userName} moved task from ${fromColumnName} to ${toColumnName}`;
  }

  return `${activity.userName} performed ${activity.action}`;
}

export default function ActivityFeed({ taskId, isActive }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadActivities(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/activities', { params: { taskId } });
      const parsedActivities = activitiesSchema.parse(response.data);
      setActivities(parsedActivities);
    } catch {
      setError('Failed to load activity feed.');
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadActivities();
  }, [isActive, taskId]);

  const chronologicalActivities = useMemo(
    () =>
      [...activities].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
    [activities]
  );

  return (
    <section aria-label="Activity feed" className="space-y-3">
      <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/70 p-3">
        {isLoading ? <p className="text-sm text-slate-600">Loading activity...</p> : null}

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        {!isLoading && !error && chronologicalActivities.length === 0 ? (
          <p className="text-sm text-slate-600">No activity yet.</p>
        ) : null}

        {!isLoading && !error
          ? chronologicalActivities.map((activity) => (
              <article className="rounded-md border border-slate-200 bg-white px-3 py-2" key={activity.id}>
                <p className="text-sm text-slate-700">{formatActivityMessage(activity)}</p>
                <time className="mt-1 block text-xs text-slate-500">{formatTimestamp(activity.createdAt)}</time>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
