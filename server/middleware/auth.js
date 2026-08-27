import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../models/User.js';
import { fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return fail(res, 'You must be logged in to do that', 'UNAUTHORIZED', 401);

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) return fail(res, 'User no longer exists', 'UNAUTHORIZED', 401);
    req.user = user;
    next();
  } catch {
    return fail(res, 'Session expired or invalid, please log in again', 'UNAUTHORIZED', 401);
  }
});
