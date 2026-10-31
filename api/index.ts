import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Teach Arab',
    message: 'Backend API Teach Arab berjalan normal.',
    timestamp: new Date().toISOString()
  });
});

export default app;
