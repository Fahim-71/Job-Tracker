import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateRegister, validateLogin } from '../utils/validate.js';

const TOKEN_TTL = '7d';
const INVALID_CREDENTIALS = 'Invalid email or password';

// Compared against when the email is unknown so response time doesn't reveal it.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const signToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

export const register = asyncHandler(async (req, res) => {
  const error = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error });

  const { name, email, password } = req.body;
  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    throw err;
  }

  res.status(201).json({ token: signToken(user), user });
});

export const login = asyncHandler(async (req, res) => {
  const error = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error });

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  const valid = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

  if (!valid) return res.status(401).json({ message: INVALID_CREDENTIALS });

  res.json({ token: signToken(user), user });
});

export const me = (req, res) => {
  res.json({ user: req.user });
};
