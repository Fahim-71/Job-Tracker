import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const unauthorized = (res) => res.status(401).json({ message: 'Not authorized' });

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return unauthorized(res);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return unauthorized(res);
  }

  // Load the user so tokens for deleted accounts stop working.
  const user = await User.findById(payload.id);
  if (!user) return unauthorized(res);

  req.user = user; // req.user.id is the string id used to scope queries
  next();
});
