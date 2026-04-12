"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentError = void 0;
exports.listCommentsByTask = listCommentsByTask;
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
const prisma_1 = require("../lib/prisma");
class CommentError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'CommentError';
        this.statusCode = statusCode;
    }
}
exports.CommentError = CommentError;
function mapComment(comment) {
    return {
        id: comment.id,
        taskId: comment.taskId,
        userId: comment.userId,
        userName: comment.user.name,
        content: comment.content,
        createdAt: comment.createdAt
    };
}
async function assertTaskOwnership(taskId, ownerId) {
    const task = await prisma_1.prisma.task.findFirst({
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
async function findOwnedComment(commentId, ownerId) {
    const comment = await prisma_1.prisma.comment.findFirst({
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
async function listCommentsByTask(userId, taskId) {
    await assertTaskOwnership(taskId, userId);
    const comments = await prisma_1.prisma.comment.findMany({
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
async function createComment(userId, input) {
    await assertTaskOwnership(input.taskId, userId);
    const comment = await prisma_1.prisma.comment.create({
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
async function updateComment(userId, commentId, input) {
    const comment = await findOwnedComment(commentId, userId);
    if (comment.userId !== userId) {
        throw new CommentError('You can only edit your own comments', 403);
    }
    const updatedComment = await prisma_1.prisma.comment.update({
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
async function deleteComment(userId, commentId) {
    const comment = await findOwnedComment(commentId, userId);
    if (comment.userId !== userId) {
        throw new CommentError('You can only delete your own comments', 403);
    }
    await prisma_1.prisma.comment.delete({
        where: {
            id: commentId
        }
    });
}
