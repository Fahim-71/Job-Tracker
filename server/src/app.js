import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// Browsers send the origin without a trailing slash, so strip one if it was pasted in.
const clientOrigin = process.env.CLIENT_URL?.trim().replace(/\/+$/, '');

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
