import mongoose from 'mongoose';
import Application, { STATUSES } from '../models/Application.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  isValidId,
  pickApplicationFields,
  validateApplication,
} from '../utils/validate.js';

const notFound = (res) => res.status(404).json({ message: 'Application not found' });
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listApplications = asyncHandler(async (req, res) => {
  const { status, search, sort = 'newest' } = req.query;
  const filter = { user: req.user.id };

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    filter.status = status;
  }

  if (search !== undefined) {
    if (typeof search !== 'string') return res.status(400).json({ message: 'Invalid search' });
    const term = search.trim();
    if (term) {
      const rx = new RegExp(escapeRegex(term), 'i');
      filter.$or = [{ company: rx }, { role: rx }];
    }
  }

  if (sort !== 'newest' && sort !== 'oldest') {
    return res.status(400).json({ message: 'Sort must be newest or oldest' });
  }
  const dir = sort === 'oldest' ? 1 : -1;

  const applications = await Application.find(filter).sort({ dateApplied: dir, _id: dir });
  res.json({ applications });
});

export const getApplication = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return notFound(res);
  const application = await Application.findOne({ _id: req.params.id, user: req.user.id });
  if (!application) return notFound(res);
  res.json({ application });
});

export const createApplication = asyncHandler(async (req, res) => {
  const data = pickApplicationFields(req.body);
  const error = validateApplication(data);
  if (error) return res.status(400).json({ message: error });

  const application = await Application.create({ ...data, user: req.user.id });
  res.status(201).json({ application });
});

export const updateApplication = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return notFound(res);

  const data = pickApplicationFields(req.body);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  const error = validateApplication(data, { partial: true });
  if (error) return res.status(400).json({ message: error });

  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!application) return notFound(res);
  res.json({ application });
});

export const deleteApplication = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return notFound(res);
  const application = await Application.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!application) return notFound(res);
  res.json({ message: 'Application deleted' });
});

export const getStats = asyncHandler(async (req, res) => {
  // aggregate() does not auto-cast, so the id must be an ObjectId here.
  const rows = await Application.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
  for (const { _id, count } of rows) {
    if (_id in stats) stats[_id] = count;
    stats.total += count;
  }
  const responseRate = stats.total
    ? Math.round(((stats.interview + stats.offer) / stats.total) * 100)
    : 0;

  res.json({ ...stats, responseRate });
});
