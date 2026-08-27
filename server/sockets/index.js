import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../models/User.js';
import Project from '../models/Project.js';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    },
  });

  // Authenticate every socket connection with the same JWT used for REST calls.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Not authorized'));
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Not authorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    // Client asks to join a project room only after we confirm membership,
    // preventing unauthorized users from receiving another project's events.
    socket.on('project:join', async (projectId) => {
      const project = await Project.findById(projectId);
      const isMember = project?.members.some((m) => m.user.toString() === socket.user._id.toString());
      if (isMember) socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('task:viewing', ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit('task:presence', {
        taskId,
        user: { id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
      });
    });

    socket.on('disconnect', () => {
      // Room membership is cleaned up automatically by socket.io on disconnect.
    });
  });

  return io;
}

export function getIO() {
  return io;
}
