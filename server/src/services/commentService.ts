import { prisma } from '../lib/prisma';
import type { CreateCommentBody, UpdateCommentBody } from '../validators/comment';

export class CommentError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'CommentError';
    this.statusCode = statusCode;
  }
}

function mapComment(comment: {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    name: string;
  };
}) {
  return {
    id: comment.id,
    taskId: comment.taskId,
    userId: comment.userId,
    userName: comment.user.name,
    content: comment.content,
    createdAt: comment.createdAt
  };
}

async function assertTaskOwnership(taskId: string, ownerId: string): Promise<void> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          createdBy: ownerId
        }
      }
    },
    select: {
      id: true
    }
  });

  if (!task) {
    throw new CommentError('Task not found', 404);
  }
}

async function findOwnedComment(commentId: string, ownerId: string) {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      task: {
        column: {
          board: {
            createdBy: ownerId
          }
        }
      }
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  if (!comment) {
    throw new CommentError('Comment not found', 404);
  }

  return comment;
}

export async function listCommentsByTask(userId: string, taskId: string) {
  await assertTaskOwnership(taskId, userId);

  const comments = await prisma.comment.findMany({
    where: {
      taskId
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  return comments.map(mapComment);
}

export async function createComment(userId: string, input: CreateCommentBody) {
  await assertTaskOwnership(input.taskId, userId);

  const comment = await prisma.comment.create({
    data: {
      taskId: input.taskId,
      userId,
      content: input.content
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  return mapComment(comment);
}

export async function updateComment(userId: string, commentId: string, input: UpdateCommentBody) {
  const comment = await findOwnedComment(commentId, userId);

  if (comment.userId !== userId) {
    throw new CommentError('You can only edit your own comments', 403);
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: commentId
    },
    data: {
      content: input.content
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  return mapComment(updatedComment);
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await findOwnedComment(commentId, userId);

  if (comment.userId !== userId) {
    throw new CommentError('You can only delete your own comments', 403);
  }

  await prisma.comment.delete({
    where: {
      id: commentId
    }
  });
}
