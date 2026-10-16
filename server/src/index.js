import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

try {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  // Without it the cors package would allow every origin.
  if (!process.env.CLIENT_URL?.trim()) throw new Error('CLIENT_URL is not set');
  await connectDB();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
