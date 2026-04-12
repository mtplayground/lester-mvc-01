import request from 'supertest';
import app from '../app';
import { authHeader, registerAndLogin } from './helpers';

describe('Board, Task, and Comment APIs', () => {
  it('supports happy-path board, task, and comment operations', async () => {
    const auth = await registerAndLogin('board-task-comment');

    const createBoardResponse = await request(app)
      .post('/api/boards')
      .set(authHeader(auth.token))
      .send({ name: 'Roadmap' });

    expect(createBoardResponse.status).toBe(201);
    expect(createBoardResponse.body.name).toBe('Roadmap');
    expect(typeof createBoardResponse.body.id).toBe('string');

    const boardId = createBoardResponse.body.id as string;

    const listBoardsResponse = await request(app).get('/api/boards').set(authHeader(auth.token));

    expect(listBoardsResponse.status).toBe(200);
    expect(listBoardsResponse.body).toHaveLength(1);
    expect(listBoardsResponse.body[0].id).toBe(boardId);

    const createColumnResponse = await request(app)
      .post('/api/columns')
      .set(authHeader(auth.token))
      .send({ boardId, name: 'To Do' });

    expect(createColumnResponse.status).toBe(201);
    expect(createColumnResponse.body).toMatchObject({
      boardId,
      name: 'To Do'
    });

    const columnId = createColumnResponse.body.id as string;

    const createTaskResponse = await request(app)
      .post('/api/tasks')
      .set(authHeader(auth.token))
      .send({
        columnId,
        title: 'First Task',
        description: 'Ship integration tests',
        priority: 'MEDIUM'
      });

    expect(createTaskResponse.status).toBe(201);
    expect(createTaskResponse.body).toMatchObject({
      columnId,
      title: 'First Task',
      description: 'Ship integration tests',
      priority: 'MEDIUM'
    });

    const taskId = createTaskResponse.body.id as string;

    const updateTaskResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeader(auth.token))
      .send({
        title: 'First Task Updated',
        priority: 'HIGH'
      });

    expect(updateTaskResponse.status).toBe(200);
    expect(updateTaskResponse.body).toMatchObject({
      id: taskId,
      title: 'First Task Updated',
      priority: 'HIGH'
    });

    const getTaskResponse = await request(app).get(`/api/tasks/${taskId}`).set(authHeader(auth.token));

    expect(getTaskResponse.status).toBe(200);
    expect(getTaskResponse.body.id).toBe(taskId);

    const createCommentResponse = await request(app)
      .post('/api/comments')
      .set(authHeader(auth.token))
      .send({
        taskId,
        content: 'This is a test comment.'
      });

    expect(createCommentResponse.status).toBe(201);
    expect(createCommentResponse.body).toMatchObject({
      taskId,
      content: 'This is a test comment.',
      userName: auth.name
    });

    const commentId = createCommentResponse.body.id as string;

    const listCommentsResponse = await request(app)
      .get('/api/comments')
      .set(authHeader(auth.token))
      .query({ taskId });

    expect(listCommentsResponse.status).toBe(200);
    expect(listCommentsResponse.body).toHaveLength(1);
    expect(listCommentsResponse.body[0]).toMatchObject({
      id: commentId,
      taskId,
      userName: auth.name
    });

    const updateCommentResponse = await request(app)
      .put(`/api/comments/${commentId}`)
      .set(authHeader(auth.token))
      .send({ content: 'Updated comment body.' });

    expect(updateCommentResponse.status).toBe(200);
    expect(updateCommentResponse.body.content).toBe('Updated comment body.');

    const deleteCommentResponse = await request(app).delete(`/api/comments/${commentId}`).set(authHeader(auth.token));
    expect(deleteCommentResponse.status).toBe(204);

    const deleteTaskResponse = await request(app).delete(`/api/tasks/${taskId}`).set(authHeader(auth.token));
    expect(deleteTaskResponse.status).toBe(204);

    const deleteBoardResponse = await request(app).delete(`/api/boards/${boardId}`).set(authHeader(auth.token));
    expect(deleteBoardResponse.status).toBe(204);
  });

  it('returns key error responses for unauthorized or missing resources', async () => {
    const auth = await registerAndLogin('board-task-comment-errors');

    const unauthorizedBoardsResponse = await request(app).get('/api/boards');
    expect(unauthorizedBoardsResponse.status).toBe(401);

    const createBoardResponse = await request(app)
      .post('/api/boards')
      .set(authHeader(auth.token))
      .send({ name: 'Errors Board' });

    const boardId = createBoardResponse.body.id as string;

    const invalidTaskCreateResponse = await request(app)
      .post('/api/tasks')
      .set(authHeader(auth.token))
      .send({
        columnId: boardId,
        title: 'Invalid task'
      });

    expect(invalidTaskCreateResponse.status).toBe(404);
    expect(invalidTaskCreateResponse.body.message).toBe('Column not found');

    const missingTaskCommentResponse = await request(app)
      .post('/api/comments')
      .set(authHeader(auth.token))
      .send({
        taskId: boardId,
        content: 'Should fail'
      });

    expect(missingTaskCommentResponse.status).toBe(404);
    expect(missingTaskCommentResponse.body.message).toBe('Task not found');
  });
});
